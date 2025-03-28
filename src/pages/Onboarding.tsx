
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, profile, authInitialized, loading } = useAuth();
  const navigate = useNavigate();
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Handle redirects based on auth state
  useEffect(() => {
    if (!authInitialized || loading) return;
    
    // Only run once after initial auth state is loaded
    if (isFirstLoad) {
      setIsFirstLoad(false);
      
      // No user = redirect to login
      if (!user) {
        console.log("Onboarding: No user, redirecting to login");
        navigate('/login', { replace: true });
        return;
      }
      
      // Check for profile completion in cached data
      if (profile?.profile_completed) {
        console.log("Onboarding: Profile already completed, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
        return;
      }
      
      console.log("Onboarding: User authenticated with incomplete profile, showing onboarding");
    }
  }, [user, profile, authInitialized, navigate, isFirstLoad, loading]);
  
  // Check auth initialization only
  if (!authInitialized || loading) {
    return <DashboardLoadingState />;
  }
  
  // No user = don't render anything (redirect will happen)
  if (!user) return null;
  
  // Profile already completed = don't render anything (redirect will happen)
  if (profile?.profile_completed) return null;
  
  // Render onboarding for users with incomplete profiles
  return <OnboardingContainer />;
};

export default Onboarding;
