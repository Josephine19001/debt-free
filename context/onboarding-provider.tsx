import React, { createContext, useContext, useState, type PropsWithChildren } from 'react';
import type { HairTexture, HairPorosity, HairDensity, ScalpType } from '@/lib/api/types';

interface OnboardingData {
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

  hairTexture?: HairTexture;
  hairPorosity?: HairPorosity;
  hairDensity?: HairDensity;
  scalpType?: ScalpType;
  hairLength?: 'short' | 'medium' | 'long' | 'very_long';
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

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  clearData: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<OnboardingData>({});

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const clearData = () => {
    setData({});
  };

  const value: OnboardingContextType = {
    data,
    updateData,
    clearData,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
