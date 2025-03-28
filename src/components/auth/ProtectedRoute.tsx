
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authInitialized } = useAuth();
  
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
  
  // If we have a user, render the protected content
  return <>{children}</>;
};
