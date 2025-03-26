
import { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { User as UserType } from '@/types';
import { 
  fetchUserProfile, 
  createUserProfileIfNotExists, 
  updateUserProfile 
} from '@/services/userProfileService';

type UserProfileContextType = {
  profile: UserType | null;
  loading: boolean;
  updateProfile: (data: Partial<UserType>) => Promise<{
    error: any | null;
    success: boolean;
  }>;
  refreshProfile: (userId: string) => Promise<void>;
  initializeProfile: (userId: string, email: string | undefined) => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ 
  children, 
  authUser 
}: { 
  children: ReactNode, 
  authUser: User | null 
}) {
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProfile = async (userId: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await fetchUserProfile(userId);
      
      if (error) {
        console.error("Error refreshing profile:", error);
        return;
      }
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Exception in refreshProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeProfile = async (userId: string, email: string | undefined) => {
    if (!userId || !email) return;
    
    try {
      setLoading(true);
      await createUserProfileIfNotExists(userId, email);
      await refreshProfile(userId);
    } catch (error) {
      console.error("Error initializing profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserType>) => {
    if (!authUser) {
      return { 
        error: new Error('User not authenticated'), 
        success: false 
      };
    }

    try {
      setLoading(true);
      const { error, success } = await updateUserProfile(authUser.id, data);
      
      if (success && profile) {
        // Update local state
        setProfile({
          ...profile,
          ...data
        });
      }
      
      return { error, success };
    } catch (error) {
      console.error("Exception in updateProfile:", error);
      return { error, success: false };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    profile,
    loading,
    updateProfile,
    refreshProfile,
    initializeProfile
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
