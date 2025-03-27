
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  
  useEffect(() => {
    if (user && refreshProfile && !refreshAttempted) {
      console.log("ProtectedRoute: Refreshing profile data for user:", user.id);
      setIsRefreshing(true);
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log("ProtectedRoute: Profile refresh timeout reached");
        setIsRefreshing(false);
        setRefreshAttempted(true);
      }, 5000); // 5 seconds timeout
      
      refreshProfile(user.id)
        .then(() => {
          console.log("ProtectedRoute: Profile refresh completed");
          clearTimeout(timeoutId);
          setIsRefreshing(false);
          setRefreshAttempted(true);
        })
        .catch(error => {
          console.error("ProtectedRoute: Error refreshing profile:", error);
          clearTimeout(timeoutId);
          setIsRefreshing(false);
          setRefreshAttempted(true);
        });
    }
  }, [user, refreshProfile, refreshAttempted]);
  
  // Show loading state only when truly necessary and with a maximum duration
  if ((loading || isRefreshing) && !refreshAttempted) {
    return <DashboardLoadingState />;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Check if profile exists and is completed
  const hasValidProfile = !!profile && !!profile.id && profile.profile_completed === true;
  
  // Fast path for dashboard when profile exists and is completed
  if (location.pathname === '/dashboard' && hasValidProfile) {
    console.log("ProtectedRoute: Valid profile found, allowing dashboard access");
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
