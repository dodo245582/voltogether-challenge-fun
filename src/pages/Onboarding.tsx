
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  // Simplified redirection logic with protection against loops
  useEffect(() => {
    if (loading) return; // Wait until loading is complete
    
    if (!user && !redirectAttempted) {
      console.log("Not authenticated, redirecting to login");
      setRedirectAttempted(true);
      navigate('/login', { replace: true });
    } else if (profile?.profile_completed && !redirectAttempted) {
      console.log("Profile already completed, redirecting to dashboard");
      setRedirectAttempted(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, profile, navigate, redirectAttempted]);
  
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
