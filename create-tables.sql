-- BeautyScan Database Setup Script
-- Run this SQL script in your Supabase SQL Editor to create all required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_plan TEXT,
  subscription_platform TEXT,
  subscription_expires TIMESTAMPTZ,
  subscription_billing_frequency TEXT,
  subscription_receipt_id TEXT,
  subscription_original_purchase TIMESTAMPTZ,
  subscription_product TEXT,
  subscription_last_verified_at TIMESTAMPTZ,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scanned_products table
CREATE TABLE IF NOT EXISTS public.scanned_products (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  safety_score INTEGER CHECK (safety_score >= 1 AND safety_score <= 10),
  image_url TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  key_ingredients JSONB DEFAULT '[]'::jsonb,
  product_links JSONB DEFAULT '[]'::jsonb,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_scanned_products_updated_at
    BEFORE UPDATE ON public.scanned_products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_scanned_products_user_id ON public.scanned_products(user_id);
CREATE INDEX IF NOT EXISTS idx_scanned_products_scanned_at ON public.scanned_products(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_scanned_products_is_favorite ON public.scanned_products(is_favorite);
CREATE INDEX IF NOT EXISTS idx_scanned_products_category ON public.scanned_products(category);
CREATE INDEX IF NOT EXISTS idx_scanned_products_safety_score ON public.scanned_products(safety_score);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_products ENABLE ROW LEVEL SECURITY;

-- Accounts policies
CREATE POLICY "Users can view their own account" ON public.accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own account" ON public.accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own account" ON public.accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own account" ON public.accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Scanned products policies
CREATE POLICY "Users can view their own scanned products" ON public.scanned_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scanned products" ON public.scanned_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scanned products" ON public.scanned_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scanned products" ON public.scanned_products
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('account-avatars', 'account-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Users can update their product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for account avatars
CREATE POLICY "Users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'account-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'account-avatars');

CREATE POLICY "Users can update their avatars" ON storage.objects
FOR UPDATE USING (bucket_id = 'account-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their avatars" ON storage.objects
FOR DELETE USING (bucket_id = 'account-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.accounts TO anon, authenticated;
GRANT ALL ON public.scanned_products TO anon, authenticated;

-- Sample data comment (optional - you can run this separately)
-- To populate with sample data, run: scripts/populate_supabase.sql
-- Make sure to update the project URL in that file first
