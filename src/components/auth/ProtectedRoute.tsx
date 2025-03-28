
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile, authInitialized } = useAuth();
  const location = useLocation();
  
  // Fast path: if not initialized, show minimal loading
  if (!authInitialized) {
    return <DashboardLoadingState />;
  }
  
  // Fast path: if no user at all, redirect immediately
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Check if we're already on the onboarding route
  const isOnboardingRoute = location.pathname === "/onboarding";
  
  // Only check profile completion if we have a profile and we're not already on onboarding
  // This prevents unnecessary redirects
  if (!isOnboardingRoute && profile && !profile.profile_completed) {
    console.log("ProtectedRoute: Profile not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Don't wait for profile loading on onboarding route
  if (loading && !isOnboardingRoute) {
    return <DashboardLoadingState />;
  }
  
  // Render children immediately for all other cases
  console.log("ProtectedRoute: Rendering protected content");
  return <>{children}</>;
};
