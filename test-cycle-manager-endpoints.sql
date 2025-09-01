-- ================================================================
-- Test Cycle Manager Endpoints
-- Run these in Supabase SQL Editor to test the new endpoints
-- ================================================================

-- Test the debug function first
SELECT 'Testing debug function...' as test_step;
SELECT * FROM debug_cycle_data();

-- Test the cycle phase function
SELECT 'Testing cycle phase function...' as test_step;
SELECT get_user_cycle_phase(auth.uid()) as current_cycle_phase;

-- Check if period_logs table has the new columns
SELECT 'Checking period_logs table structure...' as test_step;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'period_logs' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing period logs data
SELECT 'Checking existing period logs...' as test_step;
SELECT 
  date,
  mood,
  symptoms,
  is_start_day,
  period_start,
  flow_intensity,
  flow,
  is_period,
  period,
  menstruation,
  notes
FROM period_logs 
WHERE user_id = auth.uid()
ORDER BY date DESC
LIMIT 5;

-- Check cycle settings
SELECT 'Checking cycle settings...' as test_step;
SELECT * FROM cycle_settings WHERE user_id = auth.uid();

-- Check exercise entries
SELECT 'Checking exercise entries...' as test_step;
SELECT 
  exercise_name,
  exercise_type,
  logged_date,
  duration_minutes
FROM exercise_entries 
WHERE user_id = auth.uid()
ORDER BY logged_date DESC
LIMIT 5;

-- Check weekly exercise plans
SELECT 'Checking weekly exercise plans...' as test_step;
SELECT 
  plan_name,
  start_date,
  end_date,
  is_active
FROM weekly_exercise_plans 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 3;

-- Final status
SELECT 'All tests completed!' as status;
