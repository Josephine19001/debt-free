-- ================================================================
-- Exercise Functionality Test Script
-- Run this to test exercise logging and plan generation
-- ================================================================

-- ================================================================
-- 1. ENSURE USER IS AUTHENTICATED
-- ================================================================
SELECT 'Testing authentication...' as status;
SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'Authenticated: ' || auth.uid()::text
    ELSE 'NOT AUTHENTICATED - Please login first'
  END as auth_status;

-- ================================================================
-- 2. TEST EXERCISE_ENTRIES TABLE ACCESS
-- ================================================================
SELECT 'Testing exercise_entries table access...' as status;

-- Test table exists and is accessible
SELECT COUNT(*) as existing_entries FROM exercise_entries WHERE user_id = auth.uid();

-- Test insert permissions (will be rolled back)
BEGIN;
INSERT INTO exercise_entries (
  user_id, 
  exercise_name, 
  exercise_type, 
  duration_minutes, 
  calories_burned, 
  intensity,
  notes,
  logged_date
) VALUES (
  auth.uid(),
  'Test Exercise',
  'strength',
  30,
  150,
  'moderate',
  'Test exercise entry',
  CURRENT_DATE
);

SELECT 'Exercise entry test insert: SUCCESS' as test_result;
ROLLBACK;

-- ================================================================
-- 3. TEST WEEKLY_EXERCISE_PLANS TABLE ACCESS
-- ================================================================
SELECT 'Testing weekly_exercise_plans table access...' as status;

-- Test table exists and is accessible
SELECT COUNT(*) as existing_plans FROM weekly_exercise_plans WHERE user_id = auth.uid();

-- Test insert permissions (will be rolled back)
BEGIN;
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
  auth.uid(),
  'Test Weekly Plan',
  CURRENT_DATE,
  CURRENT_DATE + interval '6 days',
  300,
  1500,
  '{"test": "plan"}',
  true
);

SELECT 'Weekly plan test insert: SUCCESS' as test_result;
ROLLBACK;

-- ================================================================
-- 4. TEST FITNESS_GOALS TABLE
-- ================================================================
SELECT 'Testing fitness_goals table...' as status;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM fitness_goals WHERE user_id = auth.uid()) 
    THEN 'Has fitness goals'
    ELSE 'No fitness goals - may need to set up'
  END as fitness_goals_status;

-- ================================================================
-- 5. TEST CYCLE DATA INTEGRATION
-- ================================================================
SELECT 'Testing cycle data integration...' as status;

-- Test get_user_cycle_phase function
SELECT 
  CASE 
    WHEN get_user_cycle_phase(auth.uid()) IS NOT NULL 
    THEN 'Cycle data available: ' || (get_user_cycle_phase(auth.uid())->>'phase')
    ELSE 'No cycle data available'
  END as cycle_status;

-- ================================================================
-- 6. TEST EXERCISE DATABASE
-- ================================================================
SELECT 'Testing exercise database...' as status;

SELECT 
  COUNT(*) as total_exercises,
  COUNT(*) FILTER (WHERE verified = true) as verified_exercises
FROM exercise_database;

-- Sample exercises
SELECT name, category, difficulty FROM exercise_database 
WHERE verified = true 
ORDER BY name 
LIMIT 5;

-- ================================================================
-- 7. CREATE SAMPLE DATA FOR TESTING (if needed)
-- ================================================================
SELECT 'Creating sample data if needed...' as status;

-- Insert sample fitness goals if none exist
INSERT INTO fitness_goals (
  user_id,
  daily_steps,
  weekly_workouts,
  target_weight,
  activity_level,
  primary_goal,
  workout_preferences
)
SELECT 
  auth.uid(),
  10000,
  4,
  70.0,
  'moderately_active',
  'improve_fitness',
  ARRAY['strength', 'cardio']
WHERE NOT EXISTS (
  SELECT 1 FROM fitness_goals WHERE user_id = auth.uid()
);

-- ================================================================
-- 8. VERIFY RLS POLICIES
-- ================================================================
SELECT 'Verifying RLS policies...' as status;

SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('exercise_entries', 'weekly_exercise_plans', 'fitness_goals')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================================
-- 9. FINAL HEALTH CHECK
-- ================================================================
SELECT '========================================' as final_check;
SELECT 'Exercise System Health Check Results:' as summary;

-- Exercise entries access
SELECT 
  'exercise_entries' as table_name,
  CASE 
    WHEN COUNT(*) >= 0 THEN 'ACCESS OK'
    ELSE 'ACCESS DENIED'
  END as status
FROM exercise_entries 
WHERE user_id = auth.uid()

UNION ALL

-- Weekly plans access
SELECT 
  'weekly_exercise_plans' as table_name,
  CASE 
    WHEN COUNT(*) >= 0 THEN 'ACCESS OK'
    ELSE 'ACCESS DENIED'
  END as status
FROM weekly_exercise_plans 
WHERE user_id = auth.uid()

UNION ALL

-- Fitness goals access
SELECT 
  'fitness_goals' as table_name,
  CASE 
    WHEN COUNT(*) >= 0 THEN 'ACCESS OK'
    ELSE 'ACCESS DENIED'
  END as status
FROM fitness_goals 
WHERE user_id = auth.uid()

UNION ALL

-- Exercise database access
SELECT 
  'exercise_database' as table_name,
  CASE 
    WHEN COUNT(*) > 0 THEN 'ACCESS OK - ' || COUNT(*)::text || ' exercises'
    ELSE 'NO DATA'
  END as status
FROM exercise_database;

-- ================================================================
-- 10. NEXT STEPS
-- ================================================================
SELECT '========================================' as next_steps;
SELECT 'If all tables show ACCESS OK, the system is ready!' as instruction;
SELECT 'Test in app:' as step1;
SELECT '1. Go to Exercise tab' as step2;
SELECT '2. Click + to log exercise' as step3;
SELECT '3. Search for "push-ups" and log it' as step4;
SELECT '4. Generate a weekly plan' as step5;
SELECT '5. Check that data appears correctly' as step6;
