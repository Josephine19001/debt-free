-- ================================================================
-- Edge Function Updates for Database Cleanup Consistency
-- Run this AFTER the cleanup-and-fix-database.sql script
-- ================================================================

-- This file contains the updated edge function code that should be deployed
-- Copy the code sections below to update your edge functions

-- ================================================================
-- 1. AI WEEKLY EXERCISE PLANNER UPDATES
-- File: supabase/functions/ai-weekly-exercise-planner/index.ts
-- ================================================================

/*
REPLACE the cycle data fetching section (around lines 296-360) with this improved version:

    // If no cycle phase provided via request, try to fetch it from database
    let cyclePhaseData = current_cycle_phase;
    
    if (!cyclePhaseData) {
      console.log('🔍 No cycle data provided, attempting to fetch from database...');
      try {
        // First try using the helper function we created
        const { data: cycleFunction, error: functionError } = await supabase.rpc('get_user_cycle_phase', {
          target_user_id: user_id
        });

        if (cycleFunction && !functionError) {
          cyclePhaseData = cycleFunction;
          console.log(`✅ Got cycle phase from function: ${cycleFunction.phase}, day ${cycleFunction.day_in_cycle}`);
        } else {
          console.log('🔄 Function approach failed, trying manual calculation...');
          
          // Fallback: manual calculation with robust period detection
          const { data: cycleSettings, error: settingsError } = await supabase
            .from('cycle_settings')
            .select('*')
            .eq('user_id', user_id)
            .single();

          console.log('📊 Cycle settings query result:', { cycleSettings, settingsError });

          if (cycleSettings && !settingsError) {
            const { data: periodLogs, error: logsError } = await supabase
              .from('period_logs')
              .select('*')
              .eq('user_id', user_id)
              .order('date', { ascending: false })
              .limit(100);

            console.log('📋 Period logs query result:', { 
              logCount: periodLogs?.length || 0,
              logsError,
              sampleLogs: periodLogs?.slice(0, 3) 
            });

            // Calculate current cycle phase if we have period data
            if (periodLogs && periodLogs.length > 0 && !logsError) {
              // Use ALL the period indicators we added in cleanup
              const lastPeriodStart = periodLogs
                .filter((log: any) => 
                  log.is_start_day === true || 
                  log.period_start === true ||
                  log.flow ||
                  log.period_flow ||
                  log.is_period === true ||
                  log.period === true ||
                  log.menstruation === true
                )
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

              console.log('🩸 Found period start:', lastPeriodStart);

              if (lastPeriodStart) {
                const daysSinceLastPeriod = Math.floor(
                  (new Date().getTime() - new Date(lastPeriodStart.date).getTime()) / (1000 * 60 * 60 * 24)
                );
                const cycleLength = cycleSettings.cycle_length || cycleSettings.average_cycle_length || 28;
                const periodLength = cycleSettings.period_length || 5;
                const dayInCycle = (daysSinceLastPeriod % cycleLength) + 1;

                // Determine phase - consistent with cycle manager
                let phase = 'follicular';
                if (dayInCycle <= periodLength) phase = 'menstrual';
                else if (dayInCycle <= 13) phase = 'follicular';
                else if (dayInCycle <= 16) phase = 'ovulatory';
                else phase = 'luteal';

                cyclePhaseData = { phase, day_in_cycle: dayInCycle };
                console.log(`✅ Calculated cycle phase manually: ${phase}, day ${dayInCycle} (${daysSinceLastPeriod} days since period)`);
              } else {
                console.log('❌ No period start found in logs');
              }
            } else {
              console.log('❌ No period logs found or error occurred');
            }
          } else {
            console.log('❌ No cycle settings found or error occurred');
          }
        }
      } catch (dbError) {
        console.error('⚠️ Could not fetch cycle data from database:', dbError);
      }
    }

*/

-- ================================================================
-- 2. CYCLE MANAGER UPDATES
-- File: supabase/functions/cycle-manager/index.ts
-- ================================================================

