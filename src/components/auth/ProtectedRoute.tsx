
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  
  // Show loading state while auth is being checked
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If profile is not completed and not already on onboarding, redirect to onboarding
  const isOnboardingRoute = location.pathname === "/onboarding";
  if (profile && !profile.profile_completed && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Render children if all checks pass
  return <>{children}</>;
};
