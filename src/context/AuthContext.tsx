
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { User as UserType } from '@/types';

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
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Create a user profile if one doesn't exist
          await createUserProfileIfNotExists(session.user.id, session.user.email);
          // Fetch user profile
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Create a user profile if one doesn't exist and fetch it
        await createUserProfileIfNotExists(session.user.id, session.user.email);
        await fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }
    
    if (data) {
      setProfile(data as UserType);
    }
  };

  // Helper function to create a user profile if it doesn't exist
  const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
    if (!email) return;
    
    const { data, error } = await supabase
      .from('Users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user profile:', error);
      return;
    }
    
    // If user doesn't exist, create one
    if (!data) {
      const { error: insertError } = await supabase
        .from('Users')
        .insert({
          id: userId,
          email: email,
          completed_challenges: 0,
          total_points: 0,
          streak: 0
        });
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
      }
    }
  };

  const updateProfile = async (data: Partial<UserType>) => {
    if (!user) {
      return { 
        error: new Error('User not authenticated'), 
        success: false 
      };
    }

    const { error } = await supabase
      .from('Users')
      .update(data)
      .eq('id', user.id);
    
    if (!error && profile) {
      // Update local profile state
      setProfile({
        ...profile,
        ...data
      });
      
      return { error: null, success: true };
    }
    
    return { error, success: !error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    return { 
      error, 
      success: !error && !!data.user
    };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { 
      error, 
      success: !error && !!data.session
    };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    navigate('/');
  };

  const value = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
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
