import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import {
  api,
  type Account,
  type CreateAccountData,
  type UpdateAccountData,
  type Subscription,
  type VerifyReceiptData,
} from '../api';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export function useAccount(options?: UseQueryOptions<Account>) {
  return useQuery({
    queryKey: queryKeys.accounts.detail(),
    queryFn: async () => {
      return await api.accounts.getAccount();
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAccountData) => {
      return await api.accounts.createAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
    onError: (error) => handleError(error, 'Failed to create account'),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAccountData) => {
      return await api.accounts.updateAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Account updated successfully');
    },
    onError: (error) => handleError(error, 'Failed to update account'),
  });
}

export function useUpdateAccountAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageUri, base64 }: { imageUri: string; base64: string }) => {
      return await api.accounts.uploadAvatar(imageUri, base64);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      toast.success('Avatar updated successfully');
    },
    onError: (error) => handleError(error, 'Failed to update avatar'),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.accounts.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Account deleted successfully');
    },
    onError: (error) => handleError(error, 'Failed to delete account'),
  });
}

export function useSubscription(options?: UseQueryOptions<Subscription>) {
  return useQuery({
    queryKey: queryKeys.accounts.subscription(),
    queryFn: async () => {
      return await api.accounts.getSubscription();
    },
    ...options,
  });
}

export function useVerifyReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VerifyReceiptData) => {
      return await api.accounts.verifyReceipt(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.subscription() });
      toast.success('Subscription verified successfully');
    },
    onError: (error) => handleError(error, 'Failed to verify receipt'),
  });
}
