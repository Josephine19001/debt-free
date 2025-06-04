import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { iapService, Product, PurchaseResult } from '../lib/services/iap-service';
import { useAuth } from './auth-provider';
import { apiClient, type SubscriptionResponse } from '../lib/api';
import { Platform } from 'react-native';

// Global __DEV__ is available in React Native
declare const __DEV__: boolean;

interface SubscriptionState {
  isSubscribed: boolean;
  subscriptionType: 'free' | 'monthly' | 'yearly';
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface SubscriptionContextValue extends SubscriptionState {
  purchaseSubscription: (productId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  initializeIAP: () => Promise<void>;
  // Freemium features
  getRemainingFreeScans: () => number;
  canAccessFeature: (feature: string) => boolean;
  incrementFreeUsage: (feature: string) => void;
}

interface SubscriptionProviderProps {
  children: ReactNode;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    isSubscribed: false,
    subscriptionType: 'free',
    products: [],
    loading: false,
    error: null,
  });

  // Free tier limits
  const [freeUsage, setFreeUsage] = useState({
    scans: 0,
    routines: 0,
    profiles: 0,
  });

  const FREE_LIMITS = {
    scans: 5, // 5 free scans per month
    routines: 2, // 2 free routine generations
    profiles: 1, // 1 free profile
  };

  useEffect(() => {
    if (user) {
      initializeIAP();
      loadSubscriptionStatus();
      loadFreeUsage();
    }
  }, [user]);

  const initializeIAP = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await iapService.initialize();
      const products = await iapService.getProducts();
      setState((prev) => ({ ...prev, products, loading: false }));
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load subscription options',
      }));
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const response = await apiClient.get<SubscriptionResponse>('/accounts/subscription');
      setState((prev) => ({
        ...prev,
        isSubscribed: response.isActive || false,
        subscriptionType: response.plan === 'pro' ? 'yearly' : 'free',
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSubscribed: false,
        subscriptionType: 'free',
      }));
    }
  };

  const loadFreeUsage = async () => {
    try {
      const storedUsage = await AsyncStorage.getItem('free_usage');
      if (storedUsage) {
        setFreeUsage(JSON.parse(storedUsage));
      } else {
        const defaultUsage = {
          scans: 0,
          routines: 0,
          profiles: 0,
        };
        setFreeUsage(defaultUsage);
        await AsyncStorage.setItem('free_usage', JSON.stringify(defaultUsage));
      }
    } catch (error) {
      console.error('Failed to load free usage:', error);
      setFreeUsage({
        scans: 0,
        routines: 0,
        profiles: 0,
      });
    }
  };

  const purchaseSubscription = async (productId: string) => {
    if (!user) {
      console.error('Cannot purchase subscription: user not authenticated');
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const purchaseResult = await iapService.purchaseProduct(productId);

      await verifyPurchaseWithBackend(purchaseResult);

      const subscriptionType = productId.includes('yearly') ? 'yearly' : 'monthly';
      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        subscriptionType,
        loading: false,
      }));

      Alert.alert('Success', 'Subscription activated successfully!');
    } catch (error) {
      console.error('Purchase failed:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Purchase failed. Please try again.',
      }));

      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    }
  };

  const restorePurchases = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to restore your purchases.');
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // First, try to get available purchases
      const purchases = await iapService.restorePurchases();

      if (purchases.length > 0) {
        // Find the most recent active subscription
        const activePurchase =
          purchases.find(
            (p) => p.productId === 'hair_deet_yearly' || p.productId === 'hair_deet_monthly'
          ) || purchases[0];

        // Verify with backend
        await verifyPurchaseWithBackend(activePurchase);

        // Update local state
        const subscriptionType = activePurchase.productId.includes('yearly') ? 'yearly' : 'monthly';
        setState((prev) => ({
          ...prev,
          isSubscribed: true,
          subscriptionType,
          loading: false,
        }));

        // Also update the auth provider's subscription status
        try {
          await loadSubscriptionStatus();
        } catch (error) {
          console.warn('Failed to reload subscription status:', error);
        }

        Alert.alert('Success!', 'Your subscription has been restored successfully.');
      } else {
        setState((prev) => ({ ...prev, loading: false }));
        Alert.alert(
          'No Purchases Found',
          "We couldn't find any previous purchases associated with this Apple/Google account. If you purchased using a different account, please sign in with that account and try again."
        );
      }
    } catch (error: any) {
      console.error('Restore failed:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to restore purchases',
      }));

      // More detailed error messages
      let errorMessage = 'Could not restore purchases. Please try again.';

      if (error.message?.includes('network') || error.message?.includes('connection')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('verification failed')) {
        errorMessage = 'Purchase verification failed. Please contact support if this persists.';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'No valid purchases found for this account.';
      }

      Alert.alert('Restore Failed', errorMessage);
    }
  };

  const verifyPurchaseWithBackend = async (purchase: PurchaseResult) => {
    try {
      // Skip verification for mock purchases in development
      if (__DEV__ && purchase.transactionId.startsWith('mock_')) {
        console.warn('Skipping backend verification for mock purchase in development');
        return;
      }

      await apiClient.post('/accounts/subscription/verify', {
        receipt: purchase.transactionReceipt,
        productId: purchase.productId,
        platform: Platform.OS,
        transactionId: purchase.transactionId,
      });
    } catch (error) {
      console.error('Failed to verify purchase with backend:', error);
      throw new Error('Purchase verification failed');
    }
  };

  // Freemium feature management
  const getRemainingFreeScans = () => {
    if (state.isSubscribed) return -1; // Unlimited
    return Math.max(0, FREE_LIMITS.scans - freeUsage.scans);
  };

  const canAccessFeature = (feature: string) => {
    if (state.isSubscribed) return true;

    switch (feature) {
      case 'product_scan':
        return freeUsage.scans < FREE_LIMITS.scans;
      case 'routine_generation':
        return freeUsage.routines < FREE_LIMITS.routines;
      case 'multiple_profiles':
        return freeUsage.profiles < FREE_LIMITS.profiles;
      case 'detailed_analysis':
      case 'expert_recommendations':
      case 'custom_routines':
        return false; // Pro only features
      default:
        return true; // Basic features are always free
    }
  };

  const incrementFreeUsage = async (feature: string) => {
    if (state.isSubscribed) return; // No limits for subscribers

    setFreeUsage((prev) => {
      const updated = { ...prev };
      switch (feature) {
        case 'product_scan':
          updated.scans = Math.min(prev.scans + 1, FREE_LIMITS.scans);
          break;
        case 'routine_generation':
          updated.routines = Math.min(prev.routines + 1, FREE_LIMITS.routines);
          break;
        case 'multiple_profiles':
          updated.profiles = Math.min(prev.profiles + 1, FREE_LIMITS.profiles);
          break;
      }

      // Persist to AsyncStorage
      AsyncStorage.setItem('free_usage', JSON.stringify(updated)).catch((error) => {
        console.error('Failed to persist free usage:', error);
      });

      return updated;
    });
  };

  const value: SubscriptionContextValue = {
    ...state,
    purchaseSubscription,
    restorePurchases,
    initializeIAP,
    getRemainingFreeScans,
    canAccessFeature,
    incrementFreeUsage,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
