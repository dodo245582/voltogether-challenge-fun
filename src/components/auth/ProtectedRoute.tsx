
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authInitialized, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [timeoutExpired, setTimeoutExpired] = useState(false);
  const navigate = useNavigate();
  
  // Set a failsafe timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("ProtectedRoute: Safety timeout triggered after 3 seconds");
      setTimeoutExpired(true);
      setIsLoading(false);
    }, 3000); // 3 second max loading state
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Force navigation to dashboard after a longer timeout as ultimate fallback
  useEffect(() => {
    const ultimateFallbackId = setTimeout(() => {
      console.log("ProtectedRoute: Ultimate fallback triggered - forcing navigation");
      if (document.location.pathname !== '/login' && document.location.pathname !== '/register') {
        console.log("Still on protected route after 5 seconds, redirecting to dashboard or login");
        if (localStorage.getItem('supabase.auth.token')) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }
    }, 5000); // 5 second ultimate fallback
    
    return () => clearTimeout(ultimateFallbackId);
  }, [navigate]);
  
  // Handle authentication state
  useEffect(() => {
    if (authInitialized) {
      console.log("ProtectedRoute: Auth initialized, making navigation decision");
      setIsLoading(false);
    }
  }, [authInitialized]);
  
  // Timeout expired but still no auth decision - base decision on localStorage
  if (timeoutExpired && isLoading) {
    console.log("ProtectedRoute: Timeout expired, making decision based on localStorage");
    const hasAuthToken = !!localStorage.getItem('supabase.auth.token');
    
    if (!hasAuthToken) {
      console.log("ProtectedRoute: No auth token in localStorage, redirecting to login");
      return <Navigate to="/login" replace />;
    }
    
    // We have a token but don't know profile status, let the page render and it will redirect if needed
    console.log("ProtectedRoute: Found auth token in localStorage, allowing render");
    return <>{children}</>;
  }
  
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
  
  // User with completed profile = render protected content
  console.log("ProtectedRoute: Rendering protected content");
  return <>{children}</>;
};
