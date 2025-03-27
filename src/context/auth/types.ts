
import { Session, User } from '@supabase/supabase-js';
import { User as UserType } from '@/types';

export type AuthContextType = {
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
  refreshProfile: (userId: string) => Promise<{
    success: boolean;
    error: string | null;
  }>;
  authInitialized: boolean;
};
