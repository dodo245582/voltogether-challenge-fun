
import { ReactNode, useEffect, useState } from 'react';
import { useAuthState } from './hooks/useAuthState';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  // Get authentication state with optimized profile handling
  const { 
    session, 
    user, 
    profile, 
    loading: stateLoading, 
    authInitialized,
    setProfile
  } = useAuthState();
  
  // Get authentication methods
  const { 
    signUp, 
    signIn, 
    signOut, 
    updateProfile, 
    refreshProfile, 
    loading: methodsLoading 
  } = useAuthMethods(user, setProfile);
  
  // Combine loading states
  const loading = stateLoading || methodsLoading;
  
  // Simplified profile fetch - only if we have a user but no profile
  useEffect(() => {
    if (authInitialized && user && !profile && !loading) {
      console.log("AuthProvider: User exists but no profile, fetching profile");
      refreshProfile(user.id).catch(e => {
        console.error("Profile refresh error:", e);
      });
    }
  }, [user, profile, authInitialized, loading, refreshProfile]);

  // Create the context value
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

  console.log("AuthProvider: Current state:", { 
    user: !!user, 
    profile: !!profile, 
    authInitialized,
    loading
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
