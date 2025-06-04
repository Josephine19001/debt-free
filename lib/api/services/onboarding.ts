import { apiClient } from '../client';
import type {
  OnboardingResponse,
  CreateOnboardingResponseData,
  UpdateOnboardingResponseData,
  CompleteOnboardingData,
  CompleteOnboardingResponse,
} from '../types';

export const onboardingService = {
  // Complete onboarding - creates both survey responses and hair profile
  async completeOnboarding(data: CompleteOnboardingData): Promise<CompleteOnboardingResponse> {
    return apiClient.post<CompleteOnboardingResponse>('/accounts/onboarding/complete', data);
  },

  async createOnboardingResponse(
    data: CreateOnboardingResponseData & { accountId: string }
  ): Promise<OnboardingResponse> {
    return apiClient.post<OnboardingResponse>('/accounts/onboarding', data);
  },

  async getOnboardingResponse(): Promise<OnboardingResponse> {
    return apiClient.get<OnboardingResponse>('/accounts/onboarding/me');
  },

  async updateOnboardingResponse(data: UpdateOnboardingResponseData): Promise<OnboardingResponse> {
    return apiClient.put<OnboardingResponse>('/accounts/onboarding/me', data);
  },

  async deleteOnboardingResponse(): Promise<void> {
    return apiClient.delete<void>('/accounts/onboarding/me');
  },
};
