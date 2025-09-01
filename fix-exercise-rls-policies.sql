-- ================================================================
-- Fix Exercise Table RLS Policies
-- Since table exists, just fix the policies
-- ================================================================

-- ================================================================
-- 1. FIX RLS POLICIES FOR EXERCISE_ENTRIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can insert their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can update their own exercise entries" ON exercise_entries;
DROP POLICY IF EXISTS "Users can delete their own exercise entries" ON exercise_entries;

-- Re-enable RLS
ALTER TABLE exercise_entries ENABLE ROW LEVEL SECURITY;

-- Create correct policies for exercise_entries
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
-- 2. FIX WEEKLY EXERCISE PLANS POLICIES (if table exists)
-- ================================================================

-- Check if weekly_exercise_plans table exists, if not create it
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

-- Drop and recreate policies
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
-- 3. ADD HELPFUL DEBUGGING FUNCTION
-- ================================================================

-- Function to check what exercise entries a user should see
CREATE OR REPLACE FUNCTION debug_user_exercise_entries(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  entry_id UUID,
  exercise_name TEXT,
  exercise_type TEXT,
  logged_date DATE,
  user_matches BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as entry_id,
    e.exercise_name,
    e.exercise_type,
    e.logged_date,
    (e.user_id = target_user_id) as user_matches
  FROM exercise_entries e
  WHERE e.user_id = target_user_id
  ORDER BY e.logged_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- 4. TEST QUERY - Check current user's exercise entries
-- ================================================================

-- This will show if the current authenticated user has exercise entries
SELECT 
  'Current user exercise entries:' as info,
  COUNT(*) as total_entries,
  COUNT(CASE WHEN logged_date = CURRENT_DATE THEN 1 END) as today_entries
FROM exercise_entries 
WHERE user_id = auth.uid();

-- Show recent entries for debugging
SELECT 
  exercise_name,
  exercise_type,
  logged_date,
  user_id
FROM exercise_entries 
WHERE user_id = auth.uid()
ORDER BY logged_date DESC, created_at DESC
LIMIT 10;

-- ================================================================
SELECT 'Exercise RLS policies fixed successfully!' as status;
