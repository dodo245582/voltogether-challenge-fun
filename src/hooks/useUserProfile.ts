
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
    
    // Always check localStorage first for immediate response
    try {
      const cachedData = localStorage.getItem(`profile_${userId}`);
      if (cachedData) {
        const cachedProfile = JSON.parse(cachedData);
        // Update state immediately with cached data
        setProfile(cachedProfile);
        
        // If we're not already loading, fetch fresh data in background
        if (!loading) {
          // Use setTimeout to prevent blocking the main thread
          setTimeout(() => {
            fetchFromService(userId).catch(e => 
              console.error("Background profile fetch error:", e)
            );
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
        
        // Update localStorage cache without blocking
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
          
          // Update specific values individually
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

  // Optimize profile creation check to use caching
  const createUserProfileIfNotExists = async (userId: string, email: string | undefined) => {
    if (!userId || !email) {
      console.error("Missing userId or email in createUserProfileIfNotExists");
      return { success: false, error: new Error("Missing userId or email") };
    }
    
    try {
      console.log("Creating/checking user profile for:", userId, email);
      
      // Check if we already have a cached profile
      const hasCache = !!localStorage.getItem(`profile_${userId}`);
      
      // Only show loading if no cache exists
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

  // Optimize profile updates to update local state immediately
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
        
        // Also pre-cache the update for faster access
        try {
          localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
          
          // Update specific values for immediate UI updates
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
      
      // Update database in background
      setLoading(true);
      console.log("useUserProfile: Sending profile update to database:", data);
      
      const { error, success } = await updateUserProfileService(userId, data);
      
      if (error) {
        console.error("useUserProfile: Update failed:", error);
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
