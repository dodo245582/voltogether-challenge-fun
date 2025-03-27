import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  // Simple redirect check
  useEffect(() => {
    // Skip all checks if we're still loading
    if (loading) return;
    
    // Clear any problematic data that might cause loops
    sessionStorage.removeItem('redirectAttempted');
    
    // If no user, go to login
    if (!user) {
      console.log("Onboarding - No user found, redirecting to login");
      navigate('/login', { replace: true });
      return;
    }
    
    // If profile is completed, go to dashboard
    if (profile && profile.profile_completed) {
      console.log("Onboarding - Profile already completed, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Otherwise we're done checking and can show the onboarding
    setIsChecking(false);
  }, [user, loading, profile, navigate]);
  
  // Show loading while auth or profile check is happening
  if (loading || isChecking) {
    return <DashboardLoadingState />;
  }
  
  // Only render onboarding when it's confirmed the user should be here
  return <OnboardingContainer />;
};

export default Onboarding;
