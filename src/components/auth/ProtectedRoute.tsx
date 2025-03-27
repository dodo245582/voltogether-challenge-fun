
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  
  // If user data is still loading, show loading state
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // If no user at all, redirect to login immediately
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if we're already on the onboarding route to prevent redirect loops
  const isOnboardingRoute = location.pathname === "/onboarding";
  
  // Only check profile completion if we're not already on onboarding
  if (!isOnboardingRoute && profile && !profile.profile_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // If we're on onboarding but profile is null, we should still show onboarding
  // This prevents unnecessary redirects while profile is loading
  
  // Render children if all checks pass
  return <>{children}</>;
};
