// Account Types
export interface Account {
  id: string;
  name: string;
  dateOfBirth?: string | null;
  onboardingCompleted: boolean;
  subscriptionStatus?: string | null;
  subscriptionPlan?: string | null;
  subscriptionBilling?: string | null;
  subscriptionPlatform?: string | null;
  subscriptionExpiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  avatar?: string | null;
}

export interface CreateAccountData {
  id: string;
  name: string;
  dateOfBirth?: string;
  onboardingCompleted?: boolean;
}

export interface UpdateAccountData {
  name?: string;
  dateOfBirth?: string;
  onboardingCompleted?: boolean;
  avatar?: string;
}

// Subscription Types
export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'inactive' | 'canceled' | 'expired';
  platform: 'apple' | 'google';
  productId: string;
  originalTransactionId: string;
  latestTransactionId: string;
  expiresAt: string;
  autoRenewing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyReceiptData {
  platform: 'apple' | 'google';
  receiptData: string;
  productId: string;
}

// Hair Profile Types
export type HairTexture =
  | '1A'
  | '1B'
  | '1C'
  | '2A'
  | '2B'
  | '2C'
  | '3A'
  | '3B'
  | '3C'
  | '4A'
  | '4B'
  | '4C';
export type HairPorosity = 'low' | 'normal' | 'high';
export type HairDensity = 'low' | 'medium' | 'high';
export type ScalpType = 'oily' | 'normal' | 'dry' | 'sensitive';

export interface HairProfile {
  id: string;
  accountId: string;
  hairTexture: HairTexture;
  hairPorosity: HairPorosity;
  hairDensity: HairDensity;
  scalpType: ScalpType;
  hairLength: string;
  chemicallyTreated: boolean | null;
  treatmentTypes: string[] | null;
  concerns: string[] | null;
  goals: string[] | null;
  allergies: string[] | null;
  preferences: {
    frequency?: string;
    timeAvailable?: string;
    budget?: string;
    naturalOnly?: boolean;
    scented?: boolean;
  } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateHairProfileData {
  hairTexture: HairTexture;
  hairPorosity: HairPorosity;
  hairDensity: HairDensity;
  scalpType: ScalpType;
  hairLength: 'short' | 'medium' | 'long' | 'very_long';
  chemicallyTreated?: boolean;
  treatmentTypes?: ('relaxed' | 'colored' | 'permed' | 'bleached' | 'other')[];
  concerns?: (
    | 'dryness'
    | 'breakage'
    | 'frizz'
    | 'lack_of_shine'
    | 'scalp_issues'
    | 'thinning'
    | 'dandruff'
    | 'oiliness'
  )[];
  goals?: (
    | 'growth'
    | 'moisture'
    | 'definition'
    | 'volume'
    | 'strength'
    | 'shine'
    | 'manageability'
  )[];
  allergies?: string[];
  preferences?: {
    frequency?: 'daily' | '2-3_times_week' | 'weekly';
    timeAvailable?: '5_min' | '15_min' | '30_min' | '60_min';
    budget?: 'low' | 'medium' | 'high';
    naturalOnly?: boolean;
    scented?: boolean;
  };
}

export interface UpdateHairProfileData extends Partial<CreateHairProfileData> {}

// Routine Types
export interface Routine {
  id: string;
  userId: string;
  hairProfileId: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  steps: RoutineStep[];
  isActive: boolean;
  isGenerated: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineStep {
  id: string;
  order: number;
  instruction: string;
  productId?: string;
  product?: Product;
  duration?: number;
  notes?: string;
}

export interface GenerateRoutineData {
  hairProfileId: string;
  preferences?: {
    timeAvailable?: number;
    budget?: string;
    preferredBrands?: string[];
    avoidIngredients?: string[];
  };
}

export interface CreateRoutineData {
  hairProfileId: string;
  name: string;
  description: string;
  frequency: Routine['frequency'];
  steps: Omit<RoutineStep, 'id'>[];
  tags?: string[];
}

export interface UpdateRoutineData extends Partial<CreateRoutineData> {}

// Routine Tracking Types
export interface RoutineLog {
  id: string;
  routineId: string;
  userId: string;
  completedAt: string;
  duration?: number;
  notes?: string;
  photos?: string[];
  rating?: number;
  productsUsed: ProductUsage[];
  hairCondition?: {
    moisture: number;
    strength: number;
    shine: number;
    manageability: number;
  };
  createdAt: string;
}

export interface ProductUsage {
  productId: string;
  product?: Product;
  amount?: string;
  effectiveness?: number;
  notes?: string;
}

export interface LogRoutineData {
  duration?: number;
  notes?: string;
  photos?: string[];
  rating?: number;
  productsUsed: Omit<ProductUsage, 'product'>[];
  hairCondition?: RoutineLog['hairCondition'];
}

export interface RoutineAnalytics {
  totalSessions: number;
  averageRating: number;
  consistencyScore: number;
  improvementTrends: {
    moisture: number[];
    strength: number[];
    shine: number[];
    manageability: number[];
  };
  topProducts: {
    productId: string;
    product: Product;
    usageCount: number;
    averageRating: number;
  }[];
  weeklyProgress: {
    week: string;
    sessions: number;
    averageRating: number;
  }[];
}

// Product Types
export interface Product {
  id: string;
  name: string;
  brand: string;
  type: string;
  category:
    | 'shampoo'
    | 'conditioner'
    | 'oil'
    | 'cream'
    | 'serum'
    | 'moisturizer'
    | 'leave-in'
    | 'hair-mask'
    | 'hair-gel'
    | 'hair-spray'
    | 'toner'
    | 'dye';
  description?: string;
  ingredients:
    | string[]
    | Array<{
        name: string;
        purpose: string;
        effect: string;
      }>;
  suitableHairTypes: string[];
  price?: number;
  size?: string;
  barcode?: string;
  imageUrl?: string;
  isCustom: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  sulfateFree?: boolean;
  siliconeFree?: boolean;
  crueltyFree?: boolean;
  coilyHairFriendly?: boolean;
}

export interface ProductFilters {
  category?: Product['category'];
  hairType?: string;
  concerns?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  brands?: string[];
  excludeIngredients?: string[];
  limit?: number;
  offset?: number;
}

export interface SearchProductsParams extends ProductFilters {
  query?: string;
  limit?: number;
  offset?: number;
}

export interface ScanBarcodeData {
  barcode: string;
}

export interface SavedProduct {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  notes?: string;
  rating?: number;
  createdAt: string;
}

export interface SaveProductData {
  productId: string;
  notes?: string;
  rating?: number;
}

// Custom Product Types
export interface CustomProduct {
  id: string;
  accountId: string;
  baseProductId: string | null;
  name: string;
  description: string | null;
  ingredients: Array<{
    name: string;
    purpose: string;
    effect: string;
  }> | null;
}

export interface CreateCustomProductData {
  baseProductId?: string;
  name: string;
  description?: string;
  ingredients: Array<{
    name: string;
    purpose: string;
    effect: string;
  }>;
}

export interface CustomProductsResponse {
  products: CustomProduct[];
  total: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error Types
export interface ApiErrorResponse {
  error: string;
  message: string;
  code?: string;
  details?: any;
}

export interface SubscriptionResponse {
  isActive: boolean;
  plan: 'free' | 'pro';
  expiresAt?: string;
  features: {
    maxProfiles: number;
    maxRoutines: number;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
  };
}

// Onboarding Response Types
export interface OnboardingResponse {
  id: string;
  accountId: string;

