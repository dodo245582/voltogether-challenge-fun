
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  // Refresh profile once when component mounts
  useEffect(() => {
    if (user?.id) {
      console.log("Onboarding: refreshing profile for user", user.id);
      refreshProfile(user.id);
    }
  }, [user?.id, refreshProfile]);
  
  // Show loading state while auth is being checked
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // If no user, redirect to login
  if (!user) {
    console.log("Onboarding: no user, redirecting to login");
    navigate('/login', { replace: true });
    return null;
  }
  
  // If profile is completed, redirect to dashboard
  if (profile && profile.profile_completed) {
    console.log("Onboarding: profile already completed, redirecting to dashboard");
    navigate('/dashboard', { replace: true });
    return null;
  }
  
  // Only render onboarding when it's confirmed the user should be here
  console.log("Onboarding: rendering onboarding container for user", user.id);
  return <OnboardingContainer />;
};

export default Onboarding;
