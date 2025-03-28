
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, profile, refreshProfile, authInitialized } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle redirects and profile refresh
  useEffect(() => {
    if (!authInitialized) return;
    
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Redirect to dashboard if profile already completed
    if (profile && profile.profile_completed) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Background refresh if needed
    if (user.id && !isRefreshing && !profile) {
      setIsRefreshing(true);
      refreshProfile(user.id).catch(console.error).finally(() => {
        setIsRefreshing(false);
      });
    }
  }, [user, profile, authInitialized, navigate, refreshProfile, isRefreshing]);
  
  // Show minimal loading only during initial auth check
  if (!authInitialized) {
    return <DashboardLoadingState />;
  }
  
  // Render onboarding immediately, don't wait for profile
  if (!user) return null;
  
  return <OnboardingContainer />;
};

export default Onboarding;
