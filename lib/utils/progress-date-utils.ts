import {
  getLocalDateString,
  getStartOfWeek,
  getEndOfWeek,
  subtractDays,
  subtractWeeks,
  subtractMonths,
  subtractYears,
} from '@/lib/utils/date-helpers';

export type PeriodType = '90days' | '6months' | '1year' | 'alltime';
export type WeekType = 'thisweek' | 'lastweek' | '2weeksago' | '3weeksago';

export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Validates if a week selection is valid for a given period
 */
export function isValidWeekPeriodCombination(
  week: WeekType,
  period: PeriodType
): boolean {
  try {
    const today = new Date();
    
    // All weeks are valid for all-time period
    if (period === 'alltime') {
      return true;
    }

    // Get period start date
    const periodStart = getPeriodStartDate(period, today);
    
    // Get week start date
    const weekStart = getWeekStartDate(week, today);
    
    // Week is valid if it starts within the period
    return weekStart >= periodStart;
  } catch (error) {
    console.error('Error validating week/period combination:', error);
    return false;
  }
}

/**
 * Gets the start date for a given period
 */
export function getPeriodStartDate(period: PeriodType, referenceDate: Date = new Date()): Date {
  switch (period) {
    case '90days':
      return subtractDays(referenceDate, 90);
    case '6months':
      return subtractMonths(referenceDate, 6);
    case '1year':
      return subtractYears(referenceDate, 1);
    case 'alltime':
    default:
      return new Date('2020-01-01');
  }
}

/**
 * Gets the start date for a given week
 */
export function getWeekStartDate(week: WeekType, referenceDate: Date = new Date()): Date {
  switch (week) {
    case 'thisweek':
      return getStartOfWeek(referenceDate);
    case 'lastweek':
      return getStartOfWeek(subtractWeeks(referenceDate, 1));
    case '2weeksago':
      return getStartOfWeek(subtractWeeks(referenceDate, 2));
    case '3weeksago':
      return getStartOfWeek(subtractWeeks(referenceDate, 3));
    default:
      return getStartOfWeek(referenceDate);
  }
}

/**
 * Gets the end date for a given week
 */
export function getWeekEndDate(week: WeekType, referenceDate: Date = new Date()): Date {
  switch (week) {
    case 'thisweek':
      return getEndOfWeek(referenceDate);
    case 'lastweek':
      return getEndOfWeek(subtractWeeks(referenceDate, 1));
    case '2weeksago':
      return getEndOfWeek(subtractWeeks(referenceDate, 2));
    case '3weeksago':
      return getEndOfWeek(subtractWeeks(referenceDate, 3));
    default:
      return getEndOfWeek(referenceDate);
  }
}

/**
 * Calculates the date range for a given week and period combination
 */
export function calculateDateRange(
  week: WeekType,
  period: PeriodType,
  referenceDate: Date = new Date()
): DateRange {
  try {
    // Get week dates
    const weekStart = getWeekStartDate(week, referenceDate);
    const weekEnd = getWeekEndDate(week, referenceDate);
    
    // Get period constraint
    const periodStart = getPeriodStartDate(period, referenceDate);
    
    // Validate dates
    const isValidDate = (date: Date) => date instanceof Date && !isNaN(date.getTime());
    
    if (!isValidDate(weekStart) || !isValidDate(weekEnd) || !isValidDate(periodStart)) {
      throw new Error('Invalid date calculation');
    }

    // Use the later of the two start dates (week start or period start)
    const finalStartDate = weekStart > periodStart ? weekStart : periodStart;
    
    // Ensure end date is not before start date
    const validEndDate = weekEnd < finalStartDate ? finalStartDate : weekEnd;

    return {
      startDate: getLocalDateString(finalStartDate),
      endDate: getLocalDateString(validEndDate),
    };
  } catch (error) {
    console.error('Error calculating date range:', error);
    // Fallback to safe defaults
    return {
      startDate: getLocalDateString(getStartOfWeek(referenceDate)),
      endDate: getLocalDateString(getEndOfWeek(referenceDate)),
    };
  }
}

/**
 * Gets valid week options for a given period
 */
export function getValidWeekOptions(period: PeriodType): WeekType[] {
  const allWeeks: WeekType[] = ['thisweek', 'lastweek', '2weeksago', '3weeksago'];
  
  if (period === 'alltime') {
    return allWeeks;
  }
  
  return allWeeks.filter(week => isValidWeekPeriodCombination(week, period));
}

/**
 * Week options with labels for UI
 */
export const WEEK_OPTIONS = [
  { label: 'This week', value: 'thisweek' as WeekType },
  { label: 'Last week', value: 'lastweek' as WeekType },
  { label: '2 wks. ago', value: '2weeksago' as WeekType },
  { label: '3 wks. ago', value: '3weeksago' as WeekType },
];

/**
 * Gets the default safe week for a given period
 */
export function getSafeDefaultWeek(period: PeriodType): WeekType {
  const validWeeks = getValidWeekOptions(period);
  return validWeeks.includes('thisweek') ? 'thisweek' : validWeeks[0] || 'thisweek';
}