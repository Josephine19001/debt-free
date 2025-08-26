-- RevenueCat Offerings and Packages Tracking
-- Run this SQL script to add offerings tracking to your database

-- Create offerings table to cache RevenueCat offerings
CREATE TABLE IF NOT EXISTS public.revenuecat_offerings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offering_id TEXT NOT NULL UNIQUE, -- e.g., "first-pricing"
  display_name TEXT NOT NULL,
  description TEXT,
  is_current BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create packages table to store subscription packages
CREATE TABLE IF NOT EXISTS public.revenuecat_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offering_id TEXT NOT NULL REFERENCES public.revenuecat_offerings(offering_id) ON DELETE CASCADE,
  package_id TEXT NOT NULL, -- e.g., "$rc_annual", "$rc_monthly"
  package_type TEXT NOT NULL, -- "ANNUAL", "MONTHLY", "WEEKLY", etc.
  product_id TEXT NOT NULL, -- e.g., "com.beautyscan.app.yearly"
  display_name TEXT NOT NULL,
  description TEXT,
  price_string TEXT, -- "$9.99"
  price_amount_micros BIGINT, -- Price in micros for calculations
  currency_code TEXT, -- "USD"
  billing_period TEXT, -- "P1Y" for yearly, "P1M" for monthly
  intro_price JSONB, -- Introductory pricing details
  is_available BOOLEAN DEFAULT true,
  store_product_data JSONB DEFAULT '{}', -- Full store product data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(offering_id, package_id)
);