/*
UPDATE the CycleSettings interface to include average_cycle_length:

interface CycleSettings {
  cycle_length: number;
  period_length: number;
  last_period_date: string | null;
  average_cycle_length?: number;  // Add this line
}

UPDATE the cycle settings upsert to handle average_cycle_length:

        if (path === 'settings') {
          // Create or update cycle settings
          const body: CycleSettings = await req.json();

          const upsertData: any = {
            user_id: user.id,
            cycle_length: body.cycle_length,
            period_length: body.period_length,
            last_period_date: body.last_period_date,
          };

          // Include average_cycle_length if provided
          if (body.average_cycle_length !== undefined) {
            upsertData.average_cycle_length = body.average_cycle_length;
          }

          const { data, error } = await supabase
            .from('cycle_settings')
            .upsert(upsertData)
            .select()
            .single();

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(data);
        }

UPDATE the period log creation to set all the new period flags:

        if (path === 'log') {
          // Create or update period log
          const body: PeriodLog = await req.json();

          // First, check if a log already exists for this date
          const { data: existingLog } = await supabase
            .from('period_logs')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', body.date)
            .single();

          if (existingLog) {
            // Update existing log, preserving fields that aren't being updated
            const updateData: any = {
              updated_at: new Date().toISOString(),
            };

            // Only update fields that are provided
            if (body.is_start_day !== undefined) {
              updateData.is_start_day = body.is_start_day;
              updateData.period_start = body.is_start_day; // Keep consistent
            }
            if (body.flow_intensity !== undefined) {
              updateData.flow_intensity = body.flow_intensity;
              updateData.flow = body.flow_intensity; // Keep consistent
            }
            if (body.mood !== undefined) updateData.mood = body.mood;
            if (body.symptoms !== undefined) updateData.symptoms = body.symptoms;
            if (body.notes !== undefined) updateData.notes = body.notes;

            // Set period flags if this is period-related
            if (body.is_start_day || body.flow_intensity) {
              updateData.is_period = true;
              updateData.period = true;
              updateData.menstruation = true;
            }

            const { data, error } = await supabase
              .from('period_logs')
              .update(updateData)
              .eq('user_id', user.id)
              .eq('date', body.date)
              .select()
              .single();

            if (error) {
              return errorResponse(error.message);
            }

            return jsonResponse(data);
          } else {
            // Create new log
            const insertData: any = {
              user_id: user.id,
              date: body.date,
              is_start_day: body.is_start_day || false,
              flow_intensity: body.flow_intensity,
              mood: body.mood,
              symptoms: body.symptoms || [],
              notes: body.notes,
            };

            // Set consistent period indicators
            if (body.is_start_day) {
              insertData.period_start = true;
            }
            if (body.flow_intensity) {
              insertData.flow = body.flow_intensity;
            }
            
            // Set period flags if this is period-related
            if (body.is_start_day || body.flow_intensity) {
              insertData.is_period = true;
              insertData.period = true;
              insertData.menstruation = true;
            }

            const { data, error } = await supabase
              .from('period_logs')
              .insert(insertData)
              .select()
              .single();

            if (error) {
              return errorResponse(error.message);
            }

            return jsonResponse(data);
          }
        }

UPDATE the calculateCyclePhase function to use robust period detection:

function calculateCyclePhase(settings: CycleSettings, periodLogs: any[]): CurrentCyclePhase | null {
  // Try to find the most recent period start from logs first
  const sortedLogs = periodLogs
    .filter((log: any) => 
      log.is_start_day === true || 
      log.period_start === true ||
      log.flow ||
      log.period_flow ||
      log.flow_intensity ||
      log.is_period === true ||
      log.period === true ||
      log.menstruation === true
    )
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let lastPeriodDate: Date;
  
  if (sortedLogs.length > 0) {
    // Use the most recent period from logs
    lastPeriodDate = new Date(sortedLogs[0].date);
  } else if (settings.last_period_date) {
    // Fallback to settings
    lastPeriodDate = new Date(settings.last_period_date);
  } else {
    return null;
  }

  const today = new Date();
  const daysSinceLastPeriod = Math.floor(
    (today.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Use average_cycle_length if available, otherwise cycle_length
  const cycleLength = settings.average_cycle_length || settings.cycle_length || 28;
  
  // Calculate current day in cycle (1-based)
  const dayInCycle = (daysSinceLastPeriod % cycleLength) + 1;

  // Rest of the function remains the same...
  // (phase determination logic stays as is)
}

*/

-- ================================================================
-- 3. UPDATE TYPESCRIPT INTERFACES
-- ================================================================

/*
Update the TypeScript interfaces in your edge functions to match the database:

// In cycle-manager/index.ts
interface CycleSettings {
  cycle_length: number;
  period_length: number;
  last_period_date: string | null;
  average_cycle_length?: number;
}

interface PeriodLog {
  date: string;
  is_start_day?: boolean;
  flow_intensity?: 'light' | 'moderate' | 'heavy';
  mood?: 'happy' | 'normal' | 'sad' | 'irritable' | 'anxious';
  symptoms?: string[];
  notes?: string;
  // New fields for consistency
  period_start?: boolean;
  flow?: string;
  period_flow?: string;
  is_period?: boolean;
  period?: boolean;
  menstruation?: boolean;
}

*/

-- ================================================================
-- COMPLETION NOTE
-- ================================================================

SELECT 'Edge function updates documented!' as status,
       'Apply the code changes above to your edge functions' as instructions,
       'This ensures consistency with the database cleanup' as purpose;
