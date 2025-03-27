
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
  
  // Safely initialize form state from profile
  useEffect(() => {
    if (!profile) return;
    
    try {
      // Only set values if they exist and are of the right type
      if (profile.name && typeof profile.name === 'string') {
        setName(profile.name);
      }
      
      if (profile.city && typeof profile.city === 'string') {
        setCity(profile.city);
      }
      
      if (profile.discovery_source) {
        setDiscoverySource(profile.discovery_source as DiscoverySource);
      }
      
      if (profile.selected_actions && Array.isArray(profile.selected_actions)) {
        setSelectedActions(profile.selected_actions);
      }
    } catch (error) {
      console.error("Error initializing onboarding state from profile:", error);
    }
  }, [profile]);

  return {
    step,
    setStep,
    name,
    setName,
    city,
    setCity,
    discoverySource,
    setDiscoverySource,
    selectedActions,
    setSelectedActions,
    isLoading,
    setIsLoading,
    redirectAttempted,
    setRedirectAttempted
  };
};
