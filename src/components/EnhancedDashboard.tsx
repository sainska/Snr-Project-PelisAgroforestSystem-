import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Navigation
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const EnhancedDashboard = () => {
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
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !profile) return;

      try {
        setIsLoading(true);

        // Check account status
        const status = await checkAccountStatus();
        setAccountStatus(status);

        // Fetch dashboard statistics
        const [applicationsRes, cropReportsRes, notificationsRes] = await Promise.all([
          supabase.from('plot_applications').select('id', { count: 'exact', head: true }).eq('applicant_id', user.id),
          supabase.from('crop_reports').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
        ]);

        setDashboardStats({
          myApplications: applicationsRes.count || 0,
          myCropReports: cropReportsRes.count || 0,
          myListings: 0, // This would be implemented when marketplace is added
          trustScore: profile.trust_score || 0,
          notifications: notificationsRes.count || 0,
        });
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
      action: () => toast({ title: "Plot Application", description: "Plot application form will open here" }),
      disabled: !accountStatus.isApproved,
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      title: "Submit Crop Report",
      description: "Report your crop activities",
      icon: <FileText className="h-6 w-6" />,
      action: () => toast({ title: "Crop Report", description: "Crop report form will open here" }),
      disabled: !accountStatus.isApproved,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Reports",
      description: "See your reports and history",
      icon: <TrendingUp className="h-6 w-6" />,
      action: () => toast({ title: "Reports", description: "Reports section will open here" }),
      disabled: false,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Marketplace",
      description: "Buy/sell farm products",
      icon: <ShoppingCart className="h-6 w-6" />,
      action: () => toast({ title: "Marketplace", description: "Marketplace will open here" }),
      disabled: !accountStatus.isApproved,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Messages",
      description: "Community communications",
      icon: <MessageSquare className="h-6 w-6" />,
      action: () => toast({ title: "Messages", description: "Messages will open here" }),
      disabled: false,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Community Directions",
      description: "Find NNECFA locations",
      icon: <Navigation className="h-6 w-6" />,
      action: () => toast({ title: "Directions", description: "Map directions will open here" }),
      disabled: false,
      color: "bg-teal-500 hover:bg-teal-600",
    },
  ];

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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-emerald-800">{dashboardStats.myApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Crop Reports</p>
                  <p className="text-2xl font-bold text-blue-800">{dashboardStats.myCropReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">My Listings</p>
                  <p className="text-2xl font-bold text-orange-800">{dashboardStats.myListings}</p>
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
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-indigo-800">{dashboardStats.notifications}</p>
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
              {quickActions.map((action, index) => (
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
                      Requires Approval
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
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-800">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-500 py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity to display</p>
              <p className="text-sm">Your plot applications, crop reports, and marketplace activity will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedDashboard;