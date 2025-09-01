-- ================================================================
-- Database Cleanup and Standardization Script
-- This will fix all inconsistencies and ensure proper structure
-- ================================================================

-- ================================================================
-- 1. STANDARDIZE CYCLE_SETTINGS TABLE
-- ================================================================

-- Add missing columns if they don't exist
ALTER TABLE cycle_settings 
ADD COLUMN IF NOT EXISTS average_cycle_length INTEGER;

-- Update constraints to be consistent
ALTER TABLE cycle_settings 
DROP CONSTRAINT IF EXISTS cycle_settings_cycle_length_check;

ALTER TABLE cycle_settings 
ADD CONSTRAINT cycle_settings_cycle_length_check 
CHECK (cycle_length >= 21 AND cycle_length <= 35);

ALTER TABLE cycle_settings 
DROP CONSTRAINT IF EXISTS cycle_settings_period_length_check;

ALTER TABLE cycle_settings 
ADD CONSTRAINT cycle_settings_period_length_check 
CHECK (period_length >= 2 AND period_length <= 8);

-- Ensure proper defaults
ALTER TABLE cycle_settings 
ALTER COLUMN cycle_length SET DEFAULT 28;

ALTER TABLE cycle_settings 
ALTER COLUMN period_length SET DEFAULT 5;

-- ================================================================
-- 2. STANDARDIZE PERIOD_LOGS TABLE
-- ================================================================

-- Add all the missing columns that the code expects
ALTER TABLE period_logs 
ADD COLUMN IF NOT EXISTS period_start BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flow TEXT,
ADD COLUMN IF NOT EXISTS period_flow TEXT,
ADD COLUMN IF NOT EXISTS is_period BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS period BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS menstruation BOOLEAN DEFAULT false;

-- Update existing data to be consistent
-- Map is_start_day to period_start for consistency
UPDATE period_logs 
SET period_start = is_start_day 
WHERE period_start IS NULL AND is_start_day IS NOT NULL;

-- Map flow_intensity to flow for consistency
UPDATE period_logs 
SET flow = flow_intensity 
WHERE flow IS NULL AND flow_intensity IS NOT NULL;

-- Set period flags based on existing data
UPDATE period_logs 
SET is_period = true, period = true, menstruation = true
WHERE is_start_day = true OR period_start = true OR flow_intensity IS NOT NULL OR flow IS NOT NULL;

-- ================================================================
-- 3. FIX EXERCISE_ENTRIES TABLE RLS
-- ================================================================

-- Drop and recreate RLS policies for exercise_entries
DROP POLICY IF EXISTS "Users can view their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can insert their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can update their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can delete their own exercise entries" ON exercise_entries;

-- Re-enable RLS
ALTER TABLE exercise_entries ENABLE ROW LEVEL SECURITY;

-- Create correct policies
CREATE POLICY "Users can view their own exercise entries"
ON exercise_entries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise entries"
ON exercise_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise entries"
ON exercise_entries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise entries"
ON exercise_entries FOR DELETE
USING (auth.uid() = user_id);

-- ================================================================
-- 4. CREATE WEEKLY_EXERCISE_PLANS TABLE (if missing)
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

-- Enable RLS and create policies for weekly_exercise_plans
ALTER TABLE weekly_exercise_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own weekly plans" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "Users can insert their own weekly plans" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "Users can update their own weekly plans" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "Users can delete their own weekly plans" ON weekly_exercise_plans;

CREATE POLICY "Users can view their own weekly plans"
ON weekly_exercise_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly plans"
ON weekly_exercise_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly plans"
ON weekly_exercise_plans FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly plans"
ON weekly_exercise_plans FOR DELETE
USING (auth.uid() = user_id);

-- ================================================================
-- 5. FIX CYCLE TABLE RLS POLICIES
-- ================================================================

-- Ensure cycle_settings has proper RLS
ALTER TABLE cycle_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cycle settings" ON cycle_settings;
DROP POLICY IF EXISTS "Users can insert their own cycle settings" ON cycle_settings;
DROP POLICY IF EXISTS "Users can update their own cycle settings" ON cycle_settings;

CREATE POLICY "Users can view their own cycle settings"
ON cycle_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cycle settings"
ON cycle_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycle settings"
ON cycle_settings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Ensure period_logs has proper RLS
ALTER TABLE period_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own period logs" ON period_logs;
DROP POLICY IF EXISTS "Users can insert their own period logs" ON period_logs;
DROP POLICY IF EXISTS "Users can update their own period logs" ON period_logs;
DROP POLICY IF EXISTS "Users can delete their own period logs" ON period_logs;

CREATE POLICY "Users can view their own period logs"
ON period_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own period logs"
ON period_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own period logs"
ON period_logs FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own period logs"
ON period_logs FOR DELETE
USING (auth.uid() = user_id);

-- ================================================================
-- 6. CREATE HELPFUL FUNCTIONS FOR CYCLE DATA
-- ================================================================

