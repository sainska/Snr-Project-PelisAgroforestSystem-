import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'NNECFA Admin' | 'NNECFA Official';
}

const AdminProtectedRoute = ({ children, requiredRole = 'NNECFA Admin' }: AdminProtectedRouteProps) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        <p className="ml-2 text-emerald-700">Verifying access...</p>
      </div>
    );
  }

  // Check if user has required role
  const hasAccess = requiredRole === 'NNECFA Official' 
    ? profile?.role === 'NNECFA Admin' || profile?.role === 'NNECFA Official'
    : profile?.role === 'NNECFA Admin';

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute; 
