-- Fix onboarding function
-- Simple version that just stores the data in accounts table

CREATE OR REPLACE FUNCTION process_onboarding_data(
  p_user_id UUID,
  p_onboarding_data JSONB
) RETURNS JSONB AS $$
DECLARE
  result JSONB := '{"success": true, "message": "Onboarding data processed successfully"}'::jsonb;
BEGIN
  -- Update or insert into accounts table
  INSERT INTO accounts (
    user_id,
    onboarding_data,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_onboarding_data,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    onboarding_data = EXCLUDED.onboarding_data,
    updated_at = NOW();

  -- Return success
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Error processing onboarding data: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION process_onboarding_data(UUID, JSONB) TO authenticated;
