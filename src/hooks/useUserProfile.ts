import { useState } from 'react';
import { User as UserType } from '@/types';
import { 
  fetchUserProfile as fetchUserProfileService, 
  createUserProfileIfNotExists as createUserProfileService, 
  updateUserProfile as updateUserProfileService 
} from '@/services/userProfile';

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log("useUserProfile: Fetching user profile for ID:", userId);
      const { data, error } = await fetchUserProfileService(userId);
      
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (data) {
        console.log("useUserProfile: Profile data received:", data);
        setProfile(data);
      } else {
        console.log("useUserProfile: No profile data received");
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
      console.log("useUserProfile: Creating user profile if not exists:", userId);
      const result = await createUserProfileService(userId, email);
      if (result.success) {
        console.log("useUserProfile: Profile creation successful or already exists");
      } else {
        console.log("useUserProfile: Profile creation failed:", result.error);
      }
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
      console.log("useUserProfile: Updating profile:", data);
      const { error, success } = await updateUserProfileService(userId, data);
      
      if (success && profile) {
        // Update local state
        console.log("useUserProfile: Update successful, updating local state");
        setProfile({
          ...profile,
          ...data
        });
      } else if (error) {
        console.log("useUserProfile: Update failed:", error);
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
