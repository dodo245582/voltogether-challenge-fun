
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
      profileDetails: profile ? {
        id: profile.id,
        name: profile.name,
        completed_challenges: profile.completed_challenges,
        city: profile.city
      } : null
    });
  }, [user, loading, location.pathname, profile]);
  
  // Show loading state while checking authentication
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Properly check profile validity - fixed the TypeError
  const hasValidProfile = !!profile && 
                          typeof profile.name === 'string' && 
                          profile.name.trim() !== '';
  
  console.log("Profile validation check:", {
    profile,
    name: profile?.name,
    nameType: typeof profile?.name,
    hasValidProfile,
    isOnboarding: location.pathname === '/onboarding'
  });
  
  // If user is authenticated but hasn't completed onboarding (no valid profile)
  if (location.pathname !== '/onboarding' && !hasValidProfile) {
    console.log("User needs to complete onboarding, redirecting");
    return <Navigate to="/onboarding" replace />;
  }
  
  // If user is authenticated and has completed onboarding, but tries to access onboarding page again
  if (location.pathname === '/onboarding' && hasValidProfile) {
    console.log("User already completed onboarding, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Show content for authenticated users
  return <>{children}</>;
};
