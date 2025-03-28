
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, profile, authInitialized } = useAuth();
  const navigate = useNavigate();
  
  // Handle redirects based on auth state
  useEffect(() => {
    if (!authInitialized) return;
    
    // No user = redirect to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Check for profile completion in cached data first
    if (profile?.profile_completed) {
      console.log("Onboarding: Profile already completed, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, authInitialized, navigate]);
  
  // Check auth initialization only
  if (!authInitialized) {
    return <DashboardLoadingState />;
  }
  
  // No user = don't render anything (redirect will happen)
  if (!user) return null;
  
  // Render onboarding immediately - don't wait for profile
  return <OnboardingContainer />;
};

export default Onboarding;
