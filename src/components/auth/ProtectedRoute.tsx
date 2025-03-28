
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardLoadingState from '../dashboard/DashboardLoadingState';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, authInitialized, profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Semplice controllo dell'autenticazione
  useEffect(() => {
    if (authInitialized) {
      console.log("ProtectedRoute: Auth initialized, making navigation decision");
      console.log("User:", !!user, "Profile:", !!profile, "Profile completed:", profile?.profile_completed);
      setIsLoading(false);
    }
  }, [authInitialized, user, profile]);
  
  // Mostra loading state mentre verifichi auth
  if (isLoading) {
    return <DashboardLoadingState />;
  }
  
  // No user = redirect to login
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Utente esiste ma profilo non completato = redirect to onboarding
  if (user && profile && !profile.profile_completed) {
    console.log("ProtectedRoute: User found but profile not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }
  
  // Utente con profilo completato = render contenuto protetto
  console.log("ProtectedRoute: Rendering protected content");
  return <>{children}</>;
};
