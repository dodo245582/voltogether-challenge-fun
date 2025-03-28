
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile, authInitialized } = useAuth();
  const location = useLocation();
  
  // Not initialized = show minimal loading
  if (!authInitialized) {
    return <DashboardLoadingState />;
  }
  
  // No user = redirect to login immediately
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Fast path: Already on onboarding page - don't check profile
  const isOnboardingRoute = location.pathname === "/onboarding";
  
  // Fast path: Check if profile is incomplete and not on onboarding
  if (!isOnboardingRoute && profile && !profile.profile_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Fast path: Hide loading on onboarding page 
  if (loading && !isOnboardingRoute) {
    return <DashboardLoadingState />;
  }
  
  // Fast path: Render content immediately
  return <>{children}</>;
};
