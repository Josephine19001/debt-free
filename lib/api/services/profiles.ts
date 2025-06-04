import { apiClient } from '../client';
import type { HairProfile, CreateHairProfileData, UpdateHairProfileData } from '../types';

export const profilesService = {
  async createProfile(data: CreateHairProfileData): Promise<HairProfile> {
    return apiClient.post<HairProfile>('/accounts/hair-profile', data);
  },

  async getProfile(): Promise<HairProfile> {
    return apiClient.get<HairProfile>('/accounts/hair-profile/me');
  },

  async updateProfile(data: UpdateHairProfileData): Promise<HairProfile> {
    return apiClient.put<HairProfile>('/accounts/hair-profile/me', data);
  },

  async deleteProfile(): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>('/accounts/hair-profile/me');
  },

  async getOptions(): Promise<{
    hairTexture: string[];
    hairPorosity: string[];
    hairDensity: string[];
    scalpType: string[];
    hairLength: string[];
    treatmentTypes: string[];
    concerns: string[];
    goals: string[];
    frequency: string[];
    timeAvailable: string[];
    budget: string[];
  }> {
    return apiClient.get('/accounts/hair-profile/options');
  },
};
