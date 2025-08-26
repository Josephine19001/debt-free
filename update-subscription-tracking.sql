-- Update subscription tracking in database
-- Run this SQL script in your Supabase SQL Editor

-- Add new columns to accounts table for better subscription tracking
ALTER TABLE public.accounts 
ADD COLUMN IF NOT EXISTS selected_plan TEXT DEFAULT 'free', -- 'free', 'monthly', 'yearly'
ADD COLUMN IF NOT EXISTS subscription_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS plan_changed_at TIMESTAMPTZ;

-- Update the trigger function to handle selected plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (
    user_id,
    name,
    avatar,
    onboarding_completed,
    subscription_status,
    subscription_plan,
    selected_plan,
    subscription_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        CASE 
          WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL 
               AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL 
          THEN ' ' 
          ELSE '' 
        END,
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      ),
      SPLIT_PART(NEW.email, '@', 1) -- Fallback to email username
    ),
    NULL, -- avatar
    false, -- onboarding_completed
    'inactive', -- subscription_status
    'free', -- subscription_plan (current active plan)
    COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free'), -- selected_plan (what user chose)
    false, -- subscription_active
    NOW(), -- created_at
    NOW() -- updated_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the create_missing_account function too
CREATE OR REPLACE FUNCTION public.create_missing_account(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_record auth.users%ROWTYPE;
  v_account_exists BOOLEAN;
BEGIN
  -- Check if account already exists
  SELECT EXISTS(SELECT 1 FROM public.accounts WHERE user_id = p_user_id) INTO v_account_exists;
  
  IF v_account_exists THEN
    RETURN FALSE; -- Account already exists
  END IF;
  
  -- Get user info from auth.users
  SELECT * INTO v_user_record FROM auth.users WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE; -- User doesn't exist
  END IF;
  
  -- Create account record
  INSERT INTO public.accounts (
    user_id,
    name,
    avatar,
    onboarding_completed,
    subscription_status,
    subscription_plan,
    selected_plan,
    subscription_active,
    created_at,
    updated_at
  )
  VALUES (
    v_user_record.id,
    COALESCE(
      CONCAT(
        COALESCE(v_user_record.raw_user_meta_data->>'first_name', ''),
        CASE 
          WHEN v_user_record.raw_user_meta_data->>'first_name' IS NOT NULL 
               AND v_user_record.raw_user_meta_data->>'last_name' IS NOT NULL 
          THEN ' ' 
          ELSE '' 
        END,
        COALESCE(v_user_record.raw_user_meta_data->>'last_name', '')
      ),
      SPLIT_PART(v_user_record.email, '@', 1)
    ),
    NULL,
    false,
    'inactive',
    'free',
    COALESCE(v_user_record.raw_user_meta_data->>'selected_plan', 'free'),
    false,
    NOW(),
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user's selected plan
CREATE OR REPLACE FUNCTION public.update_user_plan(
  p_user_id UUID,
  p_selected_plan TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.accounts 
  SET 
    selected_plan = p_selected_plan,
    plan_changed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update subscription status after RevenueCat webhook
CREATE OR REPLACE FUNCTION public.update_subscription_status(
  p_user_id UUID,
  p_subscription_status TEXT,
  p_subscription_plan TEXT,
  p_subscription_active BOOLEAN,
  p_subscription_expires TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.accounts 
  SET 
    subscription_status = p_subscription_status,
    subscription_plan = p_subscription_plan,
    subscription_active = p_subscription_active,
    subscription_expires = p_subscription_expires,
    subscription_started_at = CASE 
      WHEN p_subscription_active = true AND subscription_started_at IS NULL 
      THEN NOW() 
      ELSE subscription_started_at 
    END,
    subscription_cancelled_at = CASE 
      WHEN p_subscription_active = false AND subscription_active = true 
      THEN NOW() 
      ELSE subscription_cancelled_at 
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's complete subscription info
CREATE OR REPLACE FUNCTION public.get_user_subscription_info(p_user_id UUID)
RETURNS TABLE (
  selected_plan TEXT,
  subscription_plan TEXT,
  subscription_status TEXT,
  subscription_active BOOLEAN,
  subscription_expires TIMESTAMPTZ,
  subscription_started_at TIMESTAMPTZ,
  subscription_cancelled_at TIMESTAMPTZ,
  plan_changed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.selected_plan,
    a.subscription_plan,
    a.subscription_status,
    a.subscription_active,
    a.subscription_expires,
    a.subscription_started_at,
    a.subscription_cancelled_at,
    a.plan_changed_at
  FROM public.accounts a
  WHERE a.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.update_user_plan(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_subscription_status(UUID, TEXT, TEXT, BOOLEAN, TIMESTAMPTZ) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_subscription_info(UUID) TO anon, authenticated;
