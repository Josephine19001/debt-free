import type { ProductFilters, SearchProductsParams } from '../api';

export const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    detail: () => [...queryKeys.accounts.all, 'detail'] as const,
    subscription: () => [...queryKeys.accounts.all, 'subscription'] as const,
  },
  onboarding: {
    all: ['onboarding'] as const,
    detail: () => [...queryKeys.onboarding.all, 'detail'] as const,
  },
  profiles: {
    all: ['profiles'] as const,
    lists: () => [...queryKeys.profiles.all, 'list'] as const,
  },
  routines: {
    all: ['routines'] as const,
    lists: () => [...queryKeys.routines.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.routines.all, 'detail', id] as const,
    tracking: (id: string) => [...queryKeys.routines.all, 'tracking', id] as const,
    analytics: () => [...queryKeys.routines.all, 'analytics'] as const,
  },
  products: {
    all: ['products'] as const,
    lists: (filters?: ProductFilters) => [...queryKeys.products.all, 'list', filters] as const,
    search: (params: SearchProductsParams) =>
      [...queryKeys.products.all, 'search', params] as const,
    saved: (accountId?: string) => [...queryKeys.products.all, 'saved', accountId] as const,
    custom: () => [...queryKeys.products.all, 'custom'] as const,
    customProduct: (productId: string) => [...queryKeys.products.all, 'custom', productId] as const,
  },
} as const;
