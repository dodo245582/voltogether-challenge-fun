
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Updates a user profile
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  console.log("Tentativo aggiornamento profilo per userId:", userId, "con dati:", data);

  try {
    // Create a clean data object without any undefined values
    const cleanData: Record<string, any> = {};
    
    // Only include defined values
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    });
    
    console.log("Dati puliti per aggiornamento:", cleanData);

    const { error } = await supabase
      .from('Users')
      .update(cleanData)
      .eq('id', userId);

    if (error) {
      console.error("Errore nell'aggiornamento profilo Supabase:", error);
      return { success: false, error };
    }

    console.log("Profilo aggiornato correttamente su Supabase");
    return { success: true, error: null };
  } catch (err) {
    console.error("Eccezione durante l'aggiornamento del profilo:", err);
    return { success: false, error: err };
  }
};
