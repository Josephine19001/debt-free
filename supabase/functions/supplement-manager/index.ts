import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface UserSupplement {
  name: string;
  default_dosage: string;
  frequency: 'Daily' | '3x/week' | '2x/week' | 'Weekly';
  reminder_time?: string;
  importance: 'high' | 'medium' | 'low';
  days_of_week: string[];
  is_active: boolean;
}

interface SupplementLog {
  date: string;
  supplement_name: string;
  dosage?: string;
  taken: boolean;
  time_logged?: string;
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

// Check if supplement is scheduled for a specific date
function isSupplementScheduledForDate(supplement: any, date: string): boolean {
  if (supplement.frequency === 'Daily') return true;

  const targetDate = new Date(date);
  const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

  return supplement.days_of_week.includes(dayName) || supplement.days_of_week.includes('Daily');
}

// Get cycle-specific supplement recommendations
function getCycleSupplementRecommendations(cyclePhase: string): any[] {
  const recommendations = {
    menstrual: [
      {
        name: 'Iron',
        reason: 'Replenish iron lost during menstruation',
        priority: 'high',
        dosage: '18mg',
      },
      {
        name: 'Magnesium',
        reason: 'Helps reduce cramps and muscle tension',
        priority: 'high',
        dosage: '200-400mg',
      },
      {
        name: 'Vitamin B6',
        reason: 'Supports mood and reduces PMS symptoms',
        priority: 'medium',
        dosage: '50-100mg',
      },
    ],
    follicular: [
      {
        name: 'Folate',
        reason: 'Important for cell division and DNA synthesis',
        priority: 'high',
        dosage: '400mcg',
      },
      {
        name: 'Vitamin E',
        reason: 'Antioxidant support for increasing energy',
        priority: 'medium',
        dosage: '15mg',
      },
      {
        name: 'Omega-3',
        reason: 'Anti-inflammatory support for hormone balance',
        priority: 'medium',
        dosage: '1000mg',
      },
    ],
    ovulatory: [
      {
        name: 'Zinc',
        reason: 'Supports hormone production and immunity',
        priority: 'high',
        dosage: '8-11mg',
      },
      {
        name: 'Vitamin C',
        reason: 'Antioxidant support during peak hormone levels',
        priority: 'medium',
        dosage: '75-90mg',
      },
      {
        name: 'Coenzyme Q10',
        reason: 'Energy production support',
        priority: 'low',
        dosage: '100mg',
      },
    ],
    luteal: [
      {
        name: 'Vitamin B6',
        reason: 'Helps prevent PMS symptoms',
        priority: 'high',
        dosage: '50-100mg',
      },
      {
        name: 'Magnesium',
        reason: 'Reduces anxiety and supports sleep',
        priority: 'high',
        dosage: '200-400mg',
      },
      {
        name: 'Evening Primrose Oil',
        reason: 'Supports hormone balance and reduces bloating',
        priority: 'medium',
        dosage: '500mg',
      },
    ],
  };

  return recommendations[cyclePhase as keyof typeof recommendations] || [];
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
        if (path === 'supplements') {
          // Get user's supplement list
          const { data: supplements, error } = await supabase
            .from('user_supplements')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('importance', { ascending: false });

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(supplements || []);
        }

        if (path === 'logs') {
          // Get supplement logs for a date range
          const startDate =
            url.searchParams.get('start_date') || new Date().toISOString().split('T')[0];
          const endDate = url.searchParams.get('end_date') || startDate;

          const { data: logs, error } = await supabase
            .from('supplement_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: false });

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(logs || []);
        }

        if (path === 'today') {
          // Get today's supplement schedule and logs
          // ALWAYS use the date provided by client to respect user's timezone
          const todayString = url.searchParams.get('date');

          if (!todayString) {
            return errorResponse('date parameter is required', 400);
          }

          console.log(
            `[supplement-manager] Fetching supplements for date: ${todayString} (client timezone)`
          );

          // Get user's supplements
          const { data: supplements } = await supabase
            .from('user_supplements')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true);

          // Get today's logs
          const { data: logs } = await supabase
            .from('supplement_logs')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', todayString);

          console.log(`[supplement-manager] Found ${logs?.length || 0} logs for ${todayString}`);
          console.log(`[supplement-manager] Logs:`, logs);
          console.log(
            `[supplement-manager] User supplements:`,
            supplements?.map((s) => s.name)
          );

          // Filter supplements scheduled for today
          const todaysSupplements = (supplements || []).filter((supplement) =>
            isSupplementScheduledForDate(supplement, todayString)
          );

          // Combine with logs
          const supplementsWithLogs = todaysSupplements.map((supplement) => {
            const log = (logs || []).find((l) => l.supplement_name === supplement.name);

            console.log(`[supplement-manager] Processing supplement: ${supplement.name}`);
            console.log(`[supplement-manager] Found log:`, log);
            console.log(`[supplement-manager] Log taken status: ${log?.taken || false}`);

            return {
              ...supplement,
              taken: log?.taken || false,
              actual_dosage: log?.dosage || supplement.default_dosage,
              time_logged: log?.time_logged,
            };
          });

          return jsonResponse(supplementsWithLogs);
        }

        if (path === 'recommendations') {
          // Get cycle-specific supplement recommendations
          const cyclePhase = url.searchParams.get('cycle_phase');

          if (!cyclePhase) {
            return errorResponse('cycle_phase parameter required');
          }

          const recommendations = getCycleSupplementRecommendations(cyclePhase);
          return jsonResponse(recommendations);
        }

        if (path === 'analytics') {
          // Get supplement adherence analytics
          const days = parseInt(url.searchParams.get('days') || '30');
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - days);

          const { data: logs } = await supabase
            .from('supplement_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0]);

          const { data: supplements } = await supabase
            .from('user_supplements')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true);

          // Calculate adherence rates
          const adherenceData = (supplements || []).map((supplement) => {
            const supplementLogs = (logs || []).filter(
              (log) => log.supplement_name === supplement.name
            );
            const takenCount = supplementLogs.filter((log) => log.taken).length;
            const totalScheduled = supplementLogs.length;
            const adherenceRate = totalScheduled > 0 ? (takenCount / totalScheduled) * 100 : 0;

            return {
              name: supplement.name,
              adherence_rate: Math.round(adherenceRate),
              taken_count: takenCount,
              total_scheduled: totalScheduled,
              importance: supplement.importance,
            };
          });

          return jsonResponse({
            period_days: days,
            supplements: adherenceData,
            overall_adherence:
              adherenceData.length > 0
                ? Math.round(
                    adherenceData.reduce((sum, item) => sum + item.adherence_rate, 0) /
                      adherenceData.length
                  )
                : 0,
          });
        }

