import { router } from 'expo-router';

const API_BASE_URL = 'https://h-deets-ai-backend.vercel.app/api/v1';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.setToken(null);
        router.replace('/auth');
        throw new ApiClientError(401, 'Unauthorized');
      }

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;

        throw new ApiClientError(response.status, errorMessage);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      throw new ApiClientError(0, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: { data?: any }): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: options?.data ? JSON.stringify(options.data) : undefined,
    });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        this.setToken(null);
        router.replace('/auth');
        throw new ApiClientError(401, 'Unauthorized');
      }

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;

        throw new ApiClientError(response.status, errorMessage);
      }

      if (response.status === 204) {
        return {} as T;
      }

      const result = await response.json();
      return result;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      throw new ApiClientError(0, error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
