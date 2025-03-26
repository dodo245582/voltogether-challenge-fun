
import { useState } from 'react';
import { User as UserType } from '@/types';
import { 
  fetchUserProfile as fetchUserProfileService, 
  createUserProfileIfNotExists as createUserProfileService, 
  updateUserProfile as updateUserProfileService 
} from '@/services/userProfileService';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await fetchUserProfileService(userId);
      
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Exception in fetchUserProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
    if (!userId || !email) return;
    
    try {
      setLoading(true);
      await createUserProfileService(userId, email);
      await fetchUserProfile(userId);
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userId: string, data: Partial<UserType>) => {
    if (!userId) {
      return { 
        error: new Error('User ID is required'), 
        success: false 
      };
    }

    try {
      setLoading(true);
      const { error, success } = await updateUserProfileService(userId, data);
      
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

  return {
    profile,
    loading,
    fetchUserProfile,
    createUserProfileIfNotExists,
    updateProfile,
    setProfile
  };
};
