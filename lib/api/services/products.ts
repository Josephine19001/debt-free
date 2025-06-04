import { apiClient } from '../client';
import type {
  Product,
  ProductFilters,
  SearchProductsParams,
  ScanBarcodeData,
  SavedProduct,
  SaveProductData,
  CreateCustomProductData,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export const productsService = {
  async getProducts(filters?: ProductFilters & { cursor?: string; limit?: number }): Promise<{
    products: Product[];
    pagination: {
      hasMore: boolean;
      nextCursor: string | null;
      prevCursor?: string | null;
      total?: number;
    };
    filters?: {
      availableBrands: string[];
      availableTypes: string[];
    };
  }> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.cursor) params.append('cursor', filters.cursor);
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.brands && filters.brands.length > 0) {
        params.append('brand', filters.brands[0]);
      }
      if (filters.category) {
        params.append('type', filters.category);
      }
      if (filters.concerns?.includes('sulfate-free')) {
        params.append('sulfateFree', 'true');
      }
      if (filters.concerns?.includes('silicone-free')) {
        params.append('siliconeFree', 'true');
      }
      if (filters.concerns?.includes('cruelty-free')) {
        params.append('crueltyFree', 'true');
      }
      if (filters.hairType === 'coily') {
        params.append('coilyHairFriendly', 'true');
      }
      if ((filters as any).search) {
        params.append('search', (filters as any).search);
      }
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    return apiClient.get(endpoint);
  },

  async getProduct(id: string): Promise<Product> {
    return apiClient.get<Product>(`/products/${id}`);
  },

  async searchProducts(params: SearchProductsParams): Promise<{
    products: (Product & { similarity: number })[];
    pagination: {
      hasMore: boolean;
      nextCursor: string | null;
    };
  }> {
    // Map frontend filters to backend VectorSearchSchema
    const requestBody = {
      vector: new Array(1536).fill(0), // Default embedding vector
      limit: params.limit || 20,
      cursor: params.offset ? String(params.offset) : undefined,
      threshold: 0.7, // Default similarity threshold
      filters: {
        brand: params.brands?.[0],
        type: params.category,
        sulfateFree: params.concerns?.includes('sulfate-free'),
        siliconeFree: params.concerns?.includes('silicone-free'),
        crueltyFree: params.concerns?.includes('cruelty-free'),
        coilyHairFriendly: params.hairType === 'coily',
      },
    };

    return apiClient.post('/products/search', requestBody);
  },

  async scanBarcode(data: ScanBarcodeData): Promise<Product> {
    // Map to backend ProductScanSchema format
    const requestBody: any = {};

    if (data.barcode) {
      requestBody.barcode = data.barcode;
    }
    if ((data as any).name) {
      requestBody.name = (data as any).name;
    }
    if ((data as any).ingredients) {
      requestBody.ingredients = (data as any).ingredients;
    }

    return apiClient.post<Product>('/products/scan', requestBody);
  },

  async getSavedProducts(): Promise<{
    products: Array<{
      id: string;
      brand: string;
      name: string;
      type: string;
      size: string | null;
      description: string | null;
    }>;
    total: number;
  }> {
    return apiClient.get<{
      products: Array<{
        id: string;
        brand: string;
        name: string;
        type: string;
        size: string | null;
        description: string | null;
      }>;
      total: number;
    }>('/products/saved/?limit=20&offset=0');
  },

  async saveProduct(data: { productId: string }): Promise<{ success: boolean }> {
    return apiClient.post('/products/saved/', { productId: data.productId });
  },

  async removeSavedProduct(data: { productId: string }): Promise<{ success: boolean }> {
    return apiClient.delete(`/products/saved/${data.productId}`);
  },

  async getCustomProducts(accountId: string): Promise<{
    products: Array<{
      id: string;
      baseProductId: string | null;
      name: string;
      description: string | null;
      ingredients: Array<{
        name: string;
        purpose: string;
        effect: string;
      }>;
    }>;
    pagination: {
      hasMore: boolean;
      nextCursor: string | null;
    };
  }> {
    return apiClient.get(`/products/custom/${accountId}`);
  },

  async createCustomProduct(data: {
    accountId: string;
    baseProductId?: string;
    name: string;
    description?: string;
    ingredients: Array<{
      name: string;
      purpose: string;
      effect: string;
    }>;
  }): Promise<{ status: string }> {
    return apiClient.post('/products/custom', data);
  },
};
