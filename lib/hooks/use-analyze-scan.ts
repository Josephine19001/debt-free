import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { ProductAnalysisResult } from '@/lib/types/product';
import { FunctionsHttpError } from '@supabase/supabase-js';

// Custom error types for better error handling
export class NonBeautyProductError extends Error {
  constructor(
    message: string,
    public detectedCategory?: string
  ) {
    super(message);
    this.name = 'NonBeautyProductError';
  }
}

export function useAnalyzeScan() {
  return useMutation<ProductAnalysisResult, Error, { barcode?: string; imageUrl?: string }>({
    mutationFn: async ({ barcode, imageUrl }) => {
      const { data, error } = await supabase.functions.invoke<ProductAnalysisResult>(
        'ai-scan-api',
        {
          body: { barcode, image_url: imageUrl },
        }
      );

      if (error) {
        if (
          error instanceof FunctionsHttpError &&
          error.context &&
          typeof error.context.json === 'function'
        ) {
          try {
            const errorMessage = await error.context.json();

            if (errorMessage?.error?.includes('We currently only support scanning beauty')) {
              const detectedMatch = errorMessage.error.match(/Detected: "([^"]+)"/);
              const detectedCategory = detectedMatch ? detectedMatch[1] : 'Unknown';
              throw new NonBeautyProductError(errorMessage.error, detectedCategory);
            }

            throw new Error(errorMessage.error || 'An unknown server error occurred');
          } catch (parseErr) {
            // If it's our custom error, re-throw it
            if (parseErr instanceof NonBeautyProductError) {
              throw parseErr;
            }

            console.warn('Failed to parse error context JSON:', parseErr);
            throw new Error('Edge Function returned a non-2xx status code');
          }
        }

        throw new Error(error.message || 'Edge Function returned a non-2xx status code');
      }

      if (!data) {
        throw new Error('No analysis data received. Please try again.');
      }

      return data;
    },
  });
}
