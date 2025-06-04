import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import {
  api,
  type OnboardingResponse,
  type CreateOnboardingResponseData,
  type UpdateOnboardingResponseData,
  type CompleteOnboardingData,
  type CompleteOnboardingResponse,
} from '../api';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export function useOnboardingResponse(options?: UseQueryOptions<OnboardingResponse>) {
  return useQuery({
    queryKey: queryKeys.onboarding.detail(),
    queryFn: async () => {
      return await api.onboarding.getOnboardingResponse();
    },
    ...options,
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CompleteOnboardingData) => {
      return await api.onboarding.completeOnboarding(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Onboarding completed successfully');
    },
    onError: (error) => handleError(error, 'Failed to complete onboarding'),
  });
}

export function useCreateOnboardingResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOnboardingResponseData & { accountId: string }) => {
      return await api.onboarding.createOnboardingResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      toast.success('Onboarding responses saved successfully');
    },
    onError: (error) => handleError(error, 'Failed to save onboarding responses'),
  });
}

export function useUpdateOnboardingResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOnboardingResponseData) => {
      return await api.onboarding.updateOnboardingResponse(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      toast.success('Onboarding responses updated successfully');
    },
    onError: (error) => handleError(error, 'Failed to update onboarding responses'),
  });
}

export function useDeleteOnboardingResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.onboarding.deleteOnboardingResponse(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      toast.success('Onboarding responses deleted successfully');
    },
    onError: (error) => handleError(error, 'Failed to delete onboarding responses'),
  });
}