-- Create entitlements table to track what users get with each package
CREATE TABLE IF NOT EXISTS public.revenuecat_entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entitlement_id TEXT NOT NULL UNIQUE, -- e.g., "pro"
  display_name TEXT NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]', -- Array of feature names
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for package-entitlement relationships
CREATE TABLE IF NOT EXISTS public.package_entitlements (
  package_id UUID REFERENCES public.revenuecat_packages(id) ON DELETE CASCADE,
  entitlement_id UUID REFERENCES public.revenuecat_entitlements(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (package_id, entitlement_id)
);

-- Add RLS policies
ALTER TABLE public.revenuecat_offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenuecat_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenuecat_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_entitlements ENABLE ROW LEVEL SECURITY;

-- Read-only access for all authenticated users
CREATE POLICY "Users can view offerings" ON public.revenuecat_offerings
    FOR SELECT USING (true);

CREATE POLICY "Users can view packages" ON public.revenuecat_packages
    FOR SELECT USING (true);

CREATE POLICY "Users can view entitlements" ON public.revenuecat_entitlements
    FOR SELECT USING (true);

CREATE POLICY "Users can view package entitlements" ON public.package_entitlements
    FOR SELECT USING (true);

-- Service role can manage all data
CREATE POLICY "Service role can manage offerings" ON public.revenuecat_offerings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage packages" ON public.revenuecat_packages
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage entitlements" ON public.revenuecat_entitlements
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage package entitlements" ON public.package_entitlements
    FOR ALL USING (auth.role() = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_revenuecat_offerings_current ON public.revenuecat_offerings(is_current);
CREATE INDEX IF NOT EXISTS idx_revenuecat_packages_offering ON public.revenuecat_packages(offering_id);
CREATE INDEX IF NOT EXISTS idx_revenuecat_packages_product ON public.revenuecat_packages(product_id);
CREATE INDEX IF NOT EXISTS idx_revenuecat_packages_type ON public.revenuecat_packages(package_type);

-- Create updated_at triggers
CREATE TRIGGER handle_revenuecat_offerings_updated_at
    BEFORE UPDATE ON public.revenuecat_offerings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_revenuecat_packages_updated_at
    BEFORE UPDATE ON public.revenuecat_packages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_revenuecat_entitlements_updated_at
    BEFORE UPDATE ON public.revenuecat_entitlements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert your current offerings data based on the screenshots
INSERT INTO public.revenuecat_offerings (offering_id, display_name, description, is_current) VALUES
  ('first-pricing', 'The standard set', 'Main pricing offering', true)
ON CONFLICT (offering_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_current = EXCLUDED.is_current,
  last_synced_at = NOW();

-- Insert your entitlement
INSERT INTO public.revenuecat_entitlements (entitlement_id, display_name, description, features) VALUES
  ('pro', 'Pro Access', 'Pro access to all features', '["unlimited_scans", "unlimited_saves", "premium_features", "priority_support"]'::jsonb)
ON CONFLICT (entitlement_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  features = EXCLUDED.features;

-- Insert your packages
INSERT INTO public.revenuecat_packages (offering_id, package_id, package_type, product_id, display_name, description) VALUES
  ('first-pricing', '$rc_annual', 'ANNUAL', 'com.beautyscan.app.yearly', 'Annual Subscription', 'BeautyScan Yearly Premium'),
  ('first-pricing', '$rc_monthly', 'MONTHLY', 'com.beautyscan.app.monthly', 'Monthly Subscription', 'BeautyScan Monthly Premium')
ON CONFLICT (offering_id, package_id) DO UPDATE SET
  package_type = EXCLUDED.package_type,
  product_id = EXCLUDED.product_id,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- Link packages to entitlements
INSERT INTO public.package_entitlements (package_id, entitlement_id)
SELECT p.id, e.id
FROM public.revenuecat_packages p, public.revenuecat_entitlements e
WHERE p.product_id IN ('com.beautyscan.app.yearly', 'com.beautyscan.app.monthly')
  AND e.entitlement_id = 'pro'
ON CONFLICT (package_id, entitlement_id) DO NOTHING;

-- Function to get current offerings with packages
CREATE OR REPLACE FUNCTION get_current_offerings()
RETURNS TABLE (
    offering_id TEXT,
    offering_display_name TEXT,
    offering_description TEXT,
    package_id TEXT,
    package_type TEXT,
    product_id TEXT,
    package_display_name TEXT,
    package_description TEXT,
    price_string TEXT,
    price_amount_micros BIGINT,
    currency_code TEXT,
    billing_period TEXT,
    entitlement_ids TEXT[]
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        o.offering_id,
        o.display_name as offering_display_name,
        o.description as offering_description,
        p.package_id,
        p.package_type,
        p.product_id,
        p.display_name as package_display_name,
        p.description as package_description,
        p.price_string,
        p.price_amount_micros,
        p.currency_code,
        p.billing_period,
        ARRAY_AGG(e.entitlement_id) as entitlement_ids
    FROM public.revenuecat_offerings o
    JOIN public.revenuecat_packages p ON o.offering_id = p.offering_id
    LEFT JOIN public.package_entitlements pe ON p.id = pe.package_id
    LEFT JOIN public.revenuecat_entitlements e ON pe.entitlement_id = e.id
    WHERE o.is_current = true AND p.is_available = true
    GROUP BY o.offering_id, o.display_name, o.description, p.package_id, p.package_type, 
             p.product_id, p.display_name, p.description, p.price_string, 
             p.price_amount_micros, p.currency_code, p.billing_period
    ORDER BY p.package_type;
$$;

-- Function to sync offerings from RevenueCat (for use with service calls)
CREATE OR REPLACE FUNCTION sync_revenuecat_offerings(offerings_data JSONB)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function would be called from your app when fetching fresh offerings
    -- It updates the local cache with the latest data from RevenueCat
    
    -- Clear current flag from all offerings
    UPDATE public.revenuecat_offerings SET is_current = false;
    
    -- Update or insert offerings from the provided data
    -- (Implementation would depend on the exact structure of your offerings data)
    
    RETURN true;
END;
$$;

-- Update subscription limits to use more specific plan names
UPDATE public.subscription_limits 
SET subscription_plan = 'yearly' 
WHERE subscription_plan = 'yearly';

UPDATE public.subscription_limits 
SET subscription_plan = 'monthly' 
WHERE subscription_plan = 'weekly';

-- Add monthly plan limits if not exists
INSERT INTO public.subscription_limits (subscription_plan, feature_name, limit_value, description) VALUES
  ('monthly', 'daily_scans', NULL, 'Premium users have unlimited daily scans'),
  ('monthly', 'saved_products', NULL, 'Premium users have unlimited saved products')
ON CONFLICT (subscription_plan, feature_name) DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.revenuecat_offerings TO anon, authenticated;
GRANT ALL ON public.revenuecat_packages TO anon, authenticated;
GRANT ALL ON public.revenuecat_entitlements TO anon, authenticated;
GRANT ALL ON public.package_entitlements TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_current_offerings() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION sync_revenuecat_offerings(JSONB) TO anon, authenticated;

