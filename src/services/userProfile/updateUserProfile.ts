
import { supabase } from '@/integrations/supabase/client';
import { User as UserType } from '@/types';

/**
 * Updates a user profile with safe error handling
 */
export const updateUserProfile = async (userId: string, data: Partial<UserType>) => {
  console.log("Updating profile for userId:", userId, "with data:", data);

  if (!userId) {
    console.error("Missing userId in updateUserProfile");
    return { success: false, error: new Error("Missing userId") };
  }

  try {
    // Limitare la dimensione e complessità dei dati da salvare
    const cleanData: Record<string, any> = {};
    
    // Limitare le chiavi per evitare sovraccarichi
    const safeKeys = [
      'name', 'city', 'discovery_source', 'selected_actions', 
      'profile_completed', 'total_points', 'completed_challenges', 
      'streak'
    ];
    
    // Filtrare solo chiavi consentite e valori definiti
    Object.entries(data).forEach(([key, value]) => {
      if (safeKeys.includes(key) && value !== undefined && value !== null) {
        // Gestione array con limite di dimensione
        if (Array.isArray(value)) {
          cleanData[key] = value.slice(0, 20); // Limitare a 20 elementi
        } 
        // Gestione stringhe con limite di lunghezza
        else if (typeof value === 'string') {
          cleanData[key] = value.slice(0, 100); // Limitare a 100 caratteri
        }
        // Gestione valori booleani e numerici
        else if (typeof value === 'boolean' || typeof value === 'number') {
          cleanData[key] = value;
        }
      }
    });
    
    console.log("Clean data prepared for update:", cleanData);

    // Verificare che ci siano dati da aggiornare
    if (Object.keys(cleanData).length === 0) {
      console.log("No valid data to update");
      return { success: true, error: null }; // Considerare un successo per non bloccare il flusso
    }

    // Aggiornare con timeout per evitare blocchi
    const updatePromise = supabase
      .from('Users')
      .update(cleanData)
      .eq('id', userId);
    
    // Aggiungere timeout per evitare blocchi infiniti
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Update timeout exceeded")), 5000)
    );
    
    // Eseguire con timeout
    const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

    if (error) {
      console.error("Error updating profile in Supabase:", error);
      return { success: false, error };
    }

    console.log("Profile successfully updated in Supabase");
    return { success: true, error: null };
  } catch (err) {
    console.error("Exception during profile update:", err);
    return { success: false, error: err };
  }
};
