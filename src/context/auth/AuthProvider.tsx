
import { ReactNode, useEffect, useState } from 'react';
import { useAuthState } from './hooks/useAuthState';
import { useAuthMethods } from './hooks/useAuthMethods';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [retryCount, setRetryCount] = useState(0);
  
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
      loading,
      retryCount 
    });
    
    // If authentication has initialized but we have a user with no profile,
    // try to fetch the profile as a fallback
    if (authInitialized && user && !profile && !loading && retryCount < 2) {
      console.log(`Auth Provider: User exists but no profile, retrying profile fetch (attempt ${retryCount + 1})`);
      setRetryCount(prev => prev + 1);
      
      // Use timeout to prevent potential recursive state updates
      setTimeout(() => {
        refreshProfile(user.id).catch(e => {
          console.error("Profile refresh error:", e);
        });
      }, 100);
    }
  }, [user, profile, authInitialized, loading, refreshProfile, retryCount]);

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
