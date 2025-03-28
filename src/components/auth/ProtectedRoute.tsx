
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authInitialized, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simplified auth check with clear console logs
  useEffect(() => {
    console.log("ProtectedRoute: Auth state:", { 
      user: !!user, 
      authInitialized, 
      profile: !!profile,
      profileCompleted: profile?.profile_completed 
    });
    
    if (authInitialized) {
      setIsLoading(false);
    }
  }, [authInitialized, user, profile]);
  
  // Show loading state for maximum 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("ProtectedRoute: Force ending loading state after timeout");
        setIsLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if (isLoading) {
    return <DashboardLoadingState />;
  }
  
  // If no user, redirect to login
  if (!user) {
    console.log("ProtectedRoute: No authenticated user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If user exists but profile is not completed, redirect to onboarding
  // ONLY if we're not already on the onboarding page
  if (user && profile && !profile.profile_completed && window.location.pathname !== '/onboarding') {
    console.log("ProtectedRoute: Profile not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // User with completed profile or already on onboarding page - render content
  console.log("ProtectedRoute: Rendering protected content");
  return <>{children}</>;
};
