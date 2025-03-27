
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  
  // Fast path for already authenticated users
  if (user && !loading && profile) {
    // Fast path for dashboard when profile exists and is completed
    if (location.pathname === '/dashboard' && profile.profile_completed === true) {
      return <>{children}</>;
    }
    
    // Redirect to onboarding if profile not completed
    if (location.pathname !== '/onboarding' && profile.profile_completed !== true) {
      console.log("ProtectedRoute: Profile not completed, redirecting to onboarding");
      return <Navigate to="/onboarding" replace />;
    }
    
    // Redirect from onboarding to dashboard if profile is completed
    if (location.pathname === '/onboarding' && profile.profile_completed === true) {
      console.log("ProtectedRoute: Profile completed, redirecting from onboarding to dashboard");
      return <Navigate to="/dashboard" replace />;
    }
    
    // Show content for authenticated users with complete checks
    return <>{children}</>;
  }
  
  // Show minimal loading state only when absolutely necessary
  if (loading && user) {
    return <DashboardLoadingState />;
  }
  
  // Redirect to login if not authenticated and not loading
  if (!user && !loading) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Default loading state if we're still determining auth status
  return <DashboardLoadingState />;
};
