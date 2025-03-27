
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Prevent infinite redirection loops
  useEffect(() => {
    if (!loading && user && profile && !profile.profile_completed && !redirectAttempted) {
      console.log("User profile not complete, redirecting to onboarding");
      setRedirectAttempted(true);
      // Using replace to avoid navigation history issues
      navigate('/onboarding', { replace: true });
    }
  }, [user, loading, profile, navigate, redirectAttempted]);
  
  // Show loading state only when checking auth
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // Fast path - if no user, redirect to login immediately
  if (!user) {
    console.log("No authenticated user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // User is authenticated, render the children
  return <>{children}</>;
};
