
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
    if (!userId) return null;
    
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
          setTimeout(() => {
            fetchFromService(userId);
          }, 0);
          return cachedProfile;
        }
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
    
    // If no cache or loading already in progress, show loading
    setLoading(true);
    return await fetchFromService(userId);
  };
  
  // Private method to fetch from service
  const fetchFromService = async (userId: string) => {
    try {
      const { data, error } = await fetchUserProfileService(userId);
      
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      if (data) {
        setProfile(data);
        
        // Update localStorage cache
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
          
          // Also update specific values in localStorage
          if (data.total_points !== undefined) {
            localStorage.setItem('totalPoints', data.total_points.toString());
          }
          if (data.completed_challenges !== undefined) {
            localStorage.setItem('completedChallenges', data.completed_challenges.toString());
          }
          if (data.streak !== undefined) {
            localStorage.setItem('streak', data.streak.toString());
          }
          if (data.selected_actions) {
            localStorage.setItem('userSelectedActions', JSON.stringify(data.selected_actions));
          }
        } catch (e) {
          console.error("Error updating localStorage:", e);
        }
        
        return data;
      }
      
      return null;
    } catch (error) {
      console.error("Exception in fetchUserProfile:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
    if (!userId || !email) {
      console.error("Missing userId or email in createUserProfileIfNotExists");
      return { success: false, error: new Error("Missing userId or email") };
    }
    
    try {
      console.log("Creating/checking user profile for:", userId, email);
      // Don't show loading if we have a cached profile
      const hasCache = !!localStorage.getItem(`profile_${userId}`);
      if (!hasCache) {
        setLoading(true);
      }
      
      const result = await createUserProfileService(userId, email);
      console.log("Profile creation service result:", result);
      
      // If we have data from the service, update the profile
      if (result.success && result.data) {
        setProfile(result.data);
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(result.data));
        } catch (e) {
          console.error("Error updating localStorage:", e);
        }
      }
      // Only fetch if necessary and we don't have data from the creation
      else if (result.success && !result.data && !hasCache) {
        await fetchUserProfile(userId);
      } else {
        setLoading(false);
      }
      
      return result;
    } catch (error) {
      console.error("Error creating profile:", error);
      setLoading(false);
      return { success: false, error };
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
      // Update local state immediately for better UX
      if (profile) {
        const updatedProfile = { ...profile, ...data };
        setProfile(updatedProfile);
        
        // Also pre-cache the update
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
          
          // Update specific localStorage values for immediate UI updates
          if (data.total_points !== undefined) {
            localStorage.setItem('totalPoints', data.total_points.toString());
          }
          if (data.completed_challenges !== undefined) {
            localStorage.setItem('completedChallenges', data.completed_challenges.toString());
          }
          if (data.streak !== undefined) {
            localStorage.setItem('streak', data.streak.toString());
          }
          if (data.selected_actions) {
            localStorage.setItem('userSelectedActions', JSON.stringify(data.selected_actions));
          }
        } catch (e) {
          console.error("Error updating localStorage:", e);
        }
      }
      
      // Update in database
      setLoading(true);
      const { error, success } = await updateUserProfileService(userId, data);
      
      if (error) {
        console.log("useUserProfile: Update failed:", error);
      } else {
        console.log("useUserProfile: Profile updated successfully in database");
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
