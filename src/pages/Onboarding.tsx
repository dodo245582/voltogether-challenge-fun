
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  
  // Simple redirect check
  useEffect(() => {
    if (loading) return;
    
    // If no user, redirect to login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    
    // If profile is completed, redirect to dashboard
    if (profile && profile.profile_completed) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Ready to show onboarding
    setIsReady(true);
  }, [user, loading, profile, navigate]);
  
  // Show loading while auth check is happening
  if (loading || !isReady) {
    return <DashboardLoadingState />;
  }
  
  // Only render onboarding when it's confirmed the user should be here
  return <OnboardingContainer />;
};

export default Onboarding;
