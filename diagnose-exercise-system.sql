-- ================================================================
-- Exercise System Diagnostic Script
-- Run this in Supabase SQL Editor to check all exercise functionality
-- ================================================================

-- ================================================================
-- 1. CHECK EXERCISE-RELATED TABLES EXIST
-- ================================================================
SELECT 'Checking exercise tables existence...' as status;

SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('exercise_entries', 'weekly_exercise_plans', 'exercise_database', 'fitness_goals')
ORDER BY table_name;

-- ================================================================
-- 2. CHECK EXERCISE_ENTRIES TABLE STRUCTURE
-- ================================================================
SELECT 'Checking exercise_entries table structure...' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'exercise_entries' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ================================================================
-- 3. CHECK WEEKLY_EXERCISE_PLANS TABLE STRUCTURE
-- ================================================================
SELECT 'Checking weekly_exercise_plans table structure...' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'weekly_exercise_plans' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ================================================================
-- 4. CHECK RLS POLICIES FOR EXERCISE TABLES
-- ================================================================
SELECT 'Checking RLS policies for exercise tables...' as status;

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('exercise_entries', 'weekly_exercise_plans', 'exercise_database');

-- ================================================================
-- 5. CHECK EXISTING EXERCISE ENTRIES
-- ================================================================
SELECT 'Checking existing exercise entries...' as status;

SELECT 
  COUNT(*) as total_entries,
  COUNT(DISTINCT user_id) as unique_users,
  MIN(logged_date) as earliest_date,
  MAX(logged_date) as latest_date
FROM exercise_entries;

-- Sample recent entries
SELECT 
  exercise_name,
  exercise_type,
  duration_minutes,
  calories_burned,
  logged_date,
  logged_time
FROM exercise_entries 
ORDER BY created_at DESC 
LIMIT 5;

-- ================================================================
-- 6. CHECK EXISTING WEEKLY PLANS
-- ================================================================
SELECT 'Checking existing weekly plans...' as status;

SELECT 
  COUNT(*) as total_plans,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE is_active = true) as active_plans,
  COUNT(*) FILTER (WHERE completed = true) as completed_plans
FROM weekly_exercise_plans;

-- Sample recent plans
SELECT 
  plan_name,
  start_date,
  end_date,
  is_active,
  completed,
  total_duration_minutes,
  estimated_calories
FROM weekly_exercise_plans 
ORDER BY created_at DESC 
LIMIT 3;

-- ================================================================
-- 7. CHECK FITNESS GOALS
-- ================================================================
SELECT 'Checking fitness goals...' as status;

SELECT 
  COUNT(*) as total_goals,
  COUNT(DISTINCT user_id) as unique_users
FROM fitness_goals;

-- ================================================================
-- 8. CHECK EXERCISE DATABASE
-- ================================================================
SELECT 'Checking exercise database...' as status;

SELECT 
  COUNT(*) as total_exercises,
  COUNT(DISTINCT category) as unique_categories,
  COUNT(*) FILTER (WHERE verified = true) as verified_exercises
FROM exercise_database;

-- Sample exercises by category
SELECT 
  category,
  COUNT(*) as exercise_count
FROM exercise_database 
GROUP BY category 
ORDER BY exercise_count DESC;

-- ================================================================
-- 9. CHECK USER'S SPECIFIC DATA (if logged in)
-- ================================================================
SELECT 'Checking current user data...' as status;

-- Exercise entries for current user
SELECT 
  'exercise_entries' as table_name,
  COUNT(*) as count
FROM exercise_entries 
WHERE user_id = auth.uid()

UNION ALL

-- Weekly plans for current user
SELECT 
  'weekly_exercise_plans' as table_name,
  COUNT(*) as count
FROM weekly_exercise_plans 
WHERE user_id = auth.uid()

UNION ALL

-- Fitness goals for current user
SELECT 
  'fitness_goals' as table_name,
  COUNT(*) as count
FROM fitness_goals 
WHERE user_id = auth.uid();

-- ================================================================
-- 10. CHECK EDGE FUNCTIONS
-- ================================================================
SELECT 'Edge functions status (check manually):' as status;
-- ai-weekly-exercise-planner
-- cycle-manager

-- ================================================================
-- 11. FINAL SUMMARY
-- ================================================================
SELECT '========================================' as final_summary;
SELECT 'Exercise System Diagnostic Complete' as status;
SELECT 'Check all sections above for issues' as next_step;
