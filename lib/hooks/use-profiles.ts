import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner-native';
import {
  api,
  type HairProfile,
  type CreateHairProfileData,
  type UpdateHairProfileData,
} from '../api';
import { queryKeys } from './query-keys';
import { handleError } from './utils';

export function useProfiles(options?: UseQueryOptions<HairProfile>) {
  return useQuery({
    queryKey: queryKeys.profiles.lists(),
    queryFn: async () => {
      return await api.profiles.getProfile();
    },
    ...options,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHairProfileData) => {
      return await api.profiles.createProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      toast.success('Hair profile created successfully');
    },
    onError: (error) => handleError(error, 'Failed to create hair profile'),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateHairProfileData) => {
      return await api.profiles.updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      toast.success('Hair profile updated successfully');
    },
    onError: (error) => handleError(error, 'Failed to update hair profile'),
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.profiles.deleteProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
      toast.success('Hair profile deleted successfully');
    },
    onError: (error) => handleError(error, 'Failed to delete hair profile'),
  });
}