  // Survey response fields (text responses)
  givingUpResponse?: string | null;
  hardestPartResponse?: string | null;
  ingredientCheckResponse?: string | null;
  productSelectionResponse?: string | null;
  porosityTestResponse?: string | null;
  hairCareFrequencyResponse?: string | null;
  moistureRetentionResponse?: string | null;
  skinSensitivityResponse?: string | null;
  chemicalProcessingResponse?: string | null;

  // Referral source
  referralSource?: string | null;

  // Timestamps
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateOnboardingResponseData {
  givingUpResponse?: string;
  hardestPartResponse?: string;
  ingredientCheckResponse?: string;
  productSelectionResponse?: string;
  porosityTestResponse?: string;
  hairCareFrequencyResponse?: string;
  moistureRetentionResponse?: string;
  skinSensitivityResponse?: string;
  chemicalProcessingResponse?: string;
  referralSource?: string;
}

export interface UpdateOnboardingResponseData {
  givingUpResponse?: string;
  hardestPartResponse?: string;
  ingredientCheckResponse?: string;
  productSelectionResponse?: string;
  porosityTestResponse?: string;
  hairCareFrequencyResponse?: string;
  moistureRetentionResponse?: string;
  skinSensitivityResponse?: string;
  chemicalProcessingResponse?: string;
  referralSource?: string;
}

// Complete Onboarding Types - Combines survey + hair profile
export interface CompleteOnboardingData {
  accountId: string;
  surveyResponses: CreateOnboardingResponseData;
  hairProfile: CreateHairProfileData;
}

export interface CompleteOnboardingResponse {
  account: Account;
  onboardingResponse: OnboardingResponse;
  hairProfile: HairProfile;
}
