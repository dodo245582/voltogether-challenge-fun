
import { ReactNode, useEffect } from 'react';
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

  // Log auth status for debugging
  useEffect(() => {
    console.log("Auth Provider State:", { 
      userExists: !!user, 
      profileExists: !!profile, 
      authInitialized, 
      loading 
    });
  }, [user, profile, authInitialized, loading]);

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
