
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
  const navigate = useNavigate();
  
  const { 
    profile, 
    loading: profileLoading, 
    fetchUserProfile, 
    createUserProfileIfNotExists, 
    updateProfile: updateUserProfile,
  } = useUserProfile();

  // Combine loading states
  const isLoading = loading || profileLoading;

  useEffect(() => {
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change event:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout to prevent Supabase auth deadlocks
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              await createUserProfileIfNotExists(session.user.id, session.user.email);
              await fetchUserProfile(session.user.id);
            } catch (error) {
              console.error("Error in auth state change handler:", error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // No profile when signed out
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          await createUserProfileIfNotExists(session.user.id, session.user.email);
          await fetchUserProfile(session.user.id);
        } catch (error) {
          console.error("Error during initial session check:", error);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, createUserProfileIfNotExists]);

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Signing up user:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
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
    
    return await updateUserProfile(user.id, data);
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
