
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile, refreshProfile, authInitialized } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Check for existing completed profile once
  useEffect(() => {
    if (!authInitialized) return;
    
    if (!user) {
      console.log("Onboarding: no user, redirecting to login");
      navigate('/login', { replace: true });
      return;
    }
    
    // If profile is loaded and completed, go to dashboard immediately
    if (profile && profile.profile_completed) {
      console.log("Onboarding: profile already completed, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Only refresh profile if we have a user and we're not already refreshing
    if (user.id && !isRefreshing && !profile) {
      console.log("Onboarding: refreshing profile in background");
      setIsRefreshing(true);
      
      // Refresh profile in background without blocking UI
      refreshProfile(user.id).catch(error => {
        console.error("Error refreshing profile:", error);
      }).finally(() => {
        setIsRefreshing(false);
      });
    }
  }, [user, profile, authInitialized, navigate, refreshProfile, isRefreshing]);
  
  // Show minimal loading state only during initial auth check
  if (!authInitialized) {
    return <DashboardLoadingState />;
  }
  
  // If no user, component will be unmounted by effect above
  if (!user) return null;
  
  // Don't wait for profile refreshing - show onboarding immediately
  console.log("Onboarding: rendering onboarding container");
  return <OnboardingContainer />;
};

export default Onboarding;
