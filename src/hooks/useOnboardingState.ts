
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
  
  // Simple initialization from profile, only runs once when profile is available
  useEffect(() => {
    if (!profile) return;
    
    // Initialize values from profile if available
    if (profile.name) setName(profile.name);
    if (profile.city) setCity(profile.city);
    if (profile.discovery_source) setDiscoverySource(profile.discovery_source as DiscoverySource);
    if (profile.selected_actions) setSelectedActions(profile.selected_actions);
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
    setRedirectAttempted,
  };
};
