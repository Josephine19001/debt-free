import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner-native';

export interface SymptomEntry {
  date: string;
  symptoms: string[];
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface MoodEntry {
  date: string;
  mood: 'happy' | 'normal' | 'sad' | 'irritable' | 'anxious';
  energy_level?: 'high' | 'medium' | 'low';
  notes?: string;
}

// Updated functions to use cycle manager for consistency
export function useLogSymptoms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: SymptomEntry) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      // Use cycle manager endpoint for consistency
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/cycle-manager/log-symptoms`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: entry.date,
            symptoms: entry.symptoms,
            severity: entry.severity,
            notes: entry.notes,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log symptoms');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate cycle queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['cycle'] });
    },
    onError: (error: Error) => {
      console.error('Error logging symptoms:', error);
      toast.error('Failed to log symptoms', {
        description: error.message,
      });
    },
  });
}

export function useLogMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: MoodEntry) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('Not authenticated');
      }

      // Use cycle manager endpoint for consistency
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/cycle-manager/log-mood`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: entry.date,
            mood: entry.mood,
            energy_level: entry.energy_level,
            notes: entry.notes,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log mood');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate cycle queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['cycle'] });
    },
    onError: (error: Error) => {
      console.error('Error logging mood:', error);
      toast.error('Failed to log mood', {
        description: error.message,
      });
    },
  });
}
