
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { User as UserType } from '@/types';
import { useUserProfile } from '@/hooks/useUserProfile';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserType | null;
  signUp: (email: string, password: string) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  signOut: () => Promise<void>;
  loading: boolean;
  updateProfile: (data: Partial<UserType>) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  refreshProfile: (userId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();
  
  const { 
    profile, 
    loading: profileLoading, 
    fetchUserProfile, 
    createUserProfileIfNotExists, 
    updateProfile: updateUserProfile,
    setProfile
  } = useUserProfile();

  // Simplify loading state to minimize UI flicker
  const isLoading = loading || (profileLoading && !initialCheckDone);

  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    let mounted = true;
    
    // Initialize with cached profile if available
    if (mounted && user) {
      try {
        const cachedProfile = localStorage.getItem(`profile_${user.id}`);
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
        }
      } catch (e) {
        console.error("Error retrieving cached profile:", e);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state change event:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const cachedProfile = localStorage.getItem(`profile_${session.user.id}`);
            if (cachedProfile) {
              setProfile(JSON.parse(cachedProfile));
            }
          } catch (e) {
            console.error("Error retrieving cached profile:", e);
          }
          
          if (event === 'SIGNED_IN') {
            setTimeout(async () => {
              if (!mounted) return;
              try {
                await createUserProfileIfNotExists(session.user.id, session.user.email);
                if (mounted) await fetchUserProfile(session.user.id);
              } catch (error) {
                console.error("Error in auth state change handler:", error);
              }
            }, 0);
          }
        }
        
        // Don't set loading to false here to prevent UI flicker
        // We'll set it after getSession completes
      }
    );

    // Get session only once at initialization
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log("Got existing session:", !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const cachedProfile = localStorage.getItem(`profile_${session.user.id}`);
          if (cachedProfile) {
            setProfile(JSON.parse(cachedProfile));
          }
          
          setTimeout(async () => {
            if (!mounted) return;
            try {
              await createUserProfileIfNotExists(session.user.id, session.user.email);
              if (mounted) await fetchUserProfile(session.user.id);
            } catch (error) {
              console.error("Error during initial session check:", error);
            } finally {
              if (mounted) {
                setInitialCheckDone(true);
                setLoading(false);
              }
            }
          }, 0);
        } catch (e) {
          console.error("Error retrieving/setting cached profile:", e);
          if (mounted) {
            setInitialCheckDone(true);
            setLoading(false);
          }
        }
      } else {
        if (mounted) {
          setInitialCheckDone(true);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, createUserProfileIfNotExists, setProfile]);

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Signing up user:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (!error && data.user) {
        setTimeout(async () => {
          try {
            await createUserProfileIfNotExists(data.user.id, data.user.email);
          } catch (createError) {
            console.error("Error creating initial profile:", createError);
          }
        }, 0);
      }
      
      return { 
        error, 
        success: !error && !!data.user
      };
    } catch (error) {
      console.error("Exception in signUp:", error);
      return { error, success: false };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { 
        error, 
        success: !error && !!data.session
      };
    } catch (error) {
      console.error("Exception in signIn:", error);
      return { error, success: false };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Exception in signOut:", error);
    }
  };

  const updateProfile = async (data: Partial<UserType>) => {
    if (!user) {
      return { 
        error: new Error('User not authenticated'), 
        success: false 
      };
    }
    
    console.log("Updating profile with data:", data);
    const result = await updateUserProfile(user.id, data);
    
    if (result.success) {
      console.log("Profile update successful, refreshing profile data");
      setTimeout(async () => {
        await fetchUserProfile(user.id);
      }, 0);
    }
    
    return result;
  };

  const refreshProfile = async (userId: string) => {
    if (!userId) return;
    console.log("AuthProvider: Refreshing profile for user:", userId);
    return fetchUserProfile(userId);
  };

  const value = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading: isLoading,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
