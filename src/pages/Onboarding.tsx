
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  
  // Handle redirection for already authenticated users with completed profiles
  useEffect(() => {
    if (!loading && !user) {
      // If no user is authenticated, redirect to login
      navigate('/login', { replace: true });
    } else if (!loading && profile?.profile_completed) {
      // If profile is already completed, redirect to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, profile, navigate]);
  
  // Show loading state while checking authentication
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // If user is authenticated but profile is not completed, show onboarding
  if (user && (!profile || !profile.profile_completed)) {
    return <OnboardingContainer />;
  }
  
  // Fallback loading state (this should rarely be shown)
  return <DashboardLoadingState />;
};

export default Onboarding;
