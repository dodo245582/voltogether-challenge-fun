
import { ReactNode } from 'react';
import { useAuthState } from './hooks/useAuthState';
import { useAuthMethods } from './hooks/useAuthMethods';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Get authentication state
  const { session, user, loading: stateLoading, authInitialized } = useAuthState();
  
  // Get authentication methods
  const { 
    signUp, 
    signIn, 
    signOut, 
    updateProfile, 
    refreshProfile, 
    loading: methodsLoading 
  } = useAuthMethods(user);
  
  // Get user profile from hook
  const { profile } = useUserProfile();
  
  // Combine loading states
  const loading = stateLoading || methodsLoading;

  const value = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
    updateProfile,
    refreshProfile,
    authInitialized
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
