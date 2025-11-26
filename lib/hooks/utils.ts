import { useState, useEffect } from 'react';
import { toast } from 'sonner-native';

export const handleError = (error: unknown, defaultMessage: string) => {
  if (error instanceof Error) {
    console.error(error);
    toast.error(error.message);
  } else {
    toast.error(defaultMessage);
  }
};

/**
 * Hook to debounce a value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
