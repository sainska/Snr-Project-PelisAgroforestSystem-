import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  FileText, 
  TrendingUp, 
  Users, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Upload,
  ShoppingCart,
  MessageSquare,
  Navigation,
  Sprout,
  History
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import PlotApplicationModal from "./PlotApplicationModal";
import CropReportModal from "./CropReportModal";
import ReportsModal from "./ReportsModal";
import MarketplaceModal from "./MarketplaceModal";
import MessagesModal from "./MessagesModal";
import DirectionsModal from "./DirectionsModal";
import ManageOfficialsModal from "./ManageOfficialsModal";
import NotificationsModal from "./NotificationsModal";
import EditProfileModal from "./UserProfile";
import { Database } from "@/types/supabase";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
type MarketplaceListing = Database['public']['Tables']['marketplace_listings']['Row'];

interface EnhancedDashboardProps {
  notificationsModalOpen: boolean;
  setNotificationsModalOpen: (open: boolean) => void;
  editProfileModalOpen: boolean;
  setEditProfileModalOpen: (open: boolean) => void;
}

const EnhancedDashboard = ({
  notificationsModalOpen,
  setNotificationsModalOpen,
  editProfileModalOpen,
  setEditProfileModalOpen,
}: EnhancedDashboardProps) => {
  const { profile, checkAccountStatus, user } = useAuth();
  const [accountStatus, setAccountStatus] = useState({
    isApproved: false,
    paymentVerified: false,
    emailVerified: false,
    faceVerified: false,
  });
  const [dashboardStats, setDashboardStats] = useState({
    myApplications: 0,
    myCropReports: 0,
    myListings: 0,
    trustScore: 0,
    notifications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);

  // Modal states
  const [plotApplicationModalOpen, setPlotApplicationModalOpen] = useState(false);
  const [cropReportModalOpen, setCropReportModalOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [marketplaceModalOpen, setMarketplaceModalOpen] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [directionsModalOpen, setDirectionsModalOpen] = useState(false);
  const [manageOfficialsModalOpen, setManageOfficialsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !profile) return;

      try {
        setIsLoading(true);

        // Check account status
        const status = await checkAccountStatus();
        setAccountStatus(status);

        // Fetch dashboard statistics
        const [
          applicationsRes, 
          cropReportsRes, 
          notificationsRes,
          marketplaceRes,
          recentActivityRes
        ] = await Promise.all([
          supabase.from('plot_applications')
            .select('id, status')
            .eq('applicant_id', user.id),
          supabase.from('crop_reports')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id),
          supabase.from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false),
          supabase.from('marketplace_listings')
            .select('id', { count: 'exact', head: true })
            .eq('vendor_id', user.id)
            .eq('status', 'available'),
          supabase.from('activity_log')
            .select('*')
            .or(`user_id.eq.${user.id},related_user_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        // Process application statistics
        const applications = applicationsRes.data || [];
        const approvedApplications = applications.filter(app => app.status === 'Approved').length;
        const pendingApplications = applications.filter(app => app.status === 'Pending' || app.status === 'Under Review').length;
        const rejectedApplications = applications.filter(app => app.status === 'Rejected').length;

        setDashboardStats({
          myApplications: applications.length,
          myCropReports: cropReportsRes.count || 0,
          myListings: marketplaceRes.count || 0,
          trustScore: profile.trust_score || 0,
          notifications: notificationsRes.count || 0,
          approvedApplications,
          pendingApplications,
          rejectedApplications
        });

        setRecentActivity(recentActivityRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile, checkAccountStatus]);

  const getAccountStatusIcon = () => {
    if (accountStatus.isApproved) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (accountStatus.paymentVerified && accountStatus.emailVerified) {
      return <Clock className="h-5 w-5 text-yellow-600" />;
    } else {
      return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getAccountStatusText = () => {
    if (accountStatus.isApproved) {
      return "Account Approved ✓";
    } else if (accountStatus.paymentVerified && accountStatus.emailVerified) {
      return "Pending Officer Approval";
    } else {
      return "Account Setup Incomplete";
    }
  };

  const quickActions = [
    {
      title: "Apply for Plot",
      description: "Submit a new plot application",
      icon: <MapPin className="h-6 w-6" />,
      action: () => setPlotApplicationModalOpen(true),
      disabled: !accountStatus.isApproved,
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      title: "Submit Crop Report",
      description: "Report your crop activities",
      icon: <Sprout className="h-6 w-6" />,
      action: () => setCropReportModalOpen(true),
      disabled: !accountStatus.isApproved,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Reports & Applications",
      description: "See your reports and applications",
      icon: <History className="h-6 w-6" />,
      action: () => setReportsModalOpen(true),
      disabled: false,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Marketplace",
      description: "Buy/sell farm products",
      icon: <ShoppingCart className="h-6 w-6" />,
      action: () => setMarketplaceModalOpen(true),
      disabled: !accountStatus.isApproved,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Messages",
      description: "Community communications",
      icon: <MessageSquare className="h-6 w-6" />,
      action: () => setMessagesModalOpen(true),
      disabled: false,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Community Directions",
      description: "Find NNECFA locations",
      icon: <Navigation className="h-6 w-6" />,
      action: () => setDirectionsModalOpen(true),
      disabled: false,
      color: "bg-teal-500 hover:bg-teal-600",
    },
    {
      title: "Manage Officials",
      description: "Create and manage NNECFA Officials",
      icon: <Users className="h-6 w-6" />,
      action: () => setManageOfficialsModalOpen(true),
      disabled: profile?.role !== 'NNECFA Admin',
      color: "bg-purple-500 hover:bg-purple-600",
      adminOnly: true,
    },
  ];

  // Filter quick actions based on user role
  const filteredQuickActions = quickActions.filter(action => {
    // If action is admin-only, only show for NNECFA Admin
    if (action.adminOnly) {
      return profile?.role === 'NNECFA Admin';
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        <p className="ml-2 text-emerald-700">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-emerald-800">
              Welcome, {profile?.name || 'User'}
            </h1>
            <p className="text-emerald-600">
              Nandi North Escarpment Community Forest Association
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {getAccountStatusIcon()}
            <span className="text-sm font-medium">{getAccountStatusText()}</span>
          </div>
        </div>

        {/* Account Status Alert */}
        {!accountStatus.isApproved && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {!accountStatus.emailVerified && "Please verify your email address. "}
              {!accountStatus.paymentVerified && "Please complete your membership payment. "}
              {accountStatus.emailVerified && accountStatus.paymentVerified && 
                "Your account is under review by NNECFA officers. "}
              {!accountStatus.isApproved && "Some features are restricted until approval."}
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Plot Applications</p>
                  <p className="text-2xl font-bold text-emerald-800">{dashboardStats.myApplications}</p>
                  <div className="flex space-x-2 mt-1">
                    <Badge variant="outline" className="text-green-600">
                      {dashboardStats.approvedApplications} Approved
                    </Badge>
                    <Badge variant="outline" className="text-yellow-600">
                      {dashboardStats.pendingApplications} Pending
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Sprout className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Crop Reports</p>
                  <p className="text-2xl font-bold text-blue-800">{dashboardStats.myCropReports}</p>
                  <p className="text-sm text-blue-600 mt-1">Active Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Marketplace</p>
                  <p className="text-2xl font-bold text-orange-800">{dashboardStats.myListings}</p>
                  <p className="text-sm text-orange-600 mt-1">Active Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Trust Score</p>
                  <p className="text-2xl font-bold text-purple-800">{dashboardStats.trustScore}</p>
                  <p className="text-sm text-purple-600 mt-1">Community Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuickActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  disabled={action.disabled}
                  className={`h-auto p-4 flex flex-col items-center space-y-2 text-white ${action.color} ${
                    action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  variant="default"
                >
                  {action.icon}
                  <div className="text-center">
                    <p className="font-semibold">{action.title}</p>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                  {action.disabled && (
                    <Badge variant="secondary" className="text-xs">
                      {action.disabled === true ? 'Requires Approval' : action.disabled}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-800">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{profile?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">National ID</p>
                  <p className="font-medium">{profile?.national_id || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{profile?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{profile?.location || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <Badge variant="outline">{profile?.role}</Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setEditProfileModalOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              {profile?.role === 'NNECFA Admin' && (
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                  onClick={() => window.location.href = '/admin'}
                >
                  <Settings className="h-4 w-4 mr-2 text-emerald-600" />
                  Access Admin Dashboard
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-800">Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Verification</span>
                  {accountStatus.emailVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Verification</span>
                  {accountStatus.paymentVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Face Verification</span>
                  {accountStatus.faceVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Approval</span>
                  {accountStatus.isApproved ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity to display</p>
                <p className="text-sm">Your plot applications, crop reports, and marketplace activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.type === 'application' && <FileText className="h-5 w-5 text-emerald-600" />}
                      {activity.type === 'report' && <Sprout className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'marketplace' && <ShoppingCart className="h-5 w-5 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                    </div>
                    {activity.status && (
                      <Badge
                        className={
                          activity.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          activity.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PlotApplicationModal
        isOpen={plotApplicationModalOpen}
        onClose={() => setPlotApplicationModalOpen(false)}
      />
      <CropReportModal
        isOpen={cropReportModalOpen}
        onClose={() => setCropReportModalOpen(false)}
      />
      <ReportsModal
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
      />
      <MarketplaceModal
        isOpen={marketplaceModalOpen}
        onClose={() => setMarketplaceModalOpen(false)}
      />
      <MessagesModal
        isOpen={messagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
      />
      <DirectionsModal
        isOpen={directionsModalOpen}
        onClose={() => setDirectionsModalOpen(false)}
      />
      {profile?.role === 'NNECFA Admin' && (
        <ManageOfficialsModal
          isOpen={manageOfficialsModalOpen}
          onClose={() => setManageOfficialsModalOpen(false)}
        />
      )}
      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
      />
      <EditProfileModal
        isOpen={editProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
      />
    </div>
  );
};

export default EnhancedDashboard;
