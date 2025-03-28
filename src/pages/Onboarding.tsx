
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, profile, authInitialized } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Set a failsafe timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("Onboarding: Safety timeout triggered");
      setIsLoading(false);
    }, 2000); // 2 second max loading state
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Check auth status once it's initialized
  useEffect(() => {
    if (authInitialized) {
      console.log("Onboarding: Auth initialized, user:", !!user, "profile:", !!profile);
      setIsLoading(false);
    }
  }, [authInitialized, user, profile]);
  
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
