
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create a Supabase client with the service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract data from the request
    const { userId, email } = await req.json();

    console.log("Creating user profile for:", userId);

    if (!userId || !email) {
      throw new Error("User ID and email are required");
    }

    // First check if a profile already exists for this user
    try {
      const { data: existingProfile, error: checkError } = await supabase
        .from("Users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (existingProfile) {
        console.log("Profile already exists for user:", userId);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Profile already exists", 
            data: existingProfile,
            existing: true 
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking for existing profile:", checkError);
      }
    } catch (checkError) {
      console.error("Exception checking for existing profile:", checkError);
      // Continue to create profile even if check fails
    }

    // Create a new user profile without setting password field
    const { data, error } = await supabase
      .from("Users")
      .insert({
        id: userId,
        email: email,
        completed_challenges: 0,
        total_points: 0,
        streak: 0,
        profile_completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      throw error;
    }

    console.log("Profile created successfully:", data);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Profile created successfully", 
        data: data,
        existing: false
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        error: error.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
