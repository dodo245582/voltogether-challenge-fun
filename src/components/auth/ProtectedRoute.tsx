
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authInitialized, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch profile data if needed
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      if (!authInitialized) return;
      
      if (user && !profile) {
        console.log("ProtectedRoute: Fetching profile data for user", user.id);
        
        try {
          await refreshProfile(user.id);
        } catch (err) {
          console.error("ProtectedRoute: Failed to fetch profile", err);
        }
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
    };
  }, [user, authInitialized, profile, refreshProfile]);
  
  // Show loading state while checking authentication
  if (!authInitialized || isLoading) {
    console.log("ProtectedRoute: Still initializing or loading, showing loading state");
    return <DashboardLoadingState />;
  }
  
  // If no user after auth is initialized, redirect to login
  if (!user) {
    console.log("ProtectedRoute: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If user exists but profile is not completed, redirect to onboarding
  if (user && profile && !profile.profile_completed) {
    console.log("ProtectedRoute: User found but profile not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // If we have a user with a completed profile, render the protected content
  console.log("ProtectedRoute: User authenticated with completed profile, rendering protected content");
  return <>{children}</>;
};
