
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, profile, authInitialized, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  // Handle redirects based on auth state
  useEffect(() => {
    let mounted = true;
    
    const checkAuthStatus = async () => {
      // Wait for auth to initialize
      if (!authInitialized) return;
      
      console.log("Onboarding: Auth initialized, checking status", { 
        hasUser: !!user, 
        hasProfile: !!profile,
        profileCompleted: profile?.profile_completed 
      });
      
      // No user = redirect to login
      if (!user) {
        console.log("Onboarding: No user, redirecting to login");
        navigate('/login', { replace: true });
        return;
      }
      
      // If we have a user but no profile, try to fetch it once
      if (user && !profile) {
        console.log("Onboarding: User authenticated but no profile, fetching profile");
        try {
          await refreshProfile(user.id);
        } catch (err) {
          console.error("Error fetching profile in onboarding:", err);
        }
      }
      
      // After potential profile fetch, check if profile is completed
      if (user && profile?.profile_completed) {
        console.log("Onboarding: Profile already completed, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // If we get here, user is logged in but profile is incomplete or not loaded
      if (mounted) {
        console.log("Onboarding: Ready to show onboarding form");
        setIsChecking(false);
      }
    };
    
    checkAuthStatus();
    
    return () => {
      mounted = false;
    };
  }, [user, profile, authInitialized, navigate, refreshProfile]);
  
  // Show loading state while checking auth
  if (!authInitialized || isChecking) {
    return <DashboardLoadingState />;
  }
  
  // No user = don't render anything (redirect will happen)
  if (!user) return null;
  
  // Profile already completed = don't render anything (redirect will happen)
  if (profile?.profile_completed) return null;
  
  // Render onboarding for users with incomplete profiles
  console.log("Onboarding: Rendering onboarding container");
  return <OnboardingContainer />;
};

export default Onboarding;