        break;

      case 'POST':
        if (path === 'supplement') {
          // Add or update user supplement
          const body: UserSupplement = await req.json();

          const { data, error } = await supabase
            .from('user_supplements')
            .upsert({
              user_id: user.id,
              name: body.name,
              default_dosage: body.default_dosage,
              frequency: body.frequency,
              reminder_time: body.reminder_time,
              importance: body.importance,
              days_of_week: body.days_of_week,
              is_active: body.is_active,
            })
            .select()
            .single();

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(data);
        }

        if (path === 'log') {
          // Log supplement intake
          const body: SupplementLog = await req.json();

          const { data, error } = await supabase
            .from('supplement_logs')
            .upsert({
              user_id: user.id,
              date: body.date,
              supplement_name: body.supplement_name,
              dosage: body.dosage,
              taken: body.taken,
              time_logged: body.time_logged || new Date().toTimeString().slice(0, 8),
            })
            .select()
            .single();

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(data);
        }

        if (path === 'bulk-log') {
          // Log multiple supplements at once
          const {
            date,
            supplements,
          }: {
            date: string;
            supplements: Array<{ name: string; taken: boolean; dosage?: string }>;
          } = await req.json();

          const logsToInsert = supplements.map((supplement) => ({
            user_id: user.id,
            date,
            supplement_name: supplement.name,
            dosage: supplement.dosage,
            taken: supplement.taken,
            time_logged: new Date().toTimeString().slice(0, 8),
          }));

          const { data, error } = await supabase
            .from('supplement_logs')
            .upsert(logsToInsert)
            .select();

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(data);
        }

        break;

      case 'PUT':
        if (path === 'supplement') {
          // Update supplement
          const { id, ...updates } = await req.json();

          const { data, error } = await supabase
            .from('user_supplements')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(data);
        }

        break;

      case 'DELETE':
        if (path === 'supplement') {
          // Delete supplement (set inactive)
          const { id } = await req.json();

          const { data, error } = await supabase
            .from('user_supplements')
            .update({ is_active: false })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

          if (error) {
            return errorResponse(error.message);
          }

          return jsonResponse(data);
        }

        break;

      default:
        return errorResponse('Method not allowed', 405);
    }

    return errorResponse('Invalid endpoint', 404);
  } catch (error) {
    console.error('Supplement manager error:', error);
    return errorResponse('Internal server error', 500);
  }
});
