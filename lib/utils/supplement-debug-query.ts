/**
 * Direct database queries for debugging supplement issues
 */

import { supabase } from '@/lib/supabase/client';
import { getTodayDateString } from './date-helpers';

/**
 * Debug function to directly query supplement logs from the database
 */
export async function debugSupplementLogs(date?: string) {
  const targetDate = date || getTodayDateString();

  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.log('[DEBUG] No authenticated user');
      return;
    }

    console.log(`[DEBUG] Querying supplement logs for date: ${targetDate}`);
    console.log(`[DEBUG] User ID: ${user.user.id}`);

    // Get all supplement logs for the user
    const { data: allLogs, error: allLogsError } = await supabase
      .from('supplement_logs')
      .select('*')
      .eq('user_id', user.user.id)
      .order('date', { ascending: false })
      .limit(10);

    if (allLogsError) {
      console.error('[DEBUG] Error fetching all logs:', allLogsError);
      return;
    }

    console.log('[DEBUG] Recent supplement logs:', allLogs);

    // Get logs for the specific date
    const { data: dateLogs, error: dateLogsError } = await supabase
      .from('supplement_logs')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('date', targetDate);

    if (dateLogsError) {
      console.error('[DEBUG] Error fetching date logs:', dateLogsError);
      return;
    }

    console.log(`[DEBUG] Logs for ${targetDate}:`, dateLogs);

    // Get user's supplements
    const { data: supplements, error: supplementsError } = await supabase
      .from('user_supplements')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_active', true);

    if (supplementsError) {
      console.error('[DEBUG] Error fetching supplements:', supplementsError);
      return;
    }

    console.log('[DEBUG] User supplements:', supplements);

    return {
      allLogs,
      dateLogs,
      supplements,
      targetDate,
      userId: user.user.id,
    };
  } catch (error) {
    console.error('[DEBUG] Error in debugSupplementLogs:', error);
  }
}

/**
 * Clear a specific supplement log entry
 */
export async function clearSupplementLog(supplementName: string, date?: string) {
  const targetDate = date || getTodayDateString();

  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      console.log('[DEBUG] No authenticated user');
      return;
    }

    console.log(`[DEBUG] Clearing supplement log for ${supplementName} on ${targetDate}`);

    const { data, error } = await supabase
      .from('supplement_logs')
      .delete()
      .eq('user_id', user.user.id)
      .eq('supplement_name', supplementName)
      .eq('date', targetDate);

    if (error) {
      console.error('[DEBUG] Error clearing supplement log:', error);
      return;
    }

    console.log(`[DEBUG] Successfully cleared supplement log for ${supplementName}`);
    return data;
  } catch (error) {
    console.error('[DEBUG] Error in clearSupplementLog:', error);
  }
}
