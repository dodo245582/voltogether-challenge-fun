
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
    
    // First check localStorage for immediate response
    try {
      const cachedData = localStorage.getItem(`profile_${userId}`);
      if (cachedData) {
        const cachedProfile = JSON.parse(cachedData);
        // Update state immediately with cached data
        setProfile(cachedProfile);
        
        // Don't show loading state if we have cached data
        if (!loading) {
          // Fetch fresh data in background
          fetchFromService(userId);
          return;
        }
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
    
    // If no cache or loading already in progress, show loading
    setLoading(true);
    await fetchFromService(userId);
  };
  
  // Private method to fetch from service
  const fetchFromService = async (userId: string) => {
    try {
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
      // Don't show loading if we have a cached profile
      const hasCache = !!localStorage.getItem(`profile_${userId}`);
      if (!hasCache) {
        setLoading(true);
      }
      
      const result = await createUserProfileService(userId, email);
      
      // Only fetch if necessary
      if (result.success && !hasCache) {
        await fetchUserProfile(userId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
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
      // Update local state immediately
      if (profile) {
        const updatedProfile = { ...profile, ...data };
        setProfile(updatedProfile);
        
        // Also pre-cache the update
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
        } catch (e) {
          console.error("Error updating localStorage:", e);
        }
      }
      
      // Update in background
      setLoading(true);
      const { error, success } = await updateUserProfileService(userId, data);
      
      if (error) {
        console.log("useUserProfile: Update failed:", error);
      }
      
      return { error, success: success || !!profile };
    } catch (error) {
      console.error("Exception in updateProfile:", error);
      return { error, success: !!profile };
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
