-- ================================================================
-- Fix Exercise Tables and Cycle Data Issues
-- Run this in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- 1. CREATE EXERCISE ENTRIES TABLE (if not exists)
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
-- 2. CREATE WEEKLY EXERCISE PLANS TABLE (if not exists)
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
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_id ON exercise_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_date ON exercise_entries(logged_date);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_user_date ON exercise_entries(user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_exercise_entries_type ON exercise_entries(exercise_type);

CREATE INDEX IF NOT EXISTS idx_weekly_exercise_plans_user_id ON weekly_exercise_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_exercise_plans_active ON weekly_exercise_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_exercise_plans_dates ON weekly_exercise_plans(start_date, end_date);

-- ================================================================
-- 4. ENABLE RLS (Row Level Security)
-- ================================================================
ALTER TABLE exercise_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_exercise_plans ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 5. CREATE RLS POLICIES FOR EXERCISE_ENTRIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can insert their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can update their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can delete their own exercise entries" ON exercise_entries;

-- Create policies for exercise_entries
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
-- 6. CREATE RLS POLICIES FOR WEEKLY_EXERCISE_PLANS
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own weekly plans" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "Users can insert their own weekly plans" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "Users can update their own weekly plans" ON weekly_exercise_plans;
DROP POLICY IF EXISTS "Users can delete their own weekly plans" ON weekly_exercise_plans;

-- Create policies for weekly_exercise_plans
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
-- 7. VERIFY CYCLE SETTINGS TABLE EXISTS WITH PROPER STRUCTURE
-- ================================================================
CREATE TABLE IF NOT EXISTS cycle_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_length INTEGER DEFAULT 28 CHECK (cycle_length >= 21 AND cycle_length <= 35),
  period_length INTEGER DEFAULT 5 CHECK (period_length >= 2 AND period_length <= 8),
  last_period_date DATE,
  average_cycle_length INTEGER DEFAULT 28,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS and create policies for cycle_settings if not exists
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

-- ================================================================
-- 8. VERIFY PERIOD LOGS TABLE HAS CORRECT STRUCTURE
-- ================================================================
-- Add missing columns if they don't exist
ALTER TABLE period_logs 
ADD COLUMN IF NOT EXISTS period_start BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flow TEXT,
ADD COLUMN IF NOT EXISTS period_flow TEXT,
ADD COLUMN IF NOT EXISTS is_period BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS period BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS menstruation BOOLEAN DEFAULT false;

-- ================================================================
-- 9. CREATE HELPFUL FUNCTIONS
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
  
  -- Get most recent period start
  SELECT * INTO period_data
  FROM period_logs
  WHERE user_id = target_user_id
    AND (is_start_day = true OR period_start = true)
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
-- COMPLETION MESSAGE
-- ================================================================
SELECT 'Exercise tables and cycle data setup completed successfully!' as status;
