
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile, authInitialized } = useAuth();
  const location = useLocation();
  
  // If auth is not initialized or user data is still loading, show loading state
  if (!authInitialized || loading) {
    return <DashboardLoadingState />;
  }
  
  // If no user at all, redirect to login immediately
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Check if we're already on the onboarding route to prevent redirect loops
  const isOnboardingRoute = location.pathname === "/onboarding";
  
  // Only check profile completion if we're not already on onboarding
  if (!isOnboardingRoute && profile && !profile.profile_completed) {
    console.log("ProtectedRoute: Profile not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Render children if all checks pass
  console.log("ProtectedRoute: Rendering protected content");
  return <>{children}</>;
};
