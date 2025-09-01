# Weekly Exercise Plan Fetching Improvements

## Problem Summary

The AI weekly exercise planner was auto-saving plans, but the fetching logic had several issues:

1. **Race conditions**: Multiple active plans could exist simultaneously
2. **Stale data**: Newly generated plans weren't immediately available
3. **Date range filtering**: Plans starting in the future weren't being found
4. **No "latest plan" fetching**: Only current/active plan queries existed

## Solutions Implemented

### 1. Atomic Plan Saving (`create-save-weekly-plan-function.sql`)

- Created PostgreSQL function `save_weekly_exercise_plan()` that atomically:
  - Deactivates all existing active plans for the user
  - Inserts new plan as active
  - Returns the new plan data
- Eliminates race conditions and ensures only one active plan exists

### 2. Improved AI Function (`supabase/functions/ai-weekly-exercise-planner/index.ts`)

- Updated `saveWeeklyPlan()` to use the new RPC function
- Added fallback to direct database operations if RPC isn't available
- Added small delay between deactivation and insertion as backup

### 3. Enhanced Hooks (`lib/hooks/use-weekly-exercise-planner.ts`)

#### New Hook: `useLatestWeeklyPlan()`

- Fetches the most recently created plan (regardless of active status)
- Perfect for getting newly generated plans
- Short stale time (1 minute) for fresh data

#### Improved: `useCurrentWeeklyPlan()`

- First tries to find active plan for current date range
- Falls back to most recent active plan if none found for today
- Handles edge cases better

#### Enhanced: `useGenerateWeeklyExercisePlan()`

- Invalidates all weekly plan queries after generation
- Forces refresh of both latest and current plan queries
- Ensures UI updates immediately with new data

## Usage Recommendations

### For Getting Newly Generated Plans:

```typescript
const { data: latestPlan } = useLatestWeeklyPlan();
```

### For Getting Current Active Plan:

```typescript
const { data: currentPlan } = useCurrentWeeklyPlan();
```

### For All Plans (History):

```typescript
const { data: allPlans } = useWeeklyExercisePlans();
```

## Database Setup Required

1. Run the SQL function creation:

```sql
-- Run create-save-weekly-plan-function.sql
```

2. The AI function will automatically use the new atomic saving logic

## Benefits

1. **Reliable Plan Fetching**: No more stale or missing data
2. **Atomic Operations**: Race conditions eliminated
3. **Immediate UI Updates**: Fresh data appears instantly after generation
4. **Better UX**: Users always see their newest plans
5. **Fallback Support**: Works even if new features aren't deployed yet

## Testing

Use the updated test JSON with real user data:

- User ID: `ae191376-b756-4cfc-b678-5903863df460`
- Based on actual exercise history (kickboxing, cycling, calisthenics)
- Includes cycle phase and realistic preferences

The plan will now be:

1. Generated and saved atomically
2. Immediately available via `useLatestWeeklyPlan()`
3. Properly activated and fetchable via `useCurrentWeeklyPlan()`
