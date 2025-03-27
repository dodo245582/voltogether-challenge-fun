
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
    const { userId, email } = await req.json();

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

    // Insert new profile with admin privileges to bypass RLS
    const { data, error } = await supabaseClient
      .from('Users')
      .insert({
        id: userId,
        email: email,
        name: '',
        total_points: 0,
        completed_challenges: 0,
        streak: 0
      })
      .select();

    if (error) {
      console.error("Edge function: Error creating profile:", error);
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
