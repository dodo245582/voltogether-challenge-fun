
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Logging to debug authentication state
    console.log("ProtectedRoute state:", { 
      user: !!user, 
      loading, 
      path: location.pathname,
      hasProfile: !!profile,
      profileName: profile?.name
    });
  }, [user, loading, location.pathname, profile]);
  
  // Quick return for authenticated users
  if (user && !loading) {
    // Special case for onboarding page
    if (location.pathname === '/onboarding') {
      // If user has completed onboarding (has a profile with name)
      if (profile?.name) {
        console.log("User already completed onboarding, redirecting to dashboard");
        return <Navigate to="/dashboard" replace />;
      }
      return <>{children}</>;
    }
    
    // Special case for dashboard
    if (location.pathname === '/dashboard') {
      // If user hasn't completed onboarding yet
      if (user && !profile?.name) {
        console.log("User needs to complete onboarding");
        return <Navigate to="/onboarding" replace />;
      }
    }
    
    // Show content for authenticated users
    return <>{children}</>;
  }
  
  // Show loading state for a very short time while checking authentication
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Fallback case - should never reach here
  return <>{children}</>;
};
