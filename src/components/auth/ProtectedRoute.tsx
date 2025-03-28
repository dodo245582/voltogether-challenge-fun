
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile, authInitialized } = useAuth();
  const location = useLocation();
  
  // Show minimal loading only during initial auth check
  if (!authInitialized) {
    return <DashboardLoadingState />;
  }
  
  // No user = redirect to login immediately
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if already on onboarding
  const isOnboardingRoute = location.pathname === "/onboarding";
  
  // Onboarding redirect check - only if not already on onboarding
  if (!isOnboardingRoute && profile && !profile.profile_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Don't show loading on onboarding page
  if (loading && !isOnboardingRoute) {
    return <DashboardLoadingState />;
  }
  
  // Render content immediately for all other cases
  return <>{children}</>;
};
