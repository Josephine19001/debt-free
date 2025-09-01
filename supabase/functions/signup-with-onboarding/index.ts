import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  plan?: 'yearly' | 'monthly' | 'free';
  appleCredential?: {
    identityToken: string;
    nonce: string;
    fullName?: {
      givenName?: string;
      familyName?: string;
    };
  };
  onboardingData: {
    name: string;
    dateOfBirth: string;
    fitnessGoal: string;
    fitnessFrequency: string;
    fitnessExperience: string;
    nutritionGoal: string;
    activityLevel: string;
    nutritionExperience: string;
    height: number;
    weight: number;
    weightGoal: number;
    units: string;
    plan: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create admin Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create regular Supabase client for auth operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const body: SignupRequest = await req.json();

    let authResult;
    let userData = {
      first_name: '',
      last_name: '',
      selected_plan: body.plan || 'free',
    };

    // Step 1: Authenticate user based on method
    if (body.appleCredential) {
      // Apple Sign-in
      userData.first_name =
        body.appleCredential.fullName?.givenName || body.onboardingData.name.split(' ')[0] || '';
      userData.last_name =
        body.appleCredential.fullName?.familyName ||
        body.onboardingData.name.split(' ').slice(1).join(' ') ||
        '';

      authResult = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: body.appleCredential.identityToken,
        nonce: body.appleCredential.nonce,
        options: {
          data: userData,
        },
      });
    } else if (body.email && body.password) {
      // Email Sign-up
      if (!body.firstName || !body.lastName) {
        throw new Error('First name and last name are required for email signup');
      }

      userData.first_name = body.firstName;
      userData.last_name = body.lastName;

      authResult = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          data: userData,
        },
      });
    } else {
      throw new Error('Invalid authentication method');
    }

    if (authResult.error) {
      throw authResult.error;
    }

    if (!authResult.data.user) {
      throw new Error('User creation failed');
    }

    const userId = authResult.data.user.id;

    // Step 2: Process onboarding data transactionally using admin client
    // This ensures the database operations succeed even if the user hasn't confirmed email
    const { data: onboardingResult, error: onboardingError } = await supabaseAdmin.rpc(
      'process_onboarding_data_atomic',
      {
        p_user_id: userId,
        p_name: body.onboardingData.name,
        p_date_of_birth: body.onboardingData.dateOfBirth,
        p_fitness_goal: body.onboardingData.fitnessGoal,
        p_fitness_frequency: body.onboardingData.fitnessFrequency,
        p_fitness_experience: body.onboardingData.fitnessExperience,
        p_nutrition_goal: body.onboardingData.nutritionGoal,
        p_activity_level: body.onboardingData.activityLevel,
        p_nutrition_experience: body.onboardingData.nutritionExperience,
        p_height: body.onboardingData.height,
        p_weight: body.onboardingData.weight,
        p_weight_goal: body.onboardingData.weightGoal,
        p_units: body.onboardingData.units,
        p_plan: body.plan || 'free',
      }
    );

    if (onboardingError) {
      console.error('Onboarding processing failed:', onboardingError);

      // If onboarding fails, we should clean up the user account
      // Note: This is a critical failure - user was created but onboarding failed
      await supabaseAdmin.auth.admin.deleteUser(userId);

      throw new Error(`Account setup failed: ${onboardingError.message}`);
    }

    // Step 3: Return success response
    return new Response(
      JSON.stringify({
        success: true,
        user: authResult.data.user,
        session: authResult.data.session,
        onboardingResult,
        message: 'Account created and onboarding completed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Signup with onboarding failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Signup failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
