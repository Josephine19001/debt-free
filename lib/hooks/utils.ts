import { toast } from 'sonner-native';
import { ApiClientError } from '../api';

export const handleError = (error: unknown, defaultMessage: string) => {
  if (error instanceof ApiClientError) {
    toast.error(error.message);
  } else {
    toast.error(defaultMessage);
  }
};
