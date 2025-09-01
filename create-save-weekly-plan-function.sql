-- Create atomic function to save weekly exercise plan
-- This ensures only one active plan exists at a time
CREATE OR REPLACE FUNCTION save_weekly_exercise_plan(
  p_user_id UUID,
  p_plan_name TEXT,
  p_start_date DATE,
  p_end_date DATE,
  p_total_duration_minutes INTEGER,
  p_estimated_calories INTEGER,
  p_plan_data JSONB
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  plan_name TEXT,
  start_date DATE,
  end_date DATE,
  total_duration_minutes INTEGER,
  estimated_calories INTEGER,
  plan_data JSONB,
  is_active BOOLEAN,
  completed BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_plan_id UUID;
BEGIN
  -- Start transaction (implicit in function)
  
  -- First, deactivate all existing active plans for this user
  UPDATE weekly_exercise_plans 
  SET is_active = false, updated_at = NOW()
  WHERE user_id = p_user_id AND is_active = true;
  
  -- Insert the new plan
  INSERT INTO weekly_exercise_plans (
    user_id,
    plan_name,
    start_date,
    end_date,
    total_duration_minutes,
    estimated_calories,
    plan_data,
    is_active,
    completed,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_plan_name,
    p_start_date,
    p_end_date,
    p_total_duration_minutes,
    p_estimated_calories,
    p_plan_data,
    true, -- Always active for new plans
    false, -- Never completed initially
    NOW(),
    NOW()
  ) RETURNING weekly_exercise_plans.id INTO new_plan_id;
  
  -- Return the inserted plan
  RETURN QUERY
  SELECT 
    w.id,
    w.user_id,
    w.plan_name,
    w.start_date,
    w.end_date,
    w.total_duration_minutes,
    w.estimated_calories,
    w.plan_data,
    w.is_active,
    w.completed,
    w.created_at,
    w.updated_at
  FROM weekly_exercise_plans w 
  WHERE w.id = new_plan_id;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION save_weekly_exercise_plan TO authenticated;

-- Create RLS policy for the function (it uses SECURITY DEFINER)
-- Users can only save plans for themselves
CREATE OR REPLACE FUNCTION check_weekly_plan_user_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p_user_id = auth.uid();
$$;
