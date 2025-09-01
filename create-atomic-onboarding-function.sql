-- Create truly atomic onboarding function for transactional signup + onboarding
-- This function ensures that account creation and onboarding data are processed atomically
-- Re-raises exceptions to force full transaction rollback

CREATE OR REPLACE FUNCTION public.process_onboarding_data_atomic(
  p_user_id uuid,
  p_name text,
  p_date_of_birth date,
  p_fitness_goal text,
  p_fitness_frequency text,
  p_fitness_experience text,
  p_nutrition_goal text,
  p_activity_level text,
  p_nutrition_experience text,
  p_height numeric,
  p_weight numeric,
  p_weight_goal numeric,
  p_units text,
  p_plan text DEFAULT 'free'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_account_id uuid;
  v_fitness_goals_id uuid;
  v_nutrition_goals_id uuid;
  v_body_measurements_id uuid;
  v_weight_entry_id uuid;
BEGIN
  -- 1. Create/Update Account record
  INSERT INTO public.accounts (
    user_id,
    name,
    display_name,
    date_of_birth,
    onboarding_completed,
    subscription_status,
    subscription_plan,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_name,
    p_name,
    p_date_of_birth,
    true, -- Mark onboarding as completed
    CASE 
      WHEN p_plan = 'free' THEN 'free'
      ELSE 'inactive' -- Will be updated by payment flow
    END,
    p_plan,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    display_name = EXCLUDED.display_name,
    date_of_birth = EXCLUDED.date_of_birth,
    onboarding_completed = true,
    subscription_plan = EXCLUDED.subscription_plan,
    updated_at = now()
  RETURNING id INTO v_account_id;

  -- 2. Create/Update Fitness Goals
  INSERT INTO public.fitness_goals (
    user_id,
    primary_goal,
    workout_frequency,
    experience_level,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_fitness_goal,
    p_fitness_frequency,
    p_fitness_experience,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    primary_goal = EXCLUDED.primary_goal,
    workout_frequency = EXCLUDED.workout_frequency,
    experience_level = EXCLUDED.experience_level,
    updated_at = now()
  RETURNING id INTO v_fitness_goals_id;

  -- 3. Create/Update Nutrition Goals
  INSERT INTO public.nutrition_goals (
    user_id,
    primary_goal,
    activity_level,
    tracking_experience,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_nutrition_goal,
    p_activity_level,
    p_nutrition_experience,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    primary_goal = EXCLUDED.primary_goal,
    activity_level = EXCLUDED.activity_level,
    tracking_experience = EXCLUDED.tracking_experience,
    updated_at = now()
  RETURNING id INTO v_nutrition_goals_id;

  -- 4. Create/Update Body Measurements
  INSERT INTO public.body_measurements (
    user_id,
    height,
    current_weight,
    goal_weight,
    units,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_height,
    p_weight,
    p_weight_goal,
    p_units,
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    height = EXCLUDED.height,
    current_weight = EXCLUDED.current_weight,
    goal_weight = EXCLUDED.goal_weight,
    units = EXCLUDED.units,
    updated_at = now()
  RETURNING id INTO v_body_measurements_id;

  -- 5. Add initial weight entry to history (requires UNIQUE index on user_id, measured_at)
  INSERT INTO public.weight_history (
    user_id,
    weight,
    units,
    note,
    measured_at,
    created_at
  ) VALUES (
    p_user_id,
    p_weight,
    p_units,
    'Initial weight from onboarding',
    current_date,
    now()
  )
  ON CONFLICT (user_id, measured_at) DO UPDATE SET
    weight = EXCLUDED.weight,
    units = EXCLUDED.units,
    note = EXCLUDED.note
  RETURNING id INTO v_weight_entry_id;

  -- Build success response with created IDs
  result := jsonb_build_object(
    'success', true,
    'message', 'Onboarding data processed successfully',
    'account_id', v_account_id,
    'fitness_goals_id', v_fitness_goals_id,
    'nutrition_goals_id', v_nutrition_goals_id,
    'body_measurements_id', v_body_measurements_id,
    'weight_entry_id', v_weight_entry_id,
    'onboarding_completed', true
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Optional: Log the error for debugging
    RAISE LOG 'process_onboarding_data_atomic failed for user %: % (%).', p_user_id, SQLERRM, SQLSTATE;
    
    -- **Re-raise the exception to force full transaction rollback**
    RAISE;
END;
$$;

-- Ensure required unique indexes exist for ON CONFLICT clauses
DO $$
BEGIN
  -- Index for fitness_goals(user_id) - should already exist from table creation
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'fitness_goals_user_id_key') THEN
    CREATE UNIQUE INDEX fitness_goals_user_id_key ON public.fitness_goals(user_id);
  END IF;
  
  -- Index for nutrition_goals(user_id) - should already exist from table creation
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'nutrition_goals_user_id_key') THEN
    CREATE UNIQUE INDEX nutrition_goals_user_id_key ON public.nutrition_goals(user_id);
  END IF;
  
  -- Index for body_measurements(user_id) - should already exist from table creation
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'body_measurements_user_id_key') THEN
    CREATE UNIQUE INDEX body_measurements_user_id_key ON public.body_measurements(user_id);
  END IF;
  
  -- Index for weight_history(user_id, measured_at) - may need to be created
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'weight_history_user_id_measured_at_key') THEN
    CREATE UNIQUE INDEX weight_history_user_id_measured_at_key ON public.weight_history(user_id, measured_at);
  END IF;
END
$$;

-- Tighter security: Only service_role can execute this function
REVOKE ALL ON FUNCTION public.process_onboarding_data_atomic(uuid,text,date,text,text,text,text,text,text,numeric,numeric,numeric,text,text) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.process_onboarding_data_atomic(uuid,text,date,text,text,text,text,text,text,numeric,numeric,numeric,text,text) TO service_role;

-- Add helpful comment
COMMENT ON FUNCTION public.process_onboarding_data_atomic(uuid,text,date,text,text,text,text,text,text,numeric,numeric,numeric,text,text) IS 
'Processes onboarding in one transaction. Raises on error so the caller can roll back user creation. Only callable by service_role.';
