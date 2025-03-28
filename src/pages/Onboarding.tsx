
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, profile, authInitialized } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle redirects based on auth state
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    // Set a fallback timeout to prevent forever loading
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log("Onboarding: Auth check timeout, stopping loading state");
        setIsLoading(false);
      }
    }, 2000);
    
    if (authInitialized) {
      console.log("Onboarding: Auth initialized, user:", !!user, "profile:", !!profile);
      
      // No user = redirect to login
      if (!user) {
        console.log("Onboarding: No user, redirecting to login");
        navigate('/login', { replace: true });
        return;
      }
      
      // Profile already completed = redirect to dashboard
      if (profile?.profile_completed) {
        console.log("Onboarding: Profile already completed, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // User exists but profile not completed - show onboarding
      if (mounted) {
        console.log("Onboarding: User exists but profile not completed, showing onboarding");
        setIsLoading(false);
      }
    }
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [user, profile, authInitialized, navigate]);
  
  // Show loading state briefly (max 2 seconds)
  if (isLoading) {
    return <DashboardLoadingState />;
  }
  
  // No user = don't render anything (redirect handled in useEffect)
  if (!user) return null;
  
  // Profile already completed = don't render anything (redirect handled in useEffect)
  if (profile?.profile_completed) return null;
  
  // User with incomplete profile - show onboarding
  return <OnboardingContainer />;
};

export default Onboarding;
