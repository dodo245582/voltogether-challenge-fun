
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Fetches a user profile by user ID with optimized caching
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    // Always check localStorage first for immediate response
    try {
      const cachedProfile = localStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        const profileData = JSON.parse(cachedProfile) as UserType;
        
        // Fetch fresh data in background without blocking UI
        setTimeout(() => {
          fetchProfileFromDatabase(userId).catch(e => 
            console.error("Background fetch error:", e)
          );
        }, 100);
        
        return { data: profileData, error: null };
      }
    } catch (e) {
      console.error("Error retrieving profile from localStorage:", e);
    }
    
    // If no cache, fetch directly from database
    return await fetchProfileFromDatabase(userId);
  } catch (error) {
    console.error("fetchUserProfile exception:", error);
    return { data: null, error };
  }
};

// Optimized function to fetch from database and update localStorage
const fetchProfileFromDatabase = async (userId: string) => {
  try {
    console.log("Fetching user profile from database for ID:", userId);
    
    // Use a more targeted query with column selection
    const { data, error } = await supabase
      .from('Users')
      .select('id, name, city, completed_challenges, total_points, streak, discovery_source, selected_actions, profile_completed, email')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
    
    if (data) {
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
      return { data: null, error: new Error("No user profile found") };
    }
  } catch (error) {
    console.error("Database fetch error:", error);
    return { data: null, error };
  }
};
