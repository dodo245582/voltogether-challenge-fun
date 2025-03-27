
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  // Gestione sicura del reindirizzamento con memorizzazione
  useEffect(() => {
    // Memorizzare lo stato di reindirizzamento in sessionStorage per evitare loop
    const hasRedirectedBefore = sessionStorage.getItem('onboardingRedirectAttempted');
    
    if (!loading && !redirectAttempted && !hasRedirectedBefore && user && profile && !profile.profile_completed) {
      console.log("User profile not complete, redirecting to onboarding");
      // Impostare il flag di reindirizzamento
      setRedirectAttempted(true);
      sessionStorage.setItem('onboardingRedirectAttempted', 'true');
      
      // Reindirizzare con replace per evitare problemi di navigazione
      navigate('/onboarding', { replace: true });
    } else if (!loading) {
      // Se il caricamento è completo e non serve reindirizzare, mostrare i contenuti
      setShouldRender(true);
    }
    
    // Pulizia del flag di reindirizzamento dopo 5 secondi per evitare problemi persistenti
    const timeout = setTimeout(() => {
      sessionStorage.removeItem('onboardingRedirectAttempted');
    }, 5000);
    
    return () => clearTimeout(timeout);
    
  }, [user, loading, profile, navigate, redirectAttempted]);
  
  // Mostro stato di caricamento solo quando necessario
  if (loading || (!shouldRender && !redirectAttempted)) {
    return <DashboardLoadingState />;
  }
  
  // Se non c'è utente, reindirizzare subito
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Rendere i figli solo quando è sicuro farlo
  return shouldRender ? <>{children}</> : <DashboardLoadingState />;
};
