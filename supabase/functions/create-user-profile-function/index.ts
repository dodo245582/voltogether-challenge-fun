
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse the request body
    let userId, email;
    try {
      const body = await req.json();
      userId = body.userId;
      email = body.email;
    } catch (parseError) {
      console.error("Edge function: Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid request body format",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate input parameters
    if (!userId || !email) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Edge function: Creating user profile for:", userId);

    // First check if the profile already exists
    const { data: existingProfile, error: lookupError } = await supabaseClient
      .from('Users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (lookupError) {
      console.error("Edge function: Error looking up profile:", lookupError);
      return new Response(
        JSON.stringify({
          error: lookupError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If profile already exists, return success
    if (existingProfile) {
      console.log("Edge function: Profile already exists");
      return new Response(
        JSON.stringify({
          success: true,
          data: existingProfile,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Try to insert the profile with a few retries for race conditions
    let retryCount = 0;
    const maxRetries = 3;
    let lastError = null;

    while (retryCount < maxRetries) {
      try {
        // Insert new profile with admin privileges to bypass RLS
        const { data, error } = await supabaseClient
          .from('Users')
          .insert({
            id: userId,
            email: email,
            name: '',
            total_points: 0,
            completed_challenges: 0,
            streak: 0,
            profile_completed: false
          })
          .select();

        if (!error) {
          console.log("Edge function: Profile created successfully");
          return new Response(
            JSON.stringify({
              success: true,
              data: data[0],
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // If error is a duplicate key error, try to fetch the existing profile
        if (error.code === '23505') {
          console.log("Edge function: Duplicate key error, fetching existing profile");
          
          const { data: existingData, error: fetchError } = await supabaseClient
            .from('Users')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
          if (!fetchError && existingData) {
            console.log("Edge function: Successfully fetched existing profile");
            return new Response(
              JSON.stringify({
                success: true,
                data: existingData,
              }),
              {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          
          lastError = fetchError || error;
        } else {
          console.error("Edge function: Error creating profile:", error);
          lastError = error;
        }
      } catch (err) {
        console.error("Edge function: Unexpected error in retry loop:", err);
        lastError = err;
      }

      // Increment retry count and delay with exponential backoff
      retryCount++;
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 100; // 200, 400, 800ms...
        console.log(`Edge function: Retrying profile creation in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // If we've exhausted retries, return the last error
    console.error("Edge function: Failed to create profile after retries:", lastError);
    return new Response(
      JSON.stringify({
        error: lastError?.message || "Failed to create profile after multiple attempts",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({
        error: err.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
