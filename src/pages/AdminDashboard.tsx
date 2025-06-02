import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, AlertTriangle, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ManageOfficialsModal from "@/components/ManageOfficialsModal";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [manageOfficialsModalOpen, setManageOfficialsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalOfficials: 0,
    activeViolations: 0
  });

  // Fetch admin statistics
  const fetchAdminStats = async () => {
    try {
      const [usersCount, pendingCount, officialsCount, violationsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .eq('account_approved', false),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
          .eq('role', 'NNECFA Official'),
        supabase.from('violations').select('*', { count: 'exact', head: true })
          .eq('resolved', false)
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        pendingApprovals: pendingCount.count || 0,
        totalOfficials: officialsCount.count || 0,
        activeViolations: violationsCount.count || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-emerald-800">
                NNECFA Administration
              </h1>
              <p className="text-emerald-600">
                System Administration Dashboard
              </p>
            </div>
            <Button variant="outline" onClick={() => setManageOfficialsModalOpen(true)}>
              <Users className="h-4 w-4 mr-2" />
              Manage Officials
            </Button>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-emerald-800">{stats.totalUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.pendingApprovals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">NNECFA Officials</p>
                    <p className="text-2xl font-bold text-purple-800">{stats.totalOfficials}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Violations</p>
                    <p className="text-2xl font-bold text-red-800">{stats.activeViolations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-800">Administrative Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button
                  className="h-auto p-4 flex flex-col items-center space-y-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => setManageOfficialsModalOpen(true)}
                >
                  <Users className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">Manage Officials</p>
                    <p className="text-xs opacity-90">Create and manage NNECFA Officials</p>
                  </div>
                </Button>

                <Button
                  className="h-auto p-4 flex flex-col items-center space-y-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <FileText className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">Review Applications</p>
                    <p className="text-xs opacity-90">Review pending user applications</p>
                  </div>
                </Button>

                <Button
                  className="h-auto p-4 flex flex-col items-center space-y-2 bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Settings className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-semibold">System Settings</p>
                    <p className="text-xs opacity-90">Configure system parameters</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <ManageOfficialsModal
          isOpen={manageOfficialsModalOpen}
          onClose={() => setManageOfficialsModalOpen(false)}
        />
      </div>
    </AdminProtectedRoute>
  );
};

export default AdminDashboard; 
