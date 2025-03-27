
import { useState, useEffect, useCallback } from 'react';
import { DiscoverySource, User } from '@/types';

export const useOnboardingState = (profile: User | null) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [discoverySource, setDiscoverySource] = useState<DiscoverySource | ''>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  
  // Funzione di aggiornamento sicura di city con throttling
  const setSafeCity = useCallback((newCity: string) => {
    const now = Date.now();
    // Limitare gli aggiornamenti a un massimo di uno ogni 100ms
    if (now - lastUpdateTime > 100) {
      try {
        setCity(newCity);
        setLastUpdateTime(now);
      } catch (error) {
        console.error("Error updating city:", error);
      }
    }
  }, [lastUpdateTime]);
  
  // Inizializzazione sicura dello stato dal profilo - solo una volta
  useEffect(() => {
    if (!profile || hasInitialized) return;
    
    try {
      // Impostare i valori solo se esistono e sono del tipo corretto
      // Limitare la lunghezza dei valori stringa per evitare problemi di prestazioni
      
      if (profile.name && typeof profile.name === 'string') {
        setName(profile.name.slice(0, 50)); // Limitare a 50 caratteri
      }
      
      if (profile.city && typeof profile.city === 'string') {
        setCity(profile.city.slice(0, 50)); // Limitare a 50 caratteri
      }
      
      if (profile.discovery_source) {
        setDiscoverySource(profile.discovery_source as DiscoverySource);
      }
      
      if (profile.selected_actions && Array.isArray(profile.selected_actions)) {
        // Limitare a 20 azioni per evitare problemi di prestazioni
        setSelectedActions(profile.selected_actions.slice(0, 20));
      }
      
      setHasInitialized(true);
    } catch (error) {
      console.error("Error initializing onboarding state from profile:", error);
      // Impostare comunque hasInitialized per evitare tentativi infiniti
      setHasInitialized(true);
    }
  }, [profile, hasInitialized]);

  return {
    step,
    setStep,
    name,
    setName,
    city,
    setCity: setSafeCity, // Usare la versione sicura con throttling
    discoverySource,
    setDiscoverySource,
    selectedActions,
    setSelectedActions,
    isLoading,
    setIsLoading,
    redirectAttempted,
    setRedirectAttempted,
    hasInitialized
  };
};
