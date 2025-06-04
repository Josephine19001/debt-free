# H-Deets AI API Integration

This document outlines the complete API integration setup for the H-Deets AI Expo app with the backend at https://h-deets-ai-backend.vercel.app/.

## 🚀 What's Been Set Up

### 1. API Client Architecture

- **`lib/api/client.ts`** - Centralized HTTP client with automatic authentication
- **`lib/api/types.ts`** - Complete TypeScript definitions for all API responses
- **`lib/api/services/`** - Service layer organized by domain:
  - `accounts.ts` - User account management
  - `profiles.ts` - Hair profile management
  - `routines.ts` - Routine creation, tracking, and analytics
  - `products.ts` - Product search, scanning, and management

### 2. React Query Integration

- **`lib/hooks/`** - Organized React Query hooks by domain:
  - `query-keys.ts` - Centralized query key management
  - `utils.ts` - Shared utilities (error handling)
  - `use-accounts.ts` - Account-related hooks
  - `use-profiles.ts` - Hair profile hooks
  - `use-routines.ts` - Routine management hooks
  - `use-products.ts` - Product management hooks
  - `index.ts` - Unified exports

### 3. Authentication System

- **`context/auth-provider.tsx`** - Authentication context with secure token storage
- **Automatic token management** - Tokens are automatically attached to API requests
- **Secure storage** - Uses Expo SecureStore for token persistence
- **Auto-redirect** - Automatically redirects to auth on 401 errors

### 4. Enhanced Root Provider

- **`context/root-provider.tsx`** - Updated to include AuthProvider
- **React Query configuration** - Optimized settings for mobile apps
- **Error handling** - Global error handling with toast notifications

## 🔧 How to Use

### Authentication

```typescript
import { useAuth } from '@/context/auth-provider';

function MyComponent() {
  const { token, setToken, signOut } = useAuth();

  // Set token (usually from Supabase auth)
  await setToken(supabaseToken);

  // Sign out
  await signOut();
}
```

### API Hooks Examples

```typescript
import { useProducts, useRoutines, useCreateRoutine, useProfiles } from '@/lib/hooks/use-api';

function ProductsScreen() {
  // Fetch all products
  const { data: products, isLoading, error } = useProducts();

  // Fetch products with filters
  const { data: shampoos } = useProducts({ category: 'shampoo' });

  // Create a new routine
  const createRoutine = useCreateRoutine();

  const handleCreateRoutine = async () => {
    await createRoutine.mutateAsync({
      hairProfileId: 'profile-id',
      name: 'My Routine',
      description: 'Daily hair care',
      frequency: 'daily',
      steps: [{ order: 1, instruction: 'Apply shampoo' }],
    });
  };
}
```

### Error Handling

All hooks include automatic error handling with toast notifications:

```typescript
const { data, error } = useProducts();

// Errors are automatically shown as toast messages
// No need for manual error handling in most cases
```

## 📋 Available API Endpoints

### Accounts

- `useAccount()` - Get current user account
- `useCreateAccount()` - Create new account
- `useUpdateAccount()` - Update account details
- `useDeleteAccount()` - Delete account
- `useSubscription()` - Get subscription status
- `useVerifyReceipt()` - Verify app store receipt

### Hair Profiles

- `useProfiles()` - Get all hair profiles
- `useCreateProfile()` - Create new hair profile
- `useUpdateProfile()` - Update existing profile
- `useDeleteProfile()` - Delete profile

### Routines

- `useRoutines()` - Get all routines
- `useRoutine(id)` - Get specific routine
- `useGenerateRoutine()` - AI-generate new routine
- `useCreateRoutine()` - Create custom routine
- `useUpdateRoutine()` - Update routine
- `useDeleteRoutine()` - Delete routine
- `useLogRoutine()` - Log routine completion
- `useRoutineTracking(id)` - Get routine tracking history
- `useRoutineAnalytics()` - Get analytics data

### Products

- `useProducts(filters?)` - Get products with optional filters
- `useSearchProducts(params)` - Search products
- `useScanBarcode()` - Scan product barcode
- `useSavedProducts()` - Get saved products
- `useSaveProduct()` - Save product to favorites
- `useRemoveSavedProduct()` - Remove from favorites
- `useCustomProducts()` - Get custom products
- `useCreateCustomProduct()` - Create custom product

## 🔍 Testing the Integration

### Test Backend Connection

```typescript
import { testBackendConnection } from '@/lib/utils/test-connection';

// Test if backend is reachable
const isConnected = await testBackendConnection();
```

### Test API Endpoints

```typescript
import { testAPIEndpoint } from '@/lib/utils/test-connection';

// Test specific endpoints (requires authentication)
await testAPIEndpoint('/products');
```

## 📱 Example: Updated Products Screen

The products screen has been updated as an example:

- **Real API integration** - Fetches data from backend
- **Loading states** - Shows spinners while loading
- **Error handling** - Graceful error states
- **Authentication checks** - Shows sign-in prompt when needed
- **Caching** - Automatic data caching with React Query

## 🔐 Authentication Flow

1. **User signs in** (via Supabase or other auth provider)
2. **Token is stored** securely using Expo SecureStore
3. **Token is automatically attached** to all API requests
4. **On 401 errors**, user is redirected to auth screen
5. **Token persists** across app restarts

## ⚙️ Configuration

### API Base URL

Set in `lib/api/client.ts`:

```typescript
const API_BASE_URL = 'https://h-deets-ai-backend.vercel.app/api/v1';
```

### React Query Settings

Configured in `context/root-provider.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

## 🚨 Important Notes

1. **Authentication Required** - Most endpoints require a valid JWT token
2. **Error Handling** - All hooks include automatic error handling with toasts
3. **Caching** - Data is automatically cached and revalidated
4. **TypeScript** - Full type safety for all API interactions
5. **Offline Support** - React Query provides offline capabilities

## 🐛 Debugging

### Check Network Requests

Use React Query DevTools:

```typescript
import { useReactQueryDevTools } from '@dev-plugins/react-query';

// Already enabled in RootProvider
```

### Log API Calls

Enable in `lib/api/client.ts` for debugging:

```typescript
console.log('API Request:', url, options);
console.log('API Response:', response);
```

## 🔄 Migration from Mock Data

1. **Replace imports** - Change from mock data to API hooks
2. **Add loading states** - Handle loading and error states
3. **Update data structure** - Ensure components work with API response format
4. **Add authentication** - Check for user authentication
5. **Handle errors** - Add error boundaries if needed

## 📚 Next Steps

1. **Implement authentication** - Set up Supabase auth integration
2. **Update remaining screens** - Migrate other screens from mock data
3. **Add offline support** - Implement offline-first functionality
4. **Optimize performance** - Fine-tune caching strategies
5. **Add error boundaries** - Implement global error handling
6. **Write tests** - Add unit tests for hooks and components
