
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

    // Add a timeout for the insert operation to prevent long-running queries
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Profile creation timed out")), 5000); // 5 second timeout
    });

    // Create a new user profile with Promise.race to implement timeout
    const insertPromise = supabase.from("Users").insert([
      {
        id: userId,
        email: email,
        completed_challenges: 0,
        total_points: 0,
        streak: 0,
        profile_completed: false,
      },
    ]).select();

    // Use Promise.race to ensure the operation doesn't hang
    const { data, error } = await Promise.race([
      insertPromise,
      timeoutPromise.then(() => {
        throw new Error("Profile creation timed out");
      }),
    ]) as any;

    if (error) {
      // If there's a duplicate key error, it might be because another concurrent request created the profile
      if (error.code === "23505") {
        console.log("Profile may have been created by another request. Fetching existing profile.");
        const { data: retryData, error: retryError } = await supabase
          .from("Users")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (retryError) {
          console.error("Error fetching profile after duplicate key error:", retryError);
          throw retryError;
        }

        if (retryData) {
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Profile already exists (concurrent creation)", 
              data: retryData,
              existing: true 
            }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" } 
            }
          );
        }
      }
      
      console.error("Error creating profile:", error);
      throw error;
    }

    // Verify profile creation with a short timeout
    try {
      const verifyPromise = supabase
        .from("Users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      const { data: verificationData, error: verificationError } = await Promise.race([
        verifyPromise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Verification timed out")), 3000);
        }),
      ]) as any;

      if (verificationError) {
        console.error("Error verifying profile creation:", verificationError);
        // Continue with the response even if verification fails
      }

      console.log("Profile created successfully:", verificationData || data);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Profile created successfully", 
          data: verificationData || data[0],
          existing: false
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (verifyError) {
      console.error("Verification timed out but profile might be created:", verifyError);
      // Return success with the original data since verification timed out
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Profile created but verification timed out", 
          data: data[0],
          existing: false,
          verification_timeout: true
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
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
