
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, profile, authInitialized } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Semplice verifica: appena sappiamo lo stato di autenticazione, decidiamo cosa mostrare
  useEffect(() => {
    if (authInitialized) {
      console.log("Onboarding: Auth initialized, user:", !!user, "profile:", !!profile, "profile_completed:", profile?.profile_completed);
      setIsLoading(false);
    }
  }, [authInitialized, user, profile]);
  
  // Mostra loading state mentre verifichi auth
  if (isLoading) {
    return <DashboardLoadingState />;
  }
  
  // No user = redirect to login
  if (!user) {
    console.log("Onboarding: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Profilo già completato = redirect to dashboard
  if (profile?.profile_completed) {
    console.log("Onboarding: Profile already completed, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  // Utente con profilo incompleto - mostra onboarding
  console.log("Onboarding: Showing onboarding form for user with incomplete profile");
  return <OnboardingContainer />;
};

export default Onboarding;
