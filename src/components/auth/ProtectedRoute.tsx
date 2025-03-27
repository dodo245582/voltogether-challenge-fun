
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  
  // Abbreviate logging to reduce processing overhead
  useEffect(() => {
    console.log("ProtectedRoute:", { 
      path: location.pathname,
      hasUser: !!user, 
      loading,
      hasProfile: !!profile
    });
  }, [user, loading, location.pathname, profile]);
  
  // Show loading state only if necessary
  if (loading && !profile) {
    return <DashboardLoadingState />;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Basic profile validation - optimized to reduce computations
  const hasValidProfile = !!profile && 
    !!profile.id && 
    (!!profile.name || !!profile.city);
  
  // Handle routing based on profile status
  if (location.pathname !== '/onboarding' && !hasValidProfile) {
    return <Navigate to="/onboarding" replace />;
  }
  
  if (location.pathname === '/onboarding' && hasValidProfile) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show content for authenticated users
  return <>{children}</>;
};
