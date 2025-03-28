
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authInitialized, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Set a failsafe timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("ProtectedRoute: Safety timeout triggered, forcing navigation decision");
      setIsLoading(false);
    }, 2000); // 2 second max loading state
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Handle authentication state
  useEffect(() => {
    if (authInitialized) {
      console.log("ProtectedRoute: Auth initialized, making navigation decision");
      setIsLoading(false);
    }
  }, [authInitialized]);
  
  // Show loading state while checking auth
  if (isLoading) {
    return <DashboardLoadingState />;
  }
  
  // No user = redirect to login
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // User exists but profile not completed = redirect to onboarding
  if (user && profile && !profile.profile_completed) {
    console.log("ProtectedRoute: User found but profile not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // User with completed profile (or no profile yet) = render protected content
  console.log("ProtectedRoute: Rendering protected content");
  return <>{children}</>;
};
