
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  
  // Only check protection logic once fully loaded
  useEffect(() => {
    if (!loading) {
      setIsReady(true);
    }
  }, [loading]);
  
  // Only perform navigation when all data is ready
  if (!isReady || loading) {
    return <DashboardLoadingState />;
  }
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If profile is not completed and not already on onboarding, redirect to onboarding
  const isOnboarding = location.pathname === "/onboarding";
  if (profile && !profile.profile_completed && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Render children if all checks pass
  return <>{children}</>;
};
