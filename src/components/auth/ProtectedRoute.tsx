
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile, authInitialized } = useAuth();
  const location = useLocation();
  
  // If auth is not initialized, show minimal loading state
  if (!authInitialized) {
    return <DashboardLoadingState />;
  }
  
  // If no user at all, redirect to login immediately
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Check if we're already on the onboarding route to prevent redirect loops
  const isOnboardingRoute = location.pathname === "/onboarding";
  
  // If still loading profile data but we have user, render children or loading state
  // depending on whether we're on onboarding route
  if (loading) {
    if (isOnboardingRoute) {
      // Don't show loading on onboarding page to avoid delays
      console.log("ProtectedRoute: On onboarding page, showing onboarding without waiting for profile");
      return <>{children}</>;
    }
    return <DashboardLoadingState />;
  }
  
  // Only check profile completion if we're not already on onboarding
  if (!isOnboardingRoute && profile && !profile.profile_completed) {
    console.log("ProtectedRoute: Profile not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Render children if all checks pass
  console.log("ProtectedRoute: Rendering protected content");
  return <>{children}</>;
};
