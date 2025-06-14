import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import NotFound from '@/pages/NotFound';
import { authService } from '@/services/authService';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';

function App() {
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        const created = await authService.createFirstAdminAccount();
        if (created) {
          console.log('First admin account created successfully');
        }
      } catch (error) {
        console.error('Error initializing admin account:', error);
      }
    };

    initializeAdmin();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/reset-password" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
