
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  
  // Show loading while auth is being determined
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // If no user, redirect to login
  if (!user) {
    console.log("Protected route - User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If profile is not completed and not already on onboarding, redirect to onboarding
  if (profile && !profile.profile_completed && location.pathname !== "/onboarding") {
    console.log("Protected route - Profile not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Render children if all checks pass
  return <>{children}</>;
};
