
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  
  // Simple redirect check that only runs once authentication is determined
  useEffect(() => {
    if (loading) return; // Don't do anything while still loading
    
    // Clear any problematic data that might cause loops
    sessionStorage.removeItem('redirectAttempted');
    
    if (!user) {
      console.log("Onboarding - No user found, redirecting to login");
      navigate('/login', { replace: true });
    } else if (profile && profile.profile_completed) {
      console.log("Onboarding - Profile already completed, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, profile, navigate]);
  
  // Show loading while auth check is happening
  if (loading || !user) {
    return <DashboardLoadingState />;
  }
  
  // Render the onboarding container once we know the user should be here
  return <OnboardingContainer />;
};

export default Onboarding;
