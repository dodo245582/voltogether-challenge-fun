
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';

const Onboarding = () => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [renderContent, setRenderContent] = useState(false);
  
  // Gestione sicura dei reindirizzamenti con controllo anti-loop
  useEffect(() => {
    if (loading) return; // Attendere fino al completamento del caricamento
    
    // Controllo di sicurezza per evitare reindirizzamenti in loop
    const hasRedirectedRecently = sessionStorage.getItem('redirectFromOnboarding');
    const currentTime = Date.now();
    const lastRedirectTime = parseInt(hasRedirectedRecently || '0');
    const isRecentRedirect = (currentTime - lastRedirectTime) < 5000; // 5 secondi
    
    if (!user && !redirectAttempted && !isRecentRedirect) {
      console.log("Not authenticated, redirecting to login");
      setRedirectAttempted(true);
      sessionStorage.setItem('redirectFromOnboarding', currentTime.toString());
      navigate('/login', { replace: true });
    } else if (profile?.profile_completed && !redirectAttempted && !isRecentRedirect) {
      console.log("Profile already completed, redirecting to dashboard");
      setRedirectAttempted(true);
      sessionStorage.setItem('redirectFromOnboarding', currentTime.toString());
      navigate('/dashboard', { replace: true });
    } else if (user && (!profile || !profile.profile_completed)) {
      setRenderContent(true);
    }
    
    // Pulizia del flag di reindirizzamento dopo un po' di tempo
    const timeout = setTimeout(() => {
      sessionStorage.removeItem('redirectFromOnboarding');
    }, 10000);
    
    return () => clearTimeout(timeout);
  }, [user, loading, profile, navigate, redirectAttempted]);
  
  // Mostro stato di caricamento durante le verifiche
  if (loading || (!renderContent && !redirectAttempted)) {
    return <DashboardLoadingState />;
  }
  
  // Renderizzo il contenuto solo quando è sicuro farlo
  if (renderContent) {
    return <OnboardingContainer />;
  }
  
  // Stato di caricamento come fallback
  return <DashboardLoadingState />;
};

export default Onboarding;
