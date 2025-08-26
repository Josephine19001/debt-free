-- Database trigger to automatically create account record when user signs up
-- Run this SQL script in your Supabase SQL Editor

-- Create function to handle new user registration
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
    'free', -- subscription_plan
    NOW(), -- created_at
    NOW() -- updated_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated;

-- Also create a function to manually create account if needed (for existing users)
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
    NOW(),
    NOW()
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_missing_account(UUID) TO anon, authenticated;

