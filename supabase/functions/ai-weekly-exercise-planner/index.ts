import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'npm:openai';
import Groq from 'npm:groq-sdk';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
});

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY') ?? '',
});

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getNext7Days(startDate: Date): Date[] {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
}

function getCycleAwareIntensity(cyclePhase: string | null, dayInCycle: number | null): string {
  // If no cycle data available, return moderate intensity
  if (!cyclePhase || !dayInCycle) return 'moderate';

  switch (cyclePhase.toLowerCase()) {
    case 'menstrual':
      return 'low'; // Days 1-5: Low intensity, gentle movement
    case 'follicular':
      return 'moderate'; // Days 6-13: Building energy
    case 'ovulatory':
      return 'high'; // Days 14-16: Peak energy, high intensity
    case 'luteal':
      return dayInCycle > 21 ? 'low' : 'moderate'; // Days 17-28: Moderate to low
    default:
      return 'moderate';
  }
}

async function generateWeeklyPlanWithAI(planData: any, startDate: Date) {
  const week = getNext7Days(startDate);
  const restDays = [2, 5]; // Wednesday and Saturday indices

  // Extract data from the structured plan data
  const fitnessGoals = planData.fitness_goals;
  const cycleData = planData.cycle_data;
  const exerciseHistory = planData.exercise_history;
  const bodyMeasurements = planData.body_measurements;

  // Build cycle info
  const cycleInfo = cycleData
    ? `- Cycle: ${cycleData.phase} phase (day ${cycleData.day_in_cycle}, energy: ${cycleData.energy_level})`
    : '- Cycle: No cycle data available';

  // Build user profile info
  const userAge = bodyMeasurements?.age ? ` (age ${bodyMeasurements.age})` : '';
  const weightInfo = bodyMeasurements?.current_weight
    ? ` ${bodyMeasurements.current_weight}${bodyMeasurements.units || 'kg'}`
    : '';
  const heightInfo = bodyMeasurements?.height ? ` ${bodyMeasurements.height}cm` : '';
  const physicalProfile =
    userAge || weightInfo || heightInfo
      ? `- Physical: ${heightInfo}${weightInfo}${userAge}`
      : '- Physical: No data provided';

  const prompt = `Generate a simple 7-day exercise plan and return ONLY valid JSON.

User Profile:
- Goal: ${fitnessGoals?.primary_goal || 'general fitness'}
- Level: ${fitnessGoals?.experience_level || 'beginner'}
- Frequency: ${fitnessGoals?.workout_frequency || '3-4'} per week
- Duration preference: ${fitnessGoals?.preferred_duration || '30'} minutes
- Equipment: ${fitnessGoals?.equipment_access || 'basic'}
${physicalProfile}
${cycleInfo}
- Recent activity: ${exerciseHistory?.summary || 'No recent history'}

Return this structure:
{
  "plan_name": "Simple plan name",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "day_name": "Monday",
      "is_rest_day": boolean,
      "workout_type": "Cardio" or "Strength" or "",
      "duration_minutes": number,
      "exercises": [
        {
          "name": "Exercise name",
          "category": "cardio/strength/flexibility",
          "duration_minutes": number,
          "calories_estimate": number,
          "instructions": "Simple instruction",
          "completed": false
        }
      ]
    }
  ],
  "weekly_goals": {
    "total_workouts": number,
    "total_minutes": number,
    "estimated_calories": number
  }
}

RULES:
- Rest days Wednesday & Saturday (is_rest_day: true, exercises: [])
- Match user's preferred duration (${fitnessGoals?.preferred_duration || '30'} min sessions)
- Avoid repeating exercises from recent history: ${exerciseHistory?.dominant_types?.join(', ') || 'none'}
- 2-3 exercises per workout session
- Clear, actionable instructions
- Age-appropriate exercises: ${bodyMeasurements?.age ? `Suitable for age ${bodyMeasurements.age}` : 'General adult exercises'}
- Cycle-aware intensity: ${cycleData ? `Currently ${cycleData.phase} phase with ${cycleData.energy_level} energy` : 'Standard progression'}
- Include calorie estimates based on duration, intensity, and user's physical profile`;

  const userContent = `Generate a ${fitnessGoals?.primary_goal || 'fitness'} plan starting ${startDate.toDateString()}.`;

  // Try OpenAI first
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userContent },
      ],
    });

    const message = completion.choices[0]?.message?.content ?? '';
    const match = message.match(/\{[\s\S]*\}/);

    if (match) {
      const plan = JSON.parse(match[0]);

      // Ensure dates are properly formatted and add completion status
      plan.days = plan.days.map((day: any, index: number) => ({
        ...day,
        date: week[index].toISOString().split('T')[0],
        day_name: week[index].toLocaleDateString('en-US', { weekday: 'long' }),
        is_rest_day: restDays.includes(index),
        intensity: getCycleAwareIntensity(
          cycleData?.phase || null,
          cycleData?.day_in_cycle ? cycleData.day_in_cycle + index : null
        ),
        exercises:
          day.exercises?.map((exercise: any) => ({
            ...exercise,
            completed: false, // Ensure all exercises start as not completed
            calories_estimate:
              exercise.calories_estimate || Math.round(exercise.duration_minutes * 3), // Estimate calories if not provided
          })) || [],
      }));

      return plan;
    }

    throw new Error('No valid JSON found in OpenAI response');
  } catch (openaiError) {
    console.warn('⚠️ OpenAI failed, falling back to Groq:', openaiError.message);

    // Fallback to Groq
    try {
      const chat = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: userContent },
        ],
      });

      const message = chat.choices[0]?.message?.content ?? '';
      const match = message.match(/\{[\s\S]*\}/);

      if (match) {
        const plan = JSON.parse(match[0]);

        // Ensure dates are properly formatted and add completion status
        plan.days = plan.days.map((day: any, index: number) => ({
          ...day,
          date: week[index].toISOString().split('T')[0],
          day_name: week[index].toLocaleDateString('en-US', { weekday: 'long' }),
          is_rest_day: restDays.includes(index),
          intensity: getCycleAwareIntensity(
            cycleData?.phase || null,
            cycleData?.day_in_cycle ? cycleData.day_in_cycle + index : null
          ),
          exercises:
            day.exercises?.map((exercise: any) => ({
              ...exercise,
              completed: false,
              category: exercise.category || 'general',
              calories_estimate:
                exercise.calories_estimate || Math.round(exercise.duration_minutes * 4),
            })) || [],
        }));

        return plan;
      }

      throw new Error('No valid JSON found in Groq response');
    } catch (groqError) {
      console.error('❌ Both OpenAI and Groq failed:', { openaiError, groqError });
      throw new Error(
        `AI plan generation failed. OpenAI: ${openaiError.message}, Groq: ${groqError.message}`
      );
    }
  }
}

