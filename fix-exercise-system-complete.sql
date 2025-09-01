-- ================================================================
-- Complete Exercise System Fix
-- Run this AFTER running diagnose-exercise-system.sql
-- ================================================================

-- ================================================================
-- 1. ENSURE EXERCISE_ENTRIES TABLE EXISTS WITH CORRECT STRUCTURE
-- ================================================================
CREATE TABLE IF NOT EXISTS exercise_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER DEFAULT 0,
  intensity TEXT CHECK (intensity IN ('low', 'moderate', 'high')) DEFAULT 'moderate',
  notes TEXT,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_time TIME WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================================
-- 2. ENSURE WEEKLY_EXERCISE_PLANS TABLE EXISTS WITH CORRECT STRUCTURE
-- ================================================================
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

-- ================================================================
-- 3. ENSURE FITNESS_GOALS TABLE EXISTS
-- ================================================================
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
-- 4. ENSURE EXERCISE_DATABASE TABLE EXISTS
-- ================================================================
CREATE TABLE IF NOT EXISTS exercise_database (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  muscle_groups TEXT[] DEFAULT '{}',
  equipment TEXT DEFAULT 'bodyweight',
  difficulty TEXT DEFAULT 'beginner',
  instructions TEXT,
  calories_per_minute DECIMAL(4,1) DEFAULT 5.0,
  source TEXT DEFAULT 'user_contribution',
  contributor_id UUID REFERENCES auth.users(id),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_id ON exercise_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_date ON exercise_entries(logged_date);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_date ON exercise_entries(user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_type ON exercise_entries(exercise_type);

CREATE INDEX IF NOT EXISTS idx_weekly_exercise_plans_user_id ON weekly_exercise_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_exercise_plans_start_date ON weekly_exercise_plans(start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_exercise_plans_active ON weekly_exercise_plans(is_active);

CREATE INDEX IF NOT EXISTS idx_fitness_goals_user_id ON fitness_goals(user_id);

CREATE INDEX IF NOT EXISTS idx_exercise_database_name ON exercise_database(name);
CREATE INDEX IF NOT EXISTS idx_exercise_database_category ON exercise_database(category);
CREATE INDEX IF NOT EXISTS idx_exercise_database_muscle_groups ON exercise_database USING GIN(muscle_groups);
CREATE INDEX IF NOT EXISTS idx_exercise_database_verified ON exercise_database(verified);

-- ================================================================
-- 6. ENABLE RLS ON ALL TABLES
-- ================================================================
ALTER TABLE exercise_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_exercise_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_database ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 7. DROP EXISTING POLICIES (IF ANY) AND CREATE NEW ONES
-- ================================================================

-- Exercise Entries Policies
DROP POLICY IF EXISTS "Users can view their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can insert their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can update their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can delete their own exercise entries" ON exercise_entries;

CREATE POLICY "Users can view their own exercise entries"
  ON exercise_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise entries"
  ON exercise_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise entries"
  ON exercise_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise entries"
  ON exercise_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Weekly Exercise Plans Policies
DROP POLICY IF EXISTS "Users can view their own weekly exercise plans" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "Users can insert their own weekly exercise plans" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "Users can update their own weekly exercise plans" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "Users can delete their own weekly exercise plans" ON weekly_exercise_plans;

CREATE POLICY "Users can view their own weekly exercise plans"
  ON weekly_exercise_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly exercise plans"
  ON weekly_exercise_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly exercise plans"
  ON weekly_exercise_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly exercise plans"
  ON weekly_exercise_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Fitness Goals Policies
DROP POLICY IF EXISTS "Users can view their own fitness goals" ON fitness_goals;
DROP POLICY IF EXISTS "Users can insert their own fitness goals" ON fitness_goals;
DROP POLICY IF EXISTS "Users can update their own fitness goals" ON fitness_goals;
DROP POLICY IF EXISTS "Users can delete their own fitness goals" ON fitness_goals;

CREATE POLICY "Users can view their own fitness goals"
  ON fitness_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fitness goals"
  ON fitness_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fitness goals"
  ON fitness_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fitness goals"
  ON fitness_goals FOR DELETE
  USING (auth.uid() = user_id);

-- Exercise Database Policies (Public read, authenticated users can contribute)
DROP POLICY IF EXISTS "Anyone can view exercise database" ON exercise_database;
DROP POLICY IF EXISTS "Authenticated users can contribute exercises" ON exercise_database;
DROP POLICY IF EXISTS "Users can update their own exercise contributions" ON exercise_database;

CREATE POLICY "Anyone can view exercise database"
  ON exercise_database FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can contribute exercises"
  ON exercise_database FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = contributor_id);

CREATE POLICY "Users can update their own exercise contributions"
  ON exercise_database FOR UPDATE
  TO authenticated
  USING (auth.uid() = contributor_id);

-- ================================================================
-- 8. CREATE TRIGGER FUNCTIONS FOR UPDATED_AT
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ================================================================
-- 9. CREATE TRIGGERS FOR UPDATED_AT
-- ================================================================
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

DROP TRIGGER IF EXISTS update_exercise_database_updated_at ON exercise_database;
CREATE TRIGGER update_exercise_database_updated_at
  BEFORE UPDATE ON exercise_database
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 10. INSERT SAMPLE EXERCISE DATABASE DATA (IF EMPTY)
-- ================================================================
INSERT INTO exercise_database (name, category, muscle_groups, equipment, difficulty, instructions, calories_per_minute, verified)
SELECT * FROM (VALUES
  ('Push-ups', 'strength', ARRAY['chest', 'shoulders', 'triceps'], 'bodyweight', 'beginner', 'Start in plank position, lower body, push back up', 8.0, true),
  ('Squats', 'strength', ARRAY['legs', 'glutes'], 'bodyweight', 'beginner', 'Stand with feet shoulder-width apart, lower hips back and down', 6.5, true),
  ('Jumping Jacks', 'cardio', ARRAY['full_body'], 'bodyweight', 'beginner', 'Jump feet apart while raising arms overhead, return to start', 9.0, true),
  ('Plank', 'core', ARRAY['core', 'shoulders'], 'bodyweight', 'beginner', 'Hold plank position with straight body line', 4.0, true),
  ('Mountain Climbers', 'cardio', ARRAY['core', 'shoulders'], 'bodyweight', 'intermediate', 'From plank, alternate bringing knees to chest rapidly', 10.0, true),
  ('Burpees', 'cardio', ARRAY['full_body'], 'bodyweight', 'intermediate', 'Squat down, jump back to plank, push-up, jump forward, jump up', 12.0, true),
  ('Lunges', 'strength', ARRAY['legs', 'glutes'], 'bodyweight', 'beginner', 'Step forward, lower hips until both knees at 90 degrees', 6.0, true),
  ('Pull-ups', 'strength', ARRAY['back', 'biceps'], 'pull_up_bar', 'intermediate', 'Hang from bar, pull body up until chin over bar', 9.0, true)
) AS sample_data(name, category, muscle_groups, equipment, difficulty, instructions, calories_per_minute, verified)
WHERE NOT EXISTS (SELECT 1 FROM exercise_database WHERE verified = true);

-- ================================================================
-- 11. CREATE HELPER FUNCTIONS
-- ================================================================

-- Function to get user's exercise statistics
CREATE OR REPLACE FUNCTION get_user_exercise_stats(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_workouts', COUNT(*),
    'total_minutes', SUM(duration_minutes),
    'total_calories', SUM(calories_burned),
    'last_workout_date', MAX(logged_date),
    'favorite_exercise_type', (
      SELECT exercise_type 
      FROM exercise_entries 
      WHERE user_id = target_user_id 
      GROUP BY exercise_type 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    )
  ) INTO result
  FROM exercise_entries
  WHERE user_id = target_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get weekly plan summary
CREATE OR REPLACE FUNCTION get_weekly_plan_summary(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_plans', COUNT(*),
    'active_plans', COUNT(*) FILTER (WHERE is_active = true),
    'completed_plans', COUNT(*) FILTER (WHERE completed = true),
    'current_plan', (
      SELECT json_build_object(
        'id', id,
        'plan_name', plan_name,
        'start_date', start_date,
        'end_date', end_date,
        'total_duration_minutes', total_duration_minutes
      )
      FROM weekly_exercise_plans
      WHERE user_id = target_user_id 
        AND is_active = true
        AND start_date <= CURRENT_DATE
        AND end_date >= CURRENT_DATE
      ORDER BY created_at DESC
      LIMIT 1
    )
  ) INTO result
  FROM weekly_exercise_plans
  WHERE user_id = target_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 12. GRANT NECESSARY PERMISSIONS
-- ================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- ================================================================
-- FINAL STATUS
-- ================================================================
SELECT 'Exercise system setup complete!' as status;
SELECT 'Tables created, RLS enabled, policies set, sample data inserted' as summary;
SELECT 'Run diagnose-exercise-system.sql again to verify everything is working' as next_step;
