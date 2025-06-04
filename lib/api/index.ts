export { apiClient, ApiClientError } from './client';
export type { ApiError } from './client';

export * from './types';

import { accountsService } from './services/accounts';
import { onboardingService } from './services/onboarding';
import { profilesService } from './services/profiles';
import { routinesService } from './services/routines';
import { productsService } from './services/products';

export { accountsService, onboardingService, profilesService, routinesService, productsService };

export const api = {
  accounts: accountsService,
  onboarding: onboardingService,
  profiles: profilesService,
  routines: routinesService,
  products: productsService,
};