-- Function to get user's current cycle phase
CREATE OR REPLACE FUNCTION get_user_cycle_phase(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  cycle_data JSON;
  settings_data RECORD;
  period_data RECORD;
  days_since_period INTEGER;
  cycle_day INTEGER;
  phase TEXT;
BEGIN
  -- Get user's cycle settings
  SELECT * INTO settings_data
  FROM cycle_settings
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Get most recent period start (check all possible period indicators)
  SELECT * INTO period_data
  FROM period_logs
  WHERE user_id = target_user_id
    AND (
      is_start_day = true OR 
      period_start = true OR
      flow IS NOT NULL OR
      period_flow IS NOT NULL OR
      is_period = true OR
      period = true OR
      menstruation = true
    )
  ORDER BY date DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Calculate days since last period
  days_since_period := EXTRACT(DAYS FROM (CURRENT_DATE - period_data.date));
  cycle_day := (days_since_period % COALESCE(settings_data.cycle_length, 28)) + 1;
  
  -- Determine phase
  IF cycle_day <= COALESCE(settings_data.period_length, 5) THEN
    phase := 'menstrual';
  ELSIF cycle_day <= 13 THEN
    phase := 'follicular';
  ELSIF cycle_day <= 16 THEN
    phase := 'ovulatory';
  ELSE
    phase := 'luteal';
  END IF;
  
  cycle_data := json_build_object(
    'phase', phase,
    'day_in_cycle', cycle_day,
    'days_since_period', days_since_period,
    'last_period_date', period_data.date
  );
  
  RETURN cycle_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 7. CREATE DEBUGGING FUNCTIONS
-- ================================================================

-- Function to debug cycle data
CREATE OR REPLACE FUNCTION debug_cycle_data(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  table_name TEXT,
  record_count BIGINT,
  latest_date DATE,
  sample_data JSON
) AS $$
BEGIN
  -- Cycle settings
  RETURN QUERY
  SELECT 
    'cycle_settings'::TEXT as table_name,
    COUNT(*)::BIGINT as record_count,
    NULL::DATE as latest_date,
    row_to_json(cs.*) as sample_data
  FROM cycle_settings cs
  WHERE cs.user_id = target_user_id
  GROUP BY cs.id, cs.user_id, cs.cycle_length, cs.period_length, cs.last_period_date, cs.average_cycle_length, cs.created_at, cs.updated_at;
  
  -- Period logs
  RETURN QUERY
  SELECT 
    'period_logs'::TEXT as table_name,
    COUNT(*)::BIGINT as record_count,
    MAX(pl.date) as latest_date,
    json_agg(row_to_json(pl.*) ORDER BY pl.date DESC)::JSON as sample_data
  FROM period_logs pl
  WHERE pl.user_id = target_user_id
  GROUP BY ();
  
  -- Exercise entries
  RETURN QUERY
  SELECT 
    'exercise_entries'::TEXT as table_name,
    COUNT(*)::BIGINT as record_count,
    MAX(ee.logged_date) as latest_date,
    json_agg(row_to_json(ee.*) ORDER BY ee.logged_date DESC LIMIT 5)::JSON as sample_data
  FROM exercise_entries ee
  WHERE ee.user_id = target_user_id
  GROUP BY ();
  
  -- Weekly exercise plans
  RETURN QUERY
  SELECT 
    'weekly_exercise_plans'::TEXT as table_name,
    COUNT(*)::BIGINT as record_count,
    MAX(wep.start_date) as latest_date,
    json_agg(json_build_object('id', wep.id, 'plan_name', wep.plan_name, 'is_active', wep.is_active) ORDER BY wep.created_at DESC)::JSON as sample_data
  FROM weekly_exercise_plans wep
  WHERE wep.user_id = target_user_id
  GROUP BY ();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- ================================================================

-- Exercise entries indexes
CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_date ON exercise_entries(user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_type ON exercise_entries(exercise_type);

-- Weekly plans indexes
CREATE INDEX IF NOT EXISTS idx_weekly_exercise_plans_user_active ON weekly_exercise_plans(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_exercise_plans_dates ON weekly_exercise_plans(start_date, end_date);

-- Period logs indexes (additional)
CREATE INDEX IF NOT EXISTS idx_period_logs_user_date ON period_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_period_logs_period_indicators ON period_logs(user_id) WHERE (is_start_day = true OR period_start = true OR flow IS NOT NULL OR is_period = true);

-- Cycle settings indexes
CREATE INDEX IF NOT EXISTS idx_cycle_settings_user ON cycle_settings(user_id);

-- ================================================================
-- 9. TEST THE SETUP
-- ================================================================

-- Test cycle data function
SELECT 'Testing cycle data function...' as status;
SELECT get_user_cycle_phase(auth.uid()) as current_cycle_phase;

-- Test debugging function
SELECT 'Testing debug function...' as status;
SELECT * FROM debug_cycle_data(auth.uid());

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================
SELECT 'Database cleanup and standardization completed successfully!' as status,
       'All tables, policies, and functions have been updated' as details;
