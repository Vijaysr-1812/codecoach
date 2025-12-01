import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

// You can add a loading spinner component here
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div>Loading...</div>
  </div>
);

const ProtectedRoute = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    // If no session, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If there is a session, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;