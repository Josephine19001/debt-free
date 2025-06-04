import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

// Global __DEV__ is available in React Native
declare const __DEV__: boolean;

// Product IDs - these need to match your App Store Connect and Google Play Console
export const PRODUCT_IDS = {
  MONTHLY: Platform.OS === 'ios' ? 'hair_deet_monthly' : 'hair_deet_monthly',
  YEARLY: Platform.OS === 'ios' ? 'hair_deet_yearly' : 'hair_deet_yearly',
};

export const SUBSCRIPTION_SKUS = [PRODUCT_IDS.MONTHLY, PRODUCT_IDS.YEARLY];

export interface Product {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
  localizedPrice: string;
}

export interface PurchaseResult {
  productId: string;
  transactionId: string;
  transactionReceipt: string;
  purchaseToken?: string;
  packageName?: string;
}

class IAPService {
  private initialized = false;
  private products: Product[] = [];
  private isDevelopment = __DEV__;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await RNIap.initConnection();
      this.initialized = true;
    } catch (err: any) {
      console.error('Failed to initialize IAP:', err);

      // In development, we can mock the behavior
      if (this.isDevelopment && err.code === 'E_IAP_NOT_AVAILABLE') {
        console.warn('IAP not available in development - using mock mode');
        this.initialized = true; // Allow the app to continue
        return;
      }

      throw err;
    }
  }

  async getProducts(): Promise<Product[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Return mock products in development if IAP is not available
    if (this.isDevelopment && this.products.length === 0) {
      this.products = [
        {
          productId: 'hair_deet_monthly',
          price: '4.99',
          currency: 'USD',
          title: 'Monthly Subscription',
          description: 'Monthly subscription to HairDeets AI',
          localizedPrice: '$4.99',
        },
        {
          productId: 'hair_deet_yearly',
          price: '39.99',
          currency: 'USD',
          title: 'Yearly Subscription',
          description: 'Yearly subscription to HairDeets AI',
          localizedPrice: '$39.99',
        },
      ];
      return this.products;
    }

    try {
      const subscriptions = await RNIap.getSubscriptions({ skus: SUBSCRIPTION_SKUS });

      this.products = subscriptions.map((sub: any) => ({
        productId: sub.productId,
        price: sub.price || sub.oneTimePurchaseOfferDetails?.priceAmountMicros || '0',
        currency: sub.currency || 'USD',
        title: sub.title || sub.name || sub.productId,
        description: sub.description || '',
        localizedPrice: sub.localizedPrice || sub.price || '0',
      }));

      return this.products;
    } catch (err) {
      console.error('Failed to get products:', err);

      // Return mock products in development
      if (this.isDevelopment) {
        console.warn('Using mock products due to IAP error in development');
        return this.products.length > 0
          ? this.products
          : [
              {
                productId: 'hair_deet_monthly',
                price: '4.99',
                currency: 'USD',
                title: 'Monthly Subscription',
                description: 'Monthly subscription to HairDeets AI',
                localizedPrice: '$4.99',
              },
              {
                productId: 'hair_deet_yearly',
                price: '39.99',
                currency: 'USD',
                title: 'Yearly Subscription',
                description: 'Yearly subscription to HairDeets AI',
                localizedPrice: '$39.99',
              },
            ];
      }

      throw err;
    }
  }

  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Mock purchase in development
    if (this.isDevelopment) {
      console.warn('Mock purchase in development mode');
      return {
        productId,
        transactionId: `mock_${Date.now()}`,
        transactionReceipt: `mock_receipt_${Date.now()}`,
        purchaseToken: `mock_token_${Date.now()}`,
        packageName: 'com.yourapp.hairdeets',
      };
    }

    try {
      const purchase = await RNIap.requestSubscription({
        sku: productId,
        ...(Platform.OS === 'android' && {
          subscriptionOffers: [{ sku: productId, offerToken: '' }],
        }),
      });

      if (!purchase) {
        throw new Error('Purchase failed - no purchase returned');
      }

      // Handle array or single purchase
      const purchaseData = Array.isArray(purchase) ? purchase[0] : purchase;

      return {
        productId: purchaseData.productId,
        transactionId: purchaseData.transactionId || '',
        transactionReceipt: purchaseData.transactionReceipt || '',
        purchaseToken: purchaseData.purchaseToken,
        packageName: purchaseData.packageNameAndroid,
      };
    } catch (err) {
      console.error('Failed to purchase product:', err);
      throw err;
    }
  }

  async restorePurchases(): Promise<PurchaseResult[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Mock restore in development
    if (this.isDevelopment) {
      console.warn('Mock restore in development mode');

      // Return a mock purchase to test the restore flow
      return [
        {
          productId: 'hair_deet_yearly',
          transactionId: `mock_restore_${Date.now()}`,
          transactionReceipt: `mock_restore_receipt_${Date.now()}`,
          purchaseToken: `mock_restore_token_${Date.now()}`,
          packageName: 'com.yourapp.hairdeets',
        },
      ];
    }

    try {
      const purchases = await RNIap.getAvailablePurchases();

      if (purchases.length === 0) {
        return [];
      }

      // Filter and validate purchases
      const validPurchases = purchases
        .filter((purchase) => {
          // Only include our app's subscription products
          const isOurProduct = SUBSCRIPTION_SKUS.includes(purchase.productId);

          return isOurProduct;
        })
        .map((purchase) => {
          return {
            productId: purchase.productId,
            transactionId: purchase.transactionId || '',
            transactionReceipt: purchase.transactionReceipt || '',
            purchaseToken: purchase.purchaseToken,
            packageName: purchase.packageNameAndroid,
          };
        })
        .filter((purchase) => {
          // Ensure we have required fields
          const hasReceipt = purchase.transactionReceipt || purchase.purchaseToken;
          if (!hasReceipt) {
            console.warn(`Purchase missing receipt/token: ${purchase.productId}`);
          }
          return hasReceipt;
        });

      return validPurchases;
    } catch (err: any) {
      console.error('Failed to restore purchases:', err);

      // Provide more specific error messages
      if (err.code === 'E_USER_CANCELLED') {
        throw new Error('Purchase restoration was cancelled by user');
      } else if (err.code === 'E_NETWORK_ERROR') {
        throw new Error('Network error during purchase restoration');
      } else if (err.code === 'E_SERVICE_ERROR') {
        throw new Error('App Store/Play Store service error');
      } else if (err.code === 'E_IAP_NOT_AVAILABLE') {
        throw new Error('In-app purchases not available on this device');
      } else {
        throw new Error(`Purchase restoration failed: ${err.message || 'Unknown error'}`);
      }
    }
  }

  async finishTransaction(purchase: any): Promise<void> {
    try {
      await RNIap.finishTransaction(purchase);
    } catch (err) {
      console.error('Failed to finish transaction:', err);
    }
  }

  async endConnection(): Promise<void> {
    try {
      await RNIap.endConnection();
      this.initialized = false;
    } catch (err) {
      console.error('Failed to end IAP connection:', err);
    }
  }
}

export const iapService = new IAPService();
