import { apiClient } from '../client';
import type {
  Routine,
  GenerateRoutineData,
  CreateRoutineData,
  UpdateRoutineData,
  RoutineLog,
  LogRoutineData,
  RoutineAnalytics,
  ApiResponse,
} from '../types';

export const routinesService = {
  async generateRoutine(data: GenerateRoutineData): Promise<ApiResponse<Routine>> {
    return apiClient.post<ApiResponse<Routine>>('/routines/generate', data);
  },

  async getRoutines(): Promise<ApiResponse<Routine[]>> {
    return apiClient.get<ApiResponse<Routine[]>>('/routines');
  },

  async getRoutine(id: string): Promise<ApiResponse<Routine>> {
    return apiClient.get<ApiResponse<Routine>>(`/routines/${id}`);
  },

  async createRoutine(data: CreateRoutineData): Promise<ApiResponse<Routine>> {
    return apiClient.post<ApiResponse<Routine>>('/routines', data);
  },

  async updateRoutine(id: string, data: UpdateRoutineData): Promise<ApiResponse<Routine>> {
    return apiClient.put<ApiResponse<Routine>>(`/routines/${id}`, data);
  },

  async deleteRoutine(id: string): Promise<void> {
    return apiClient.delete<void>(`/routines/${id}`);
  },

  async logRoutineCompletion(
    routineId: string,
    data: LogRoutineData
  ): Promise<ApiResponse<RoutineLog>> {
    return apiClient.post<ApiResponse<RoutineLog>>(`/routines/${routineId}/tracking`, data);
  },

  async getRoutineTracking(routineId: string): Promise<ApiResponse<RoutineLog[]>> {
    return apiClient.get<ApiResponse<RoutineLog[]>>(`/routines/${routineId}/tracking`);
  },

  async getAnalytics(): Promise<ApiResponse<RoutineAnalytics>> {
    return apiClient.get<ApiResponse<RoutineAnalytics>>('/routines/analytics');
  },
};
