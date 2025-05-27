
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, FileText, AlertTriangle, Users, Sprout } from "lucide-react";

interface DashboardStatsProps {
  userRole: string;
}

const DashboardStats = ({ userRole }: DashboardStatsProps) => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalPlots: 0,
    assignedPlots: 0,
    availablePlots: 0,
    pendingApplications: 0,
    cropReports: 0,
    monitoringRecords: 0,
    violations: 0,
    userCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      
      try {
        // Fetch plots statistics
        const { data: plotsData, error: plotsError } = await supabase
          .from('plots')
          .select('status, id', { count: 'exact' });
          
        if (plotsError) throw plotsError;
        
        const availablePlots = plotsData?.filter(plot => plot.status === 'Available').length || 0;
        const assignedPlots = plotsData?.filter(plot => plot.status === 'Assigned' || plot.status === 'Active').length || 0;
        
        // Fetch applications count
        const { count: pendingApplications, error: applicationsError } = await supabase
          .from('plot_applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Pending');
          
        if (applicationsError) throw applicationsError;
        
        // Fetch crop reports
        let cropReportsQuery = supabase.from('crop_reports').select('*', { count: 'exact', head: true });
        if (profile?.role === 'Community Member') {
          cropReportsQuery = cropReportsQuery.eq('user_id', profile.id);
        }
        const { count: cropReports, error: cropReportsError } = await cropReportsQuery;
        if (cropReportsError) throw cropReportsError;
        
        // Fetch monitoring records
        let monitoringQuery = supabase.from('monitoring_records').select('*', { count: 'exact', head: true });
        if (profile?.role === 'Officer') {
          monitoringQuery = monitoringQuery.eq('officer_id', profile.id);
        }
        const { count: monitoringRecords, error: monitoringError } = await monitoringQuery;
        if (monitoringError) throw monitoringError;

        // Fetch violations
        const { count: violations, error: violationsError } = await supabase
          .from('violations')
          .select('*', { count: 'exact', head: true })
          .eq('resolved', false);
        if (violationsError) throw violationsError;
        
        // Fetch user count (admin only)
        let userCount = 0;
        if (profile?.role === 'Admin') {
          const { count, error: userError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
            
          if (userError) throw userError;
          userCount = count || 0;
        }
        
        setStats({
          totalPlots: plotsData?.length || 0,
          assignedPlots,
          availablePlots,
          pendingApplications: pendingApplications || 0,
          cropReports: cropReports || 0,
          monitoringRecords: monitoringRecords || 0,
          violations: violations || 0,
          userCount
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (profile) {
      fetchStats();
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="border-emerald-200 opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-lg">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-emerald-800">Dashboard Overview</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-emerald-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-800 text-lg flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-emerald-600" />
              Total Plots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{stats.totalPlots}</div>
            <p className="text-emerald-600 text-sm mt-1">
              {stats.assignedPlots} assigned, {stats.availablePlots} available
            </p>
          </CardContent>
        </Card>
        
        {profile?.role !== 'Community Member' && (
          <Card className="border-emerald-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                Pending Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">{stats.pendingApplications}</div>
              <p className="text-emerald-600 text-sm mt-1">
                Awaiting review
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card className="border-emerald-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-emerald-800 text-lg flex items-center">
              <Sprout className="w-5 h-5 mr-2 text-emerald-600" />
              Crop Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{stats.cropReports}</div>
            <p className="text-emerald-600 text-sm mt-1">
              {profile?.role === 'Community Member' ? 'Your reports' : 'Total reports'}
            </p>
          </CardContent>
        </Card>
        
        {(profile?.role === 'Officer' || profile?.role === 'Admin') && (
          <Card className="border-emerald-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-emerald-600" />
                Monitoring Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">{stats.monitoringRecords}</div>
              <p className="text-emerald-600 text-sm mt-1">
                {profile?.role === 'Officer' ? 'Your records' : 'Total records'}
              </p>
            </CardContent>
          </Card>
        )}
        
        {(profile?.role === 'Officer' || profile?.role === 'Admin') && (
          <Card className="border-emerald-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
                Open Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{stats.violations}</div>
              <p className="text-emerald-600 text-sm mt-1">
                Unresolved issues
              </p>
            </CardContent>
          </Card>
        )}
        
        {profile?.role === 'Admin' && (
          <Card className="border-emerald-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-emerald-600" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">{stats.userCount}</div>
              <p className="text-emerald-600 text-sm mt-1">
                Registered in the system
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardStats;
