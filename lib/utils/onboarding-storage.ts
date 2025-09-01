import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from '@/types/onboarding';

const ONBOARDING_DATA_KEY = '@lunasync_onboarding_data';

export class OnboardingStorage {
  /**
   * Save onboarding data to local storage
   */
  static async save(data: OnboardingData): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(ONBOARDING_DATA_KEY, jsonData);
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      throw new Error('Failed to save onboarding data');
    }
  }

  /**
   * Load onboarding data from local storage
   */
  static async load(): Promise<OnboardingData | null> {
    try {
      const jsonData = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
      if (!jsonData) return null;

      return JSON.parse(jsonData) as OnboardingData;
    } catch (error) {
      console.error('Failed to load onboarding data:', error);
      return null;
    }
  }

  /**
   * Update specific fields in the onboarding data
   */
  static async update(updates: Partial<OnboardingData>): Promise<void> {
    try {
      const existingData = await this.load();
      const updatedData = { ...existingData, ...updates };
      await this.save(updatedData as OnboardingData);
    } catch (error) {
      console.error('Failed to update onboarding data:', error);
      throw new Error('Failed to update onboarding data');
    }
  }

  /**
   * Clear onboarding data from local storage
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
    } catch (error) {
      console.error('Failed to clear onboarding data:', error);
      throw new Error('Failed to clear onboarding data');
    }
  }

  /**
   * Check if onboarding data exists
   */
  static async exists(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
      return data !== null;
    } catch (error) {
      console.error('Failed to check onboarding data existence:', error);
      return false;
    }
  }
}
