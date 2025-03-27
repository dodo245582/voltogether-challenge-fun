
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  
  // Show loading state while auth is being checked
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // If no user, redirect to login
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }
  
  // If profile is completed, redirect to dashboard
  if (profile && profile.profile_completed) {
    navigate('/dashboard', { replace: true });
    return null;
  }
  
  // Only render onboarding when it's confirmed the user should be here
  return <OnboardingContainer />;
};

export default Onboarding;
