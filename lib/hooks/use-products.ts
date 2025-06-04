import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  UseQueryOptions,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner-native';
import {
  api,
  type Product,
  type ProductFilters,
  type SearchProductsParams,
  type ScanBarcodeData,
  type SavedProduct,
  type SaveProductData,
  type CreateCustomProductData,
} from '../api';
import { queryKeys } from './query-keys';
import { handleError } from './utils';
import { useAuth } from '../../context/auth-provider';

export function useProductsList(
  filters?: ProductFilters,
  options?: Omit<
    UseQueryOptions<Product[], Error, Product[], readonly unknown[]>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.products.lists(filters),
    queryFn: async (): Promise<Product[]> => {
      const response = await api.products.getProducts(filters);
      return response.products || [];
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useProducts(
  filters?: Omit<ProductFilters, 'limit' | 'offset'> & { search?: string },
  options?: Partial<
    UseInfiniteQueryOptions<
      {
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
      },
      Error
    >
  >
) {
  const ITEMS_PER_PAGE = 20;

  return useInfiniteQuery({
    queryKey: queryKeys.products.lists(filters),
    queryFn: async ({
      pageParam,
    }): Promise<{
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
    }> => {
      const requestFilters = {
        ...filters,
        cursor: pageParam as string | undefined,
        limit: ITEMS_PER_PAGE,
      };

      return await api.products.getProducts(requestFilters);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useSearchProducts(
  params: SearchProductsParams,
  options?: Omit<
    UseQueryOptions<Product[], Error, Product[], readonly unknown[]>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: queryKeys.products.search(params),
    queryFn: async () => {
      const response = await api.products.searchProducts(params);
      return response.products;
    },
    enabled: !!params.query || Object.keys(params).length > 1,
    ...options,
  });
}

export function useScanBarcode() {
  return useMutation({
    mutationFn: async (data: ScanBarcodeData) => {
      return await api.products.scanBarcode(data);
    },
    onSuccess: () => {
      toast.success('Product found!');
    },
    onError: (error) => handleError(error, 'Product not found'),
  });
}

export function useSavedProducts(
  options?: Omit<
    UseQueryOptions<SavedProduct[], Error, SavedProduct[], readonly unknown[]>,
    'queryKey' | 'queryFn'
  >
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.products.saved(),
    queryFn: async (): Promise<SavedProduct[]> => {
      if (!user?.id) {
        return [];
      }

      const response = await api.products.getSavedProducts();

      return response.products.map((product) => ({
        id: product.id,
        userId: user.id,
        productId: product.id,
        product: {
          id: product.id,
          brand: product.brand,
          name: product.name,
          type: product.type,
          category: 'cream',
          size: product.size || '',
          description: product.description || '',
          price: 0,
          barcode: '',
          imageUrl: '',
          ingredients: [],
          suitableHairTypes: [],
          sulfateFree: false,
          siliconeFree: false,
          crueltyFree: false,
          coilyHairFriendly: false,
          isCustom: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
      }));
    },
    enabled: !!user?.id,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useSaveProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: SaveProductData) => {
      if (!user?.id) throw new Error('User not authenticated');
      return await api.products.saveProduct({ productId: data.productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.saved() });
    },
    onError: (error) => handleError(error, 'Failed to save product'),
  });
}

export function useRemoveSavedProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (productId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      return api.products.removeSavedProduct({ productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.saved() });
    },
    onError: (error) => handleError(error, 'Failed to remove product'),
  });
}

export function useCustomProducts(
  options?: Omit<
    UseQueryOptions<Product[], Error, Product[], readonly unknown[]>,
    'queryKey' | 'queryFn'
  >
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.products.custom(),
    queryFn: async (): Promise<Product[]> => {
      if (!user?.id) {
        return [];
      }
      const response = await api.products.getCustomProducts(user.id);
      return response.products.map((customProduct) => ({
        id: customProduct.id,
        name: customProduct.name,
        brand: 'Custom',
        type: 'Custom Product',
        description: customProduct.description || '',
        ingredients: customProduct.ingredients?.map((ing: any) => ing.name) || [],
        suitableHairTypes: [],
        price: 0,
        size: '',
        barcode: '',
        imageUrl: '',
        category: 'cream' as Product['category'],
        isCustom: true,
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    },
    enabled: !!user?.id,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCreateCustomProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCustomProductData) => {
      if (!user?.id) throw new Error('User not authenticated');
      const requestData = {
        accountId: user.id,
        name: data.name,
        description: data.description,
        ingredients: data.ingredients.map((ingredient) => ({
          name: ingredient,
          purpose: 'Unknown',
          effect: 'Unknown',
        })),
      };
      return await api.products.createCustomProduct(requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.custom() });
      toast.success('Custom product created successfully');
    },
    onError: (error) => handleError(error, 'Failed to create custom product'),
  });
}
