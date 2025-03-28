
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, profile, authInitialized } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [timeoutExpired, setTimeoutExpired] = useState(false);
  const navigate = useNavigate();
  
  // Set a failsafe timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("Onboarding: Safety timeout triggered after 3 seconds");
      setTimeoutExpired(true);
      setIsLoading(false);
    }, 3000); // 3 second max loading state
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Force navigation to dashboard after a longer timeout as ultimate fallback
  useEffect(() => {
    const ultimateFallbackId = setTimeout(() => {
      console.log("Onboarding: Ultimate fallback triggered - forcing navigation");
      if (document.location.pathname === '/onboarding') {
        console.log("Still on onboarding page after 5 seconds, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      }
    }, 5000); // 5 second ultimate fallback
    
    return () => clearTimeout(ultimateFallbackId);
  }, [navigate]);
  
  // Check auth status once it's initialized
  useEffect(() => {
    if (authInitialized) {
      console.log("Onboarding: Auth initialized, user:", !!user, "profile:", !!profile);
      setIsLoading(false);
    }
  }, [authInitialized, user, profile]);
  
  // Timeout expired but still no auth - go to login
  if (timeoutExpired && !user) {
    console.log("Onboarding: Timeout expired and no user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Timeout expired with user but no profile - force show onboarding
  if (timeoutExpired && user && !profile) {
    console.log("Onboarding: Timeout expired with user but no profile, forcing onboarding");
    return <OnboardingContainer />;
  }
  
  // Show loading state briefly
  if (isLoading) {
    return <DashboardLoadingState />;
  }
  
  // No user = redirect to login
  if (!user) {
    console.log("Onboarding: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Profile already completed = redirect to dashboard
  if (profile?.profile_completed) {
    console.log("Onboarding: Profile already completed, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // User with incomplete profile - show onboarding
  console.log("Onboarding: Showing onboarding form");
  return <OnboardingContainer />;
};

export default Onboarding;
