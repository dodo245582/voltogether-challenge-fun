
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authInitialized, profile } = useAuth();
  
  // If auth is not initialized yet, show loading state
  if (!authInitialized) {
    console.log("ProtectedRoute: Auth not initialized yet, showing loading state");
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