async function saveWeeklyPlan(userId: string, plan: any) {
  try {
    // Use a transaction to ensure atomicity
    const { data, error } = await supabase.rpc('save_weekly_exercise_plan', {
      p_user_id: userId,
      p_plan_name: plan.plan_name,
      p_start_date: plan.days[0].date,
      p_end_date: plan.days[6].date,
      p_total_duration_minutes: plan.weekly_goals.total_minutes,
      p_estimated_calories: plan.weekly_goals.estimated_calories,
      p_plan_data: plan,
    });

    if (error) {
      console.warn('RPC function not available, falling back to direct insert:', error);

      // Fallback: First deactivate existing plans, then insert new one
      await supabase
        .from('weekly_exercise_plans')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Add a small delay to ensure the update completes
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { data: insertData, error: insertError } = await supabase
        .from('weekly_exercise_plans')
        .insert({
          user_id: userId,
          plan_name: plan.plan_name,
          start_date: plan.days[0].date,
          end_date: plan.days[6].date,
          total_duration_minutes: plan.weekly_goals.total_minutes,
          estimated_calories: plan.weekly_goals.estimated_calories,
          plan_data: plan,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return insertData;
    }

    return data;
  } catch (error) {
    console.error('Failed to save weekly plan:', error);
    // Don't throw here, just log - we still want to return the plan
    return null;
  }
}

Deno.serve(async (req) => {
  // Check environment variables
  const requiredEnvVars = {
    SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY'),
    GROQ_API_KEY: Deno.env.get('GROQ_API_KEY'),
  };

  if (!requiredEnvVars.OPENAI_API_KEY && !requiredEnvVars.GROQ_API_KEY) {
    console.error('❌ No AI API keys found');
    return jsonError('AI API keys not configured', 500);
  }

  if (req.method !== 'POST') return jsonError('Method Not Allowed', 405);

  try {
    const requestBody = await req.json();

    const { user_id, plan_data, start_date } = requestBody;

    if (!user_id) {
      console.error('❌ Missing user_id');
      return jsonError('user_id is required', 400);
    }

    if (!plan_data) {
      console.error('❌ Missing plan_data');
      return jsonError('plan_data is required', 400);
    }

    const startDate = start_date ? new Date(start_date) : new Date();

    console.log('🤖 Generating plan with data:', {
      user_id,
      fitness_goal: plan_data.fitness_goals?.primary_goal,
      age: plan_data.body_measurements?.age,
      cycle_phase: plan_data.cycle_data?.phase,
      exercise_history: plan_data.exercise_history?.summary,
      start_date: startDate.toDateString(),
    });

    // Generate the weekly plan using the provided data
    const weeklyPlan = await generateWeeklyPlanWithAI(plan_data, startDate);

    // Try to save the plan to the database (optional, continues if it fails)
    let savedPlan = null;
    try {
      savedPlan = await saveWeeklyPlan(user_id, weeklyPlan);
    } catch (saveError) {
      console.warn(
        '⚠️ Failed to save plan to database (continuing without saving):',
        saveError.message
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan: weeklyPlan,
        saved: !!savedPlan,
        plan_id: savedPlan?.id,
        message: savedPlan ? 'Plan generated and saved' : 'Plan generated (not saved to database)',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Weekly exercise plan generation error:', err);
    return jsonError(err.message || 'Internal server error');
  }
});
