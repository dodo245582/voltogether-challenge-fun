
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Fetches a user profile by user ID with optimized caching
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    console.log("Service: Fetching user profile for ID:", userId);
    
    // Check localStorage first for immediate response
    try {
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        console.log("Service: Using cached profile");
        const profileData = JSON.parse(cachedProfile) as UserType;
        
        // Fetch fresh data in background without blocking
        setTimeout(() => {
          fetchProfileFromDatabase(userId).catch(e => 
            console.error("Background fetch error:", e)
          );
        }, 0);
        
        return { data: profileData, error: null };
      }
    } catch (e) {
      console.error("Error retrieving profile from localStorage:", e);
    }
    
    // If no cache, fetch directly from database
    return await fetchProfileFromDatabase(userId);
  } catch (error) {
    console.error("Service: Exception in fetchUserProfile:", error);
    return { data: null, error };
  }
};

// Optimized function to fetch from database and update localStorage
const fetchProfileFromDatabase = async (userId: string) => {
  try {
    // Use a more targeted query with column selection
    const { data, error } = await supabase
      .from('Users')
      .select('id, name, city, completed_challenges, total_points, streak, discovery_source, selected_actions, profile_completed, email')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Service: Error fetching user profile:', error);
      return { data: null, error };
    }
    
    if (data) {
      console.log("Service: User profile fetched successfully from DB");
      
      // Sanitize data
      const sanitizedData = {
        ...data,
        name: data.name || '',
        city: data.city || '',
        completed_challenges: data.completed_challenges || 0,
        total_points: data.total_points || 0,
        streak: data.streak || 0,
        discovery_source: data.discovery_source || '',
        selected_actions: data.selected_actions || []
      };
      
      // Update cache
      try {
        localStorage.setItem(`profile_${userId}`, JSON.stringify(sanitizedData));
      } catch (e) {
        console.error("Error storing profile in localStorage:", e);
      }
      
      return { data: sanitizedData as UserType, error: null };
    } else {
      console.log("Service: No user profile found");
      return { data: null, error: new Error("No user profile found") };
    }
  } catch (error) {
    console.error("Service: Database fetch error:", error);
    return { data: null, error };
  }
};
