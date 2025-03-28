
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authInitialized, profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      // Wait for auth to initialize
      if (!authInitialized) return;
      
      console.log("ProtectedRoute: Auth state:", { 
        hasUser: !!user, 
        hasProfile: !!profile, 
        authInitialized 
      });
      
      // Simple case: No user = redirect to login
      if (!user) {
        console.log("ProtectedRoute: No user, will redirect to login");
        if (mounted) setIsLoading(false);
        return;
      }
      
      // If we have a user but no profile, try to fetch it ONCE
      if (user && !profile) {
        console.log("ProtectedRoute: User exists but no profile, fetching profile");
        try {
          await refreshProfile(user.id);
        } catch (err) {
          console.error("ProtectedRoute: Error fetching profile", err);
        }
      }
      
      // Whether profile fetch succeeded or not, continue with what we have
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
    return <DashboardLoadingState />;
  }
  
  // If no user after auth is initialized, redirect to login
  if (!user) {
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
