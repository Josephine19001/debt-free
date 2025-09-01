-- ================================================================
-- Fix Exercise Logging Issues - Complete Solution
-- Run this after test-exercise-functionality.sql to fix any issues
-- ================================================================

-- ================================================================
-- 1. ENSURE ALL REQUIRED TABLES EXIST
-- ================================================================

-- Exercise entries table with proper structure
CREATE TABLE IF NOT EXISTS exercise_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,
  intensity TEXT CHECK (intensity IN ('low', 'moderate', 'high')) DEFAULT 'moderate',
  notes TEXT,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_time TIME WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Weekly exercise plans table with proper structure
CREATE TABLE IF NOT EXISTS weekly_exercise_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_duration_minutes INTEGER DEFAULT 0,
  estimated_calories INTEGER DEFAULT 0,
  plan_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Fitness goals table
CREATE TABLE IF NOT EXISTS fitness_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  daily_steps INTEGER,
  weekly_workouts INTEGER,
  target_weight DECIMAL(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  primary_goal TEXT CHECK (primary_goal IN ('lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle', 'improve_fitness')),
  workout_preferences TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- ================================================================
-- 2. CREATE PERFORMANCE INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_date ON exercise_entries(user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_created ON exercise_entries(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_weekly_exercise_plans_user_active ON weekly_exercise_plans(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_exercise_plans_date_range ON weekly_exercise_plans(start_date, end_date);

-- ================================================================
-- 3. ENABLE RLS AND CREATE POLICIES
-- ================================================================
ALTER TABLE exercise_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_exercise_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "exercise_entries_user_policy" ON exercise_entries;
DROP POLICY IF EXISTS "exercise_entries_insert_policy" ON exercise_entries;
DROP POLICY IF EXISTS "exercise_entries_update_policy" ON exercise_entries;
DROP POLICY IF EXISTS "exercise_entries_delete_policy" ON exercise_entries;

DROP POLICY IF EXISTS "weekly_exercise_plans_user_policy" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "weekly_exercise_plans_insert_policy" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "weekly_exercise_plans_update_policy" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "weekly_exercise_plans_delete_policy" ON weekly_exercise_plans;

DROP POLICY IF EXISTS "fitness_goals_user_policy" ON fitness_goals;
DROP POLICY IF EXISTS "fitness_goals_insert_policy" ON fitness_goals;
DROP POLICY IF EXISTS "fitness_goals_update_policy" ON fitness_goals;
DROP POLICY IF EXISTS "fitness_goals_delete_policy" ON fitness_goals;

-- Create comprehensive RLS policies for exercise_entries
CREATE POLICY "exercise_entries_user_policy" ON exercise_entries
  FOR ALL USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for weekly_exercise_plans  
CREATE POLICY "weekly_exercise_plans_user_policy" ON weekly_exercise_plans
  FOR ALL USING (auth.uid() = user_id);

-- Create comprehensive RLS policies for fitness_goals
CREATE POLICY "fitness_goals_user_policy" ON fitness_goals
  FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- 4. CREATE TRIGGERS FOR UPDATED_AT
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_exercise_entries_updated_at ON exercise_entries;
CREATE TRIGGER update_exercise_entries_updated_at
  BEFORE UPDATE ON exercise_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_exercise_plans_updated_at ON weekly_exercise_plans;
CREATE TRIGGER update_weekly_exercise_plans_updated_at
  BEFORE UPDATE ON weekly_exercise_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fitness_goals_updated_at ON fitness_goals;
CREATE TRIGGER update_fitness_goals_updated_at
  BEFORE UPDATE ON fitness_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 5. POPULATE EXERCISE DATABASE WITH ESSENTIAL EXERCISES
-- ================================================================
INSERT INTO exercise_database (name, category, muscle_groups, equipment, difficulty, instructions, calories_per_minute, verified)
VALUES
  ('Push-ups', 'strength', ARRAY['chest', 'shoulders', 'triceps'], 'bodyweight', 'beginner', 'Start in plank position, lower body to ground, push back up', 8.0, true),
  ('Squats', 'strength', ARRAY['legs', 'glutes'], 'bodyweight', 'beginner', 'Stand with feet shoulder-width apart, lower hips back and down, return to standing', 6.5, true),
  ('Jumping Jacks', 'cardio', ARRAY['full_body'], 'bodyweight', 'beginner', 'Jump feet apart while raising arms overhead, return to start position', 9.0, true),
  ('Plank', 'core', ARRAY['core', 'shoulders'], 'bodyweight', 'beginner', 'Hold plank position with straight body line from head to heels', 4.0, true),
  ('Mountain Climbers', 'cardio', ARRAY['core', 'shoulders'], 'bodyweight', 'intermediate', 'From plank position, alternate bringing knees to chest rapidly', 10.0, true),
  ('Burpees', 'cardio', ARRAY['full_body'], 'bodyweight', 'intermediate', 'Squat down, jump back to plank, push-up, jump forward, jump up with arms overhead', 12.0, true),
  ('Lunges', 'strength', ARRAY['legs', 'glutes'], 'bodyweight', 'beginner', 'Step forward into lunge, lower hips until both knees at 90 degrees, push back to start', 6.0, true),
  ('Pull-ups', 'strength', ARRAY['back', 'biceps'], 'pull_up_bar', 'intermediate', 'Hang from bar with arms extended, pull body up until chin clears bar', 9.0, true),
  ('Running', 'cardio', ARRAY['legs'], 'none', 'beginner', 'Maintain steady pace for desired duration', 11.0, true),
  ('Walking', 'cardio', ARRAY['legs'], 'none', 'beginner', 'Brisk walking pace for desired duration', 4.5, true),
  ('Yoga Flow', 'flexibility', ARRAY['full_body'], 'yoga_mat', 'beginner', 'Flow through various yoga poses focusing on breathing and flexibility', 3.5, true),
  ('Deadlifts', 'strength', ARRAY['back', 'legs', 'glutes'], 'barbell', 'intermediate', 'Hip hinge movement lifting weight from ground to standing position', 7.5, true)
ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- 6. CREATE HELPER FUNCTIONS FOR DEBUGGING
-- ================================================================

-- Function to test exercise entry creation
CREATE OR REPLACE FUNCTION test_exercise_entry_creation(
  p_user_id UUID,
  p_exercise_name TEXT DEFAULT 'Test Exercise',
  p_duration INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  new_entry_id UUID;
BEGIN
  -- Try to insert a test exercise entry
  INSERT INTO exercise_entries (
    user_id,
    exercise_name,
    exercise_type,
    duration_minutes,
    calories_burned,
    intensity,
    notes
  ) VALUES (
    p_user_id,
    p_exercise_name,
    'strength',
    p_duration,
    p_duration * 8, -- 8 calories per minute
    'moderate',
    'Test entry created by helper function'
  ) RETURNING id INTO new_entry_id;
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'entry_id', new_entry_id,
    'message', 'Exercise entry created successfully'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create exercise entry'
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to test weekly plan creation
CREATE OR REPLACE FUNCTION test_weekly_plan_creation(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  new_plan_id UUID;
  sample_plan JSONB;
BEGIN
  -- Create sample plan data
  sample_plan := jsonb_build_object(
    'plan_name', 'Test Weekly Plan',
    'days', jsonb_build_array(
      jsonb_build_object(
        'date', CURRENT_DATE::text,
        'day_name', 'Monday',
        'is_rest_day', false,
        'workout_type', 'strength',
        'duration_minutes', 45,
        'exercises', jsonb_build_array(
          jsonb_build_object(
            'name', 'Push-ups',
            'sets', 3,
            'reps', '10-15',
            'duration_minutes', 15
          )
        )
      )
    )
  );
  
  -- Try to insert a test weekly plan
  INSERT INTO weekly_exercise_plans (
    user_id,
    plan_name,
    start_date,
    end_date,
    total_duration_minutes,
    estimated_calories,
    plan_data,
    is_active
  ) VALUES (
    p_user_id,
    'Test Weekly Plan',
    CURRENT_DATE,
    CURRENT_DATE + interval '6 days',
    300,
    1500,
    sample_plan,
    true
  ) RETURNING id INTO new_plan_id;
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'plan_id', new_plan_id,
    'message', 'Weekly plan created successfully'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create weekly plan'
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7. GRANT NECESSARY PERMISSIONS
-- ================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- ================================================================
-- 8. FINAL VERIFICATION
-- ================================================================
SELECT 'Exercise system setup complete!' as status;

-- Test basic functionality
SELECT 'Testing basic table access...' as test_step;

-- Verify each table is accessible
SELECT 
  'exercise_entries' as table_name,
  COUNT(*) as row_count,
  'accessible' as status
FROM exercise_entries 
WHERE FALSE -- Don't return actual data, just test access

UNION ALL

SELECT 
  'weekly_exercise_plans' as table_name,
  COUNT(*) as row_count,
  'accessible' as status
FROM weekly_exercise_plans 
WHERE FALSE

UNION ALL

SELECT 
  'fitness_goals' as table_name,
  COUNT(*) as row_count,
  'accessible' as status
FROM fitness_goals 
WHERE FALSE

UNION ALL

SELECT 
  'exercise_database' as table_name,
  COUNT(*) as row_count,
  'accessible' as status
FROM exercise_database;

SELECT '✅ All fixes applied successfully!' as final_status;
SELECT 'Run test-exercise-functionality.sql to verify everything works' as next_step;
