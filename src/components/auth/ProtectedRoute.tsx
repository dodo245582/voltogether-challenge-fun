
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authInitialized } = useAuth();
  
  // Not initialized = show minimal loading
  if (!authInitialized) {
    return <DashboardLoadingState />;
  }
  
  // No user = redirect to login immediately
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Render content immediately - profile checks happen in the specific pages
  return <>{children}</>;
};
