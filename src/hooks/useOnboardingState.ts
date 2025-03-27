
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
  
  // Simple initialization that only runs once
  useEffect(() => {
    // Skip if already initialized or no profile to prevent loops
    if (hasInitialized || !profile) return;
    
    // Mark as initialized immediately to prevent multiple runs
    setHasInitialized(true);
    
    try {
      // Initialize each field individually to isolate potential errors
      if (profile.name) setName(String(profile.name).slice(0, 50));
      if (profile.city) setCity(String(profile.city).slice(0, 50));
      if (profile.discovery_source) setDiscoverySource(profile.discovery_source as DiscoverySource);
      if (profile.selected_actions && Array.isArray(profile.selected_actions)) {
        setSelectedActions(profile.selected_actions.slice(0, 20));
      }
    } catch (error) {
      console.error("Error initializing onboarding state:", error);
    }
  }, [profile, hasInitialized]);

  // Simplified safe setters
  const safeSetName = (value: string) => setName(value.slice(0, 50));
  const safeSetCity = (value: string) => setCity(value.slice(0, 50));
  
  // Properly typed setSelectedActions to handle both direct arrays and callback functions
  const safeSetSelectedActions = (
    value: string[] | ((prev: string[]) => string[])
  ) => {
    if (typeof value === 'function') {
      setSelectedActions(prev => {
        try {
          // Call the function with current state
          const result = value(prev);
          // Validate and sanitize the result
          return Array.isArray(result) ? result.slice(0, 20) : [];
        } catch (e) {
          console.error("Error updating selectedActions:", e);
          return prev;
        }
      });
    } else {
      // Handle direct array assignment
      setSelectedActions(Array.isArray(value) ? value.slice(0, 20) : []);
    }
  };

  return {
    step,
    setStep,
    name,
    setName: safeSetName,
    city,
    setCity: safeSetCity,
    discoverySource,
    setDiscoverySource,
    selectedActions,
    setSelectedActions: safeSetSelectedActions,
    isLoading,
    setIsLoading,
    redirectAttempted,
    setRedirectAttempted,
    hasInitialized
  };
};
