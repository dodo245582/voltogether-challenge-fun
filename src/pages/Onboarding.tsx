
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, profile, authInitialized } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Clear and simple auth check
  useEffect(() => {
    console.log("Onboarding: Auth state:", { 
      user: !!user, 
      authInitialized, 
      profile: !!profile,
      profileCompleted: profile?.profile_completed 
    });
    
    if (authInitialized) {
      setIsLoading(false);
    }
  }, [authInitialized, user, profile]);
  
  // Force end loading state after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Onboarding: Force ending loading state after timeout");
        setIsLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  if (isLoading) {
    return <DashboardLoadingState />;
  }
  
  // No user = redirect to login
  if (!user) {
    console.log("Onboarding: No authenticated user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If profile is already completed, redirect to dashboard
  if (profile?.profile_completed) {
    console.log("Onboarding: Profile already completed, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // User with incomplete profile - show onboarding
  console.log("Onboarding: Showing onboarding form for user with incomplete profile");
  return <OnboardingContainer />;
};

export default Onboarding;
