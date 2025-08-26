export const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    detail: () => [...queryKeys.accounts.all, 'detail'] as const,
    subscription: () => [...queryKeys.accounts.all, 'subscription'] as const,
  },
  subscription: {
    all: ['subscription'] as const,
    info: (userId?: string) => [...queryKeys.subscription.all, 'info', userId] as const,
    status: () => [...queryKeys.subscription.all, 'status'] as const,
  },
  scans: {
    all: ['scans'] as const,
    list: (filter: string, sort: string, search?: string) =>
      [...queryKeys.scans.all, 'list', filter, sort, search] as const,
    detail: (id: string) => [...queryKeys.scans.all, 'detail', id] as const,
  },
  favorites: {
    all: ['favorites'] as const,
  },
  preview: {
    recent: () => queryKeys.scans.list('recent', 'newest'),
    favorites: () => queryKeys.scans.list('favorites', 'newest'),
  },
} as const;
