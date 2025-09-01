import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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
  // Additional fields for consistency with database cleanup
  period_start?: boolean;
  flow?: string;
  period_flow?: string;
  is_period?: boolean;
  period?: boolean;
  menstruation?: boolean;
}

interface SymptomEntry {
  date: string;
  symptoms: string[];
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

interface MoodEntry {
  date: string;
  mood: 'happy' | 'normal' | 'sad' | 'irritable' | 'anxious';
  energy_level?: 'high' | 'medium' | 'low';
  notes?: string;
}

interface CurrentCyclePhase {
  phase: 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
  name: string;
  day_in_cycle: number;
  days_remaining: number;
  energy_level: 'low' | 'building' | 'high' | 'declining';
  description: string;
  recommended_exercises: string[];
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Calculate current cycle phase based on settings and logs
function calculateCyclePhase(settings: CycleSettings, periodLogs: any[]): CurrentCyclePhase | null {
  // Try to find the most recent period start from logs first
  const sortedLogs = periodLogs
    .filter(
      (log: any) =>
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

  // Determine phase based on day in cycle
  let phase: CurrentCyclePhase['phase'];
  let name: string;
  let energy_level: CurrentCyclePhase['energy_level'];
  let recommended_exercises: string[];
  let days_remaining: number;
  let description: string;

  if (dayInCycle <= 5) {
    phase = 'menstrual';
    name = 'Menstrual Phase';
    energy_level = 'low';
    days_remaining = 5 - dayInCycle + 1;
    description = 'Your period - time for gentle self-care';
    recommended_exercises = ['Gentle yoga', 'Light walking', 'Stretching', 'Meditation'];
  } else if (dayInCycle <= 13) {
    phase = 'follicular';
    name = 'Follicular Phase';
    energy_level = 'building';
    days_remaining = 13 - dayInCycle + 1;
    description = 'Energy is building - great time to try new things';
    recommended_exercises = [
      'Cardio',
      'Strength training',
      'High-intensity workouts',
      'New activities',
    ];
  } else if (dayInCycle <= 16) {
    phase = 'ovulatory';
    name = 'Ovulatory Phase';
    energy_level = 'high';
    days_remaining = 16 - dayInCycle + 1;
    description = 'Peak energy and confidence - you can handle anything';
    recommended_exercises = [
      'High-intensity training',
      'Group fitness',
      'Challenging workouts',
      'Outdoor activities',
    ];
  } else {
    phase = 'luteal';
    name = 'Luteal Phase';
    energy_level = 'declining';
    days_remaining = settings.cycle_length - dayInCycle + 1;
    description = 'Winding down - focus on comfort and preparation';
    recommended_exercises = ['Yoga', 'Pilates', 'Moderate cardio', 'Strength training'];
  }

  return {
    phase,
    name,
    day_in_cycle: dayInCycle,
    days_remaining: Math.max(0, days_remaining),
    energy_level,
    description,
    recommended_exercises,
  };
}

// Calculate period cycles with proper start-end matching
function calculatePeriodCycles(periodLogs: any[]) {
  const startDates = periodLogs
    .filter((log) => log.is_start_day)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const endDates = periodLogs
    .filter((log) => !log.is_start_day && log.notes?.includes('Period ended'))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const cycles = [];

  // Match each start date with the next chronological end date
  startDates.forEach((startLog) => {
    const start = new Date(startLog.date);

    // Find the first end date that comes after this start date
    const correspondingEndLog = endDates.find((endLog) => {
      const end = new Date(endLog.date);
      return end > start;
    });

    let duration = null;
    if (correspondingEndLog) {
      const endDate = new Date(correspondingEndLog.date);
      duration = Math.floor((endDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    cycles.push({
      start_date: startLog.date,
      end_date: correspondingEndLog?.date || null,
      duration,
      is_ongoing: !correspondingEndLog,
    });
  });

  return cycles;
}

// Get cycle statistics
function calculateCycleStats(periodLogs: any[], settings: CycleSettings) {
  const periodStarts = periodLogs
    .filter((log) => log.is_start_day)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (periodStarts.length < 2) {
    return {
      average_cycle: settings.cycle_length,
      last_period: periodStarts[0]?.date || null,
      next_predicted: null,
      cycle_regularity: 'Insufficient data',
      cycle_lengths: [],
      period_cycles: calculatePeriodCycles(periodLogs),
    };
  }

  // Calculate cycle lengths
  const cycleLengths = [];
  for (let i = 0; i < periodStarts.length - 1; i++) {
    const current = new Date(periodStarts[i].date);
    const previous = new Date(periodStarts[i + 1].date);
    const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    cycleLengths.push(diffDays);
  }

  const averageCycle = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);

  // Predict next period
  const lastPeriodDate = new Date(periodStarts[0].date);
  const nextPredicted = new Date(lastPeriodDate);
  nextPredicted.setDate(lastPeriodDate.getDate() + averageCycle);

  // Calculate regularity
  const variance =
    cycleLengths.reduce((acc, length) => acc + Math.pow(length - averageCycle, 2), 0) /
    cycleLengths.length;
  const standardDeviation = Math.sqrt(variance);

  let regularity = 'Regular';
  if (standardDeviation > 7) regularity = 'Irregular';
  else if (standardDeviation > 4) regularity = 'Somewhat irregular';

  return {
    average_cycle: averageCycle,
    last_period: periodStarts[0].date,
    next_predicted: nextPredicted.toISOString().split('T')[0],
    cycle_regularity: regularity,
    cycle_lengths: cycleLengths,
    period_cycles: calculatePeriodCycles(periodLogs),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const {
      data: { user },
    } = await supabase.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ', '') || '');

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    switch (req.method) {
      case 'GET':
        if (path === 'settings') {
          // Get cycle settings
          const { data: settings, error } = await supabase
            .from('cycle_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            return errorResponse(error.message);
          }

          return jsonResponse(settings || null);
        }

        if (path === 'current-phase') {
          // Get current cycle phase
          const { data: settings } = await supabase
            .from('cycle_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (!settings) {
            return jsonResponse(null);
          }

          const { data: periodLogs } = await supabase
            .from('period_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(100);

          const currentPhase = calculateCyclePhase(settings, periodLogs || []);
          return jsonResponse(currentPhase);
        }

        if (path === 'stats') {
          // Get cycle statistics
          const { data: settings } = await supabase
            .from('cycle_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          const { data: periodLogs } = await supabase
            .from('period_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (!settings || !periodLogs) {
            return jsonResponse(null);
          }

          const stats = calculateCycleStats(periodLogs, settings);
          return jsonResponse(stats);
        }

        if (path === 'logs') {
          // Get period logs
          const startDate = url.searchParams.get('start_date');
          const endDate = url.searchParams.get('end_date');

          let query = supabase
            .from('period_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (startDate) {
            query = query.gte('date', startDate);
          }
          if (endDate) {
            query = query.lte('date', endDate);
          }

          const { data: logs, error } = await query;

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(logs);
        }

        if (path === 'cycles') {
          // Get period cycles with start-end matching
          const { data: periodLogs } = await supabase
            .from('period_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (!periodLogs) {
            return jsonResponse([]);
          }

          const cycles = calculatePeriodCycles(periodLogs);
          return jsonResponse(cycles);
        }

        break;

      case 'POST':
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

        if (path === 'log-symptoms') {
          // Log symptoms
          const body: SymptomEntry = await req.json();

          // Format the notes to include severity
          const formattedNotes =
            body.severity && body.notes
              ? `Severity: ${body.severity} | ${body.notes}`
              : body.severity
                ? `Severity: ${body.severity}`
                : body.notes;

          // Check if a log already exists for this date
          const { data: existingLog } = await supabase
            .from('period_logs')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', body.date)
            .single();

          if (existingLog) {
            // Update existing log with symptoms
            const { data, error } = await supabase
              .from('period_logs')
              .update({
                symptoms: body.symptoms,
                notes: formattedNotes,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user.id)
              .eq('date', body.date)
              .select()
              .single();

            if (error) {
              return errorResponse(error.message);
            }

            return jsonResponse(data);
          } else {
            // Create new log with symptoms
            const { data, error } = await supabase
              .from('period_logs')
              .insert({
                user_id: user.id,
                date: body.date,
                symptoms: body.symptoms,
                notes: formattedNotes,
                is_start_day: false,
              })
              .select()
              .single();

            if (error) {
              return errorResponse(error.message);
            }

            return jsonResponse(data);
          }
        }

        if (path === 'log-mood') {
          // Log mood
          const body: MoodEntry = await req.json();

          // Format the notes to include energy level
          const formattedNotes =
            body.energy_level && body.notes
              ? `Energy: ${body.energy_level} | ${body.notes}`
              : body.energy_level
                ? `Energy: ${body.energy_level}`
                : body.notes;

          // Check if a log already exists for this date
          const { data: existingLog } = await supabase
            .from('period_logs')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', body.date)
            .single();

          if (existingLog) {
            // Update existing log with mood
            const { data, error } = await supabase
              .from('period_logs')
              .update({
                mood: body.mood,
                notes: formattedNotes,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', user.id)
              .eq('date', body.date)
              .select()
              .single();

            if (error) {
              return errorResponse(error.message);
            }

            return jsonResponse(data);
          } else {
            // Create new log with mood
            const { data, error } = await supabase
              .from('period_logs')
              .insert({
                user_id: user.id,
                date: body.date,
                mood: body.mood,
                notes: formattedNotes,
                is_start_day: false,
              })
              .select()
              .single();

            if (error) {
              return errorResponse(error.message);
            }

            return jsonResponse(data);
          }
        }

        break;

      case 'DELETE':
        if (path === 'log') {
          // Delete period log
          const { date } = await req.json();

          const { error } = await supabase
            .from('period_logs')
            .delete()
            .eq('user_id', user.id)
            .eq('date', date);

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse({ success: true });
        }

        break;

      default:
        return errorResponse('Method not allowed', 405);
    }

    return errorResponse('Invalid endpoint', 404);
  } catch (error) {
    console.error('Cycle manager error:', error);
    return errorResponse('Internal server error', 500);
  }
});
