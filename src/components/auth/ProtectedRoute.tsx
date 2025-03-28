
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authInitialized, profile, refreshProfile } = useAuth();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  
  // Fetch profile data if needed
  useEffect(() => {
    if (authInitialized && user && !profile && !isCheckingProfile && !profileChecked) {
      setIsCheckingProfile(true);
      console.log("ProtectedRoute: Fetching profile data for user", user.id);
      
      refreshProfile(user.id)
        .then(() => {
          console.log("ProtectedRoute: Profile data fetched");
          setProfileChecked(true);
        })
        .catch(err => {
          console.error("ProtectedRoute: Failed to fetch profile", err);
          setProfileChecked(true);
        })
        .finally(() => {
          setIsCheckingProfile(false);
        });
    } else if (authInitialized && !user) {
      // Mark as checked if no user
      setProfileChecked(true);
    } else if (authInitialized && user && profile) {
      // Mark as checked if we already have profile
      setProfileChecked(true);
    }
  }, [user, authInitialized, profile, refreshProfile, isCheckingProfile, profileChecked]);
  
  // If auth is not initialized yet or we're checking the profile, show loading state
  if (!authInitialized || isCheckingProfile) {
    console.log("ProtectedRoute: Auth not fully initialized yet, showing loading state");
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
