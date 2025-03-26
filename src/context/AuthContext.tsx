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

  // Combine loading states but give priority to auth loading
  const isLoading = (loading || (profileLoading && initialCheckDone === false));

  useEffect(() => {
    console.log("AuthProvider: Initializing auth state");
    let isSubscribed = true;
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isSubscribed) return;
        
        console.log("Auth state change event:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Try to get cached profile immediately from localStorage
        if (session?.user) {
          try {
            const cachedProfile = localStorage.getItem(`profile_${session.user.id}`);
            if (cachedProfile) {
              setProfile(JSON.parse(cachedProfile));
            }
          } catch (e) {
            console.error("Error retrieving cached profile:", e);
          }
        }
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Create profile without blocking UI
          setTimeout(async () => {
            try {
              if (!isSubscribed) return;
              await createUserProfileIfNotExists(session.user.id, session.user.email);
              if (isSubscribed) await fetchUserProfile(session.user.id);
            } catch (error) {
              console.error("Error in auth state change handler:", error);
            }
          }, 0);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isSubscribed) return;
      
      console.log("Got existing session:", !!session);
      setSession(session);
      setUser(session?.user ?? null);
      
      // First try to get cached profile from localStorage
      if (session?.user) {
        try {
          const cachedProfile = localStorage.getItem(`profile_${session.user.id}`);
          if (cachedProfile) {
            setProfile(JSON.parse(cachedProfile));
          }
        } catch (e) {
          console.error("Error retrieving cached profile:", e);
        }
        
        // Then try to get from DB but don't block UI
        setTimeout(async () => {
          try {
            if (!isSubscribed) return;
            await createUserProfileIfNotExists(session.user.id, session.user.email);
            if (isSubscribed) await fetchUserProfile(session.user.id);
          } catch (error) {
            console.error("Error during initial session check:", error);
          } finally {
            if (isSubscribed) setInitialCheckDone(true);
          }
        }, 0);
      } else {
        setInitialCheckDone(true);
      }
      
      setLoading(false);
    });

    return () => {
      isSubscribed = false;
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
        // Create a profile immediately after signup
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
    
    // If successful, immediately force a profile refresh
    if (result.success) {
      console.log("Profile update successful, refreshing profile data");
      setTimeout(async () => {
        await fetchUserProfile(user.id);
      }, 0);
    }
    
    return result;
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
