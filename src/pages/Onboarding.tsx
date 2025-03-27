
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile, refreshProfile, authInitialized } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  
  // Check for existing completed profile immediately
  useEffect(() => {
    if (!authInitialized || loading) return;
    
    if (!user) {
      console.log("Onboarding: no user, redirecting to login");
      navigate('/login', { replace: true });
      return;
    }
    
    // Check if the profile is already completed, go to dashboard if so
    if (profile && profile.profile_completed) {
      console.log("Onboarding: profile already completed, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, loading, authInitialized, navigate]);
  
  // Check profile only once on initial render
  useEffect(() => {
    let isMounted = true;
    
    async function checkProfile() {
      if (!user?.id || isRefreshing || profileChecked) return;
      
      console.log("Onboarding: refreshing profile for user", user.id);
      setIsRefreshing(true);
      
      try {
        // Start displaying the onboarding form immediately while profile loads
        // This removes perceived latency for the user
        if (isMounted) {
          setProfileChecked(true);
        }
        
        // Run profile refresh in background
        refreshProfile(user.id).catch(error => {
          console.error("Error refreshing profile:", error);
        }).finally(() => {
          if (isMounted) {
            setIsRefreshing(false);
          }
        });
      } catch (error) {
        console.error("Error refreshing profile:", error);
        if (isMounted) {
          setIsRefreshing(false);
          setProfileChecked(true);
        }
      }
    }
    
    checkProfile();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, refreshProfile, isRefreshing, profileChecked]);
  
  // Show loading state while auth is being checked
  if (loading || !authInitialized) {
    return <DashboardLoadingState />;
  }
  
  // If no user, component will be unmounted by effect above
  if (!user) return null;
  
  // If profile is completed, component will be unmounted by effect above
  if (profile && profile.profile_completed) return null;
  
  // Don't wait for profile refreshing anymore - show onboarding immediately
  // This is a key change to reduce perceived latency
  console.log("Onboarding: rendering onboarding container for user", user.id);
  return <OnboardingContainer />;
};

export default Onboarding;
