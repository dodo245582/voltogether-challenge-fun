
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  
  // Store the current route to prevent redirect loops
  useEffect(() => {
    if (!loading && user) {
      sessionStorage.setItem('lastAuthenticatedRoute', location.pathname);
    }
  }, [loading, user, location.pathname]);
  
  // First, handle loading state
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // Then, check if user is authenticated
  if (!user) {
    console.log("Protected route - User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If user exists but profile is not completed, redirect to onboarding
  // Skip this check if we're already on the onboarding page
  if (profile && !profile.profile_completed && location.pathname !== "/onboarding") {
    console.log("Protected route - Profile not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Render children when it's safe to do so
  return <>{children}</>;
};
