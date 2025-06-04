import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import {
  api,
  type Routine,
  type GenerateRoutineData,
  type CreateRoutineData,
  type UpdateRoutineData,
  type RoutineLog,
  type LogRoutineData,
  type RoutineAnalytics,
} from '../api';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export function useRoutines(options?: UseQueryOptions<Routine[]>) {
  return useQuery({
    queryKey: queryKeys.routines.lists(),
    queryFn: async () => {
      const response = await api.routines.getRoutines();
      return response.data;
    },
    ...options,
  });
}

export function useRoutine(id: string, options?: UseQueryOptions<Routine>) {
  return useQuery({
    queryKey: queryKeys.routines.detail(id),
    queryFn: async () => {
      const response = await api.routines.getRoutine(id);
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useGenerateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GenerateRoutineData) => {
      const response = await api.routines.generateRoutine(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
      toast.success('Routine generated successfully');
    },
    onError: (error) => handleError(error, 'Failed to generate routine'),
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoutineData) => {
      const response = await api.routines.createRoutine(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
      toast.success('Routine created successfully');
    },
    onError: (error) => handleError(error, 'Failed to create routine'),
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoutineData }) => {
      const response = await api.routines.updateRoutine(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.detail(variables.id) });
      toast.success('Routine updated successfully');
    },
    onError: (error) => handleError(error, 'Failed to update routine'),
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.routines.deleteRoutine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });
      toast.success('Routine deleted successfully');
    },
    onError: (error) => handleError(error, 'Failed to delete routine'),
  });
}

export function useLogRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routineId, data }: { routineId: string; data: LogRoutineData }) => {
      const response = await api.routines.logRoutineCompletion(routineId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.tracking(variables.routineId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.analytics() });
      toast.success('Routine logged successfully');
    },
    onError: (error) => handleError(error, 'Failed to log routine'),
  });
}

export function useRoutineTracking(routineId: string, options?: UseQueryOptions<RoutineLog[]>) {
  return useQuery({
    queryKey: queryKeys.routines.tracking(routineId),
    queryFn: async () => {
      const response = await api.routines.getRoutineTracking(routineId);
      return response.data;
    },
    enabled: !!routineId,
    ...options,
  });
}

export function useRoutineAnalytics(options?: UseQueryOptions<RoutineAnalytics>) {
  return useQuery({
    queryKey: queryKeys.routines.analytics(),
    queryFn: async () => {
      const response = await api.routines.getAnalytics();
      return response.data;
    },
    ...options,
  });
}
