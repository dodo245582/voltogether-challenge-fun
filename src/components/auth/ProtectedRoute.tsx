
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  
  // If user is not authenticated, redirect to login
  if (!user && !loading) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Show loading state only when necessary
  if (loading && !profile) {
    return <DashboardLoadingState />;
  }
  
  // Check if profile exists and is completed
  const hasValidProfile = !!profile && !!profile.id && profile.profile_completed === true;
  
  // Fast path for dashboard when profile exists and is completed
  if (location.pathname === '/dashboard' && hasValidProfile) {
    return <>{children}</>;
  }
  
  // Handle routing based on profile status
  if (location.pathname !== '/onboarding' && !hasValidProfile) {
    console.log("ProtectedRoute: No valid profile, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  if (location.pathname === '/onboarding' && hasValidProfile) {
    console.log("ProtectedRoute: Valid profile found, redirecting from onboarding to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show content for authenticated users
  return <>{children}</>;
};
