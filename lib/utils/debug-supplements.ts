/**
 * Debug utilities for supplement tracking
 */

import { QueryClient } from '@tanstack/react-query';
import { supplementQueryKeys } from '@/lib/hooks/use-supplements';
import { getTodayDateString } from './date-helpers';

/**
 * Clear all supplement caches - useful for debugging
 */
export function clearSupplementCaches(queryClient: QueryClient) {
  console.log('[DEBUG] Clearing all supplement caches...');

  // Clear ALL queries (nuclear option)
  queryClient.clear();

  // Also specifically target supplement queries
  queryClient.removeQueries({ queryKey: supplementQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: supplementQueryKeys.all });

  // Specifically clear today's cache
  const today = getTodayDateString();
  queryClient.removeQueries({ queryKey: [...supplementQueryKeys.today(), today] });

  console.log(`[DEBUG] Cleared ALL caches including supplements for date: ${today}`);
}

/**
 * Log current supplement cache state - useful for debugging
 */
export function logSupplementCacheState(queryClient: QueryClient) {
  const today = getTodayDateString();
  const todayCache = queryClient.getQueryData([...supplementQueryKeys.today(), today]);

  console.log('[DEBUG] Current supplement cache state:');
  console.log(`Date: ${today}`);
  console.log(`Today's supplements:`, todayCache);

  // Log timezone info
  const now = new Date();
  console.log(`Local time: ${now.toLocaleString()}`);
  console.log(`UTC time: ${now.toISOString()}`);
  console.log(`Timezone offset: ${now.getTimezoneOffset()} minutes`);
}
