
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
  
  // Refresh profile once when component mounts
  useEffect(() => {
    let isMounted = true;
    
    async function checkProfile() {
      if (!user?.id || isRefreshing || profileChecked) return;
      
      console.log("Onboarding: refreshing profile for user", user.id);
      setIsRefreshing(true);
      
      try {
        const { success } = await refreshProfile(user.id);
        console.log("Profile refresh result:", success);
        
        if (isMounted) {
          setProfileChecked(true);
        }
      } catch (error) {
        console.error("Error refreshing profile:", error);
      } finally {
        if (isMounted) {
          setIsRefreshing(false);
        }
      }
    }
    
    checkProfile();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, refreshProfile, isRefreshing, profileChecked]);
  
  // Effetto per reindirizzare in base allo stato del profilo
  useEffect(() => {
    if (!authInitialized || loading || isRefreshing) return;
    
    if (!user) {
      console.log("Onboarding: no user, redirecting to login");
      navigate('/login', { replace: true });
      return;
    }
    
    if (profile && profile.profile_completed) {
      console.log("Onboarding: profile already completed, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, loading, authInitialized, isRefreshing, navigate]);
  
  // Show loading state while auth is being checked or profile is being refreshed
  if (loading || !authInitialized || isRefreshing) {
    return <DashboardLoadingState />;
  }
  
  // If no user, component will be unmounted by effect above
  if (!user) return null;
  
  // If profile is completed, component will be unmounted by effect above
  if (profile && profile.profile_completed) return null;
  
  // Only render onboarding when it's confirmed the user should be here
  console.log("Onboarding: rendering onboarding container for user", user.id);
  return <OnboardingContainer />;
};

export default Onboarding;
