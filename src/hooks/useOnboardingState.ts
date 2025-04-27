
import { useState, useEffect } from 'react';
import { DiscoverySource, User } from '@/types';

export const useOnboardingState = (profile: User | null) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [discoverySource, setDiscoverySource] = useState<DiscoverySource | ''>('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [instagramAccount, setInstagramAccount] = useState('');
  const [areraPortalAccess, setAreraPortalAccess] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  useEffect(() => {
    if (!profile) return;
    
    if (profile.name) setName(profile.name);
    if (profile.city) setCity(profile.city);
    if (profile.discovery_source) setDiscoverySource(profile.discovery_source as DiscoverySource);
    if (profile.selected_actions) setSelectedActions(profile.selected_actions);
    if (profile.instagram_account) setInstagramAccount(profile.instagram_account);
    if (profile.arera_portal_access !== undefined) setAreraPortalAccess(profile.arera_portal_access);
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
    instagramAccount,
    setInstagramAccount,
    areraPortalAccess,
    setAreraPortalAccess,
    isLoading,
    setIsLoading,
    redirectAttempted,
    setRedirectAttempted,
  };
};
