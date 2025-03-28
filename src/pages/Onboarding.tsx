
import { useEffect, useState } from 'react';
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
    
    // Completed profile = redirect to dashboard
    if (profile && profile.profile_completed) {
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
