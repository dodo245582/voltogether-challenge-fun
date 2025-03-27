
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);
  
  // Simple redirect check that only runs once when component is mounted
  useEffect(() => {
    // Skip if we've already checked or still loading
    if (hasCheckedRedirect || loading) return;
    
    // Mark as checked to prevent multiple runs
    setHasCheckedRedirect(true);

    // If no user, redirect to login
    if (!user) {
      console.log("Onboarding - No user found, redirecting to login");
      navigate('/login', { replace: true });
      return;
    }
    
    // If profile is completed, redirect to dashboard
    if (profile && profile.profile_completed) {
      console.log("Onboarding - Profile already completed, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Ready to show onboarding
    setIsReady(true);
  }, [user, loading, profile, navigate, hasCheckedRedirect]);
  
  // Show loading while auth check is happening
  if (loading || !isReady) {
    return <DashboardLoadingState />;
  }
  
  // Only render onboarding when it's confirmed the user should be here
  return <OnboardingContainer />;
};

export default Onboarding;
