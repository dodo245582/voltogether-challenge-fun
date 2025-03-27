
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  
  // Simplified redirection logic
  useEffect(() => {
    if (loading) return; // Wait until loading is complete
    
    if (!user) {
      console.log("Not authenticated, redirecting to login");
      navigate('/login', { replace: true });
    } else if (profile?.profile_completed) {
      console.log("Profile already completed, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, profile, navigate]);
  
  // Show loading state while checking auth
  if (loading) {
    return <DashboardLoadingState />;
  }
  
  // If all checks pass, show onboarding
  if (user && (!profile || !profile.profile_completed)) {
    return <OnboardingContainer />;
  }
  
  // Fallback loading state
  return <DashboardLoadingState />;
};

export default Onboarding;
