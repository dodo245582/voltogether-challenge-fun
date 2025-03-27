
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const [shouldRender, setShouldRender] = useState(false);
  
  // Simple and direct handling of redirection
  useEffect(() => {
    // Only handle routing after loading is complete
    if (!loading) {
      setShouldRender(true);
    }
  }, [loading]);
  
  // Show loading state while auth is being checked
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to onboarding if profile not complete
  if (profile && !profile.profile_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // Render children when it's safe to do so
  return shouldRender ? <>{children}</> : <DashboardLoadingState />;
};
