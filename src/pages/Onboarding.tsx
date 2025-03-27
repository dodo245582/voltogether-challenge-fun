
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  
  // Simple redirect logic
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/login', { replace: true });
    } else if (profile && profile.profile_completed) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, profile, navigate]);
  
  // Show loading during auth check
  if (loading || !user) {
    return <DashboardLoadingState />;
  }
  
  // Render the onboarding container when it's safe
  return <OnboardingContainer />;
};

export default Onboarding;
