import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from '@/types/onboarding';

const ONBOARDING_DATA_KEY = '@lunasync/onboarding_data';

export class OnboardingStorage {
  /**
   * Save onboarding data to local storage
   */
  static async saveOnboardingData(data: OnboardingData): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(ONBOARDING_DATA_KEY, jsonData);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      throw new Error('Failed to save onboarding data locally');
    }
  }

  /**
   * Retrieve onboarding data from local storage
   */
  static async getOnboardingData(): Promise<OnboardingData | null> {
    try {
      const jsonData = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
      if (!jsonData) return null;
      
      return JSON.parse(jsonData) as OnboardingData;
    } catch (error) {
      console.error('Failed to retrieve onboarding data:', error);
      return null;
    }
  }

  /**
   * Update specific fields in onboarding data
   */
  static async updateOnboardingData(updates: Partial<OnboardingData>): Promise<void> {
    try {
      const existing = await this.getOnboardingData();
      const updated = { ...existing, ...updates };
      await this.saveOnboardingData(updated as OnboardingData);
    } catch (error) {
      console.error('Failed to update onboarding data:', error);
      throw new Error('Failed to update onboarding data locally');
    }
  }

  /**
   * Clear onboarding data from local storage
   */
  static async clearOnboardingData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear onboarding data:', error);
    }
  }

  /**
   * Check if onboarding data exists
   */
  static async hasOnboardingData(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
      return data !== null;
    } catch {
      return false;
    }
  }
}
