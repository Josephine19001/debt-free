-- RevenueCat Subscription Tracking Enhancement
-- Run this SQL script to add proper subscription tracking and webhook support

-- Create subscription events table to track RevenueCat webhooks
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  revenuecat_user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'INITIAL_PURCHASE', 'RENEWAL', 'CANCELLATION', 'BILLING_ISSUE', etc.
  product_id TEXT NOT NULL,
  entitlement_id TEXT,
  period_type TEXT, -- 'normal', 'trial', 'intro'
  purchased_at TIMESTAMPTZ,
  expiration_date TIMESTAMPTZ,
  is_trial_conversion BOOLEAN DEFAULT false,
  price_in_purchased_currency DECIMAL(10,2),
  currency TEXT,
  store TEXT, -- 'APP_STORE', 'PLAY_STORE'
  environment TEXT, -- 'SANDBOX', 'PRODUCTION'
  webhook_payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription limits table for feature gating
CREATE TABLE IF NOT EXISTS public.subscription_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_plan TEXT NOT NULL, -- 'free', 'weekly', 'yearly'
  feature_name TEXT NOT NULL, -- 'daily_scans', 'saved_products', 'premium_features'
  limit_value INTEGER, -- NULL means unlimited
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_plan, feature_name)
);

-- Create user daily usage tracking table
CREATE TABLE IF NOT EXISTS public.user_daily_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  scans_used INTEGER DEFAULT 0,
  last_scan_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- Add RLS policies for subscription events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription events" ON public.subscription_events
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert subscription events (for webhooks)
CREATE POLICY "Service role can manage subscription events" ON public.subscription_events
    FOR ALL USING (auth.role() = 'service_role');

-- Add RLS policies for subscription limits (read-only for users)
ALTER TABLE public.subscription_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subscription limits" ON public.subscription_limits
    FOR SELECT USING (true);

-- Service role can manage subscription limits
CREATE POLICY "Service role can manage subscription limits" ON public.subscription_limits
    FOR ALL USING (auth.role() = 'service_role');

-- Add RLS policies for user daily usage
ALTER TABLE public.user_daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" ON public.user_daily_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON public.user_daily_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON public.user_daily_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_revenuecat_user_id ON public.subscription_events(revenuecat_user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_event_type ON public.subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_expiration_date ON public.subscription_events(expiration_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_usage_user_date ON public.user_daily_usage(user_id, usage_date);

-- Create trigger for user_daily_usage updated_at
CREATE TRIGGER handle_user_daily_usage_updated_at
    BEFORE UPDATE ON public.user_daily_usage
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default subscription limits
INSERT INTO public.subscription_limits (subscription_plan, feature_name, limit_value, description) VALUES
  ('free', 'daily_scans', 3, 'Free users can scan 3 products per day'),
  ('free', 'saved_products', 50, 'Free users can save up to 50 products'),
  ('weekly', 'daily_scans', NULL, 'Premium users have unlimited daily scans'),
  ('weekly', 'saved_products', NULL, 'Premium users have unlimited saved products'),
  ('yearly', 'daily_scans', NULL, 'Premium users have unlimited daily scans'),
  ('yearly', 'saved_products', NULL, 'Premium users have unlimited saved products')
ON CONFLICT (subscription_plan, feature_name) DO NOTHING;

-- Add RevenueCat specific fields to accounts table (if not already present)
DO $$
BEGIN
    -- Add revenuecat_user_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='accounts' AND column_name='revenuecat_user_id') THEN
        ALTER TABLE public.accounts ADD COLUMN revenuecat_user_id TEXT;
    END IF;
    
    -- Add subscription_environment if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='accounts' AND column_name='subscription_environment') THEN
        ALTER TABLE public.accounts ADD COLUMN subscription_environment TEXT DEFAULT 'PRODUCTION';
    END IF;
    
    -- Add is_trial_eligible if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='accounts' AND column_name='is_trial_eligible') THEN
        ALTER TABLE public.accounts ADD COLUMN is_trial_eligible BOOLEAN DEFAULT true;
    END IF;
    
    -- Add last_subscription_event_at if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='accounts' AND column_name='last_subscription_event_at') THEN
        ALTER TABLE public.accounts ADD COLUMN last_subscription_event_at TIMESTAMPTZ;
    END IF;
END
$$;

-- Create function to get user's current subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(p_user_id UUID)
RETURNS TABLE (
    is_subscribed BOOLEAN,
    subscription_plan TEXT,
    is_in_trial BOOLEAN,
    trial_ends_at TIMESTAMPTZ,
    subscription_expires_at TIMESTAMPTZ,
    daily_scan_limit INTEGER,
    scans_used_today INTEGER,
    scans_remaining INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_account RECORD;
    v_usage RECORD;
    v_limit INTEGER;
BEGIN
    -- Get account information
    SELECT * INTO v_account FROM public.accounts WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'free'::TEXT, false, NULL::TIMESTAMPTZ, NULL::TIMESTAMPTZ, 3, 0, 3;
        RETURN;
    END IF;
    
    -- Get today's usage
    SELECT * INTO v_usage FROM public.user_daily_usage 
    WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
    
    -- Get daily scan limit based on subscription
    SELECT limit_value INTO v_limit FROM public.subscription_limits 
    WHERE subscription_plan = COALESCE(v_account.subscription_plan, 'free') 
    AND feature_name = 'daily_scans';
    
    -- Calculate remaining scans
    DECLARE
        v_scans_used INTEGER := COALESCE(v_usage.scans_used, 0);
        v_scans_remaining INTEGER;
    BEGIN
        IF v_limit IS NULL THEN
            v_scans_remaining := 999999; -- Unlimited
        ELSE
            v_scans_remaining := GREATEST(0, v_limit - v_scans_used);
        END IF;
        
        RETURN QUERY SELECT 
            COALESCE(v_account.subscription_status = 'active', false),
            COALESCE(v_account.subscription_plan, 'free'),
            COALESCE(v_account.subscription_status = 'active' AND v_account.subscription_expires > NOW(), false),
            v_account.subscription_expires,
            v_account.subscription_expires,
            COALESCE(v_limit, 3),
            v_scans_used,
            v_scans_remaining;
    END;
END;
$$;

-- Create function to increment daily scan usage
CREATE OR REPLACE FUNCTION increment_daily_scan_usage(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_count INTEGER;
BEGIN
    INSERT INTO public.user_daily_usage (user_id, usage_date, scans_used, last_scan_at)
    VALUES (p_user_id, CURRENT_DATE, 1, NOW())
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET 
        scans_used = user_daily_usage.scans_used + 1,
        last_scan_at = NOW(),
        updated_at = NOW()
    RETURNING scans_used INTO v_new_count;
    
    RETURN v_new_count;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.subscription_events TO anon, authenticated;
GRANT ALL ON public.subscription_limits TO anon, authenticated;
GRANT ALL ON public.user_daily_usage TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_daily_scan_usage(UUID) TO anon, authenticated;
