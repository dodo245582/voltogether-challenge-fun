
import { useState, useEffect } from 'react';
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
  
  // Simple, direct city setter with no throttling or complex logic
  const setSafeCity = (newCity: string) => {
    setCity(newCity);
  };
  
  // Simplified initialization
  useEffect(() => {
    if (!profile || hasInitialized) return;
    
    try {
      if (profile.name && typeof profile.name === 'string') {
        setName(profile.name.slice(0, 50));
      }
      
      if (profile.city && typeof profile.city === 'string') {
        setCity(profile.city.slice(0, 50));
      }
      
      if (profile.discovery_source) {
        setDiscoverySource(profile.discovery_source as DiscoverySource);
      }
      
      if (profile.selected_actions && Array.isArray(profile.selected_actions)) {
        setSelectedActions(profile.selected_actions.slice(0, 20));
      }
      
      setHasInitialized(true);
    } catch (error) {
      console.error("Error initializing onboarding state:", error);
      setHasInitialized(true);
    }
  }, [profile, hasInitialized]);

  return {
    step,
    setStep,
    name,
    setName,
    city,
    setCity: setSafeCity,
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
