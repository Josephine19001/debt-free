-- Cascading Delete Enhancement Script
-- This script ensures all tables have proper cascading delete relationships

-- Note: Most cascading deletes are already properly configured in your database!
-- This script serves as a verification and adds any missing cascading relationships.

-- Verify and add any missing cascading delete relationships
-- (These should already exist based on your current schema)

-- Double-check accounts table foreign key
DO $$
BEGIN
    -- Check if the foreign key exists with CASCADE
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
        WHERE tc.table_name = 'accounts' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND rc.delete_rule = 'CASCADE'
    ) THEN
        -- If no cascading foreign key exists, add it
        ALTER TABLE public.accounts 
        DROP CONSTRAINT IF EXISTS accounts_user_id_fkey;
        
        ALTER TABLE public.accounts 
        ADD CONSTRAINT accounts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Double-check scanned_products table foreign key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
        WHERE tc.table_name = 'scanned_products' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND rc.delete_rule = 'CASCADE'
    ) THEN
        ALTER TABLE public.scanned_products 
        DROP CONSTRAINT IF EXISTS scanned_products_user_id_fkey;
        
        ALTER TABLE public.scanned_products 
        ADD CONSTRAINT scanned_products_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Verify subscription_events table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_events') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
            WHERE tc.table_name = 'subscription_events' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND rc.delete_rule = 'CASCADE'
        ) THEN
            ALTER TABLE public.subscription_events 
            DROP CONSTRAINT IF EXISTS subscription_events_user_id_fkey;
            
            ALTER TABLE public.subscription_events 
            ADD CONSTRAINT subscription_events_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Verify user_daily_usage table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_daily_usage') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
            WHERE tc.table_name = 'user_daily_usage' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND rc.delete_rule = 'CASCADE'
        ) THEN
            ALTER TABLE public.user_daily_usage 
            DROP CONSTRAINT IF EXISTS user_daily_usage_user_id_fkey;
            
            ALTER TABLE public.user_daily_usage 
            ADD CONSTRAINT user_daily_usage_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Create a function to safely delete a user and all related data
CREATE OR REPLACE FUNCTION delete_user_completely(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function demonstrates what gets deleted when a user is removed
    -- Thanks to CASCADE, we just need to delete from auth.users and everything else follows
    
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RETURN false; -- User doesn't exist
    END IF;
    
    -- Delete user from auth.users - this will cascade to all other tables
    DELETE FROM auth.users WHERE id = p_user_id;
    
    RETURN true;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION delete_user_completely(UUID) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION delete_user_completely(UUID) IS 
'Safely deletes a user and all related data through cascading foreign keys. This includes: accounts, scanned_products, subscription_events, user_daily_usage, and any other user-related data.';

-- Show what tables will be affected by user deletion
SELECT 
    tc.table_name,
    tc.constraint_name,
    rc.delete_rule,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND kcu.referenced_table_name = 'users'
    AND kcu.referenced_table_schema = 'auth'
    AND rc.delete_rule = 'CASCADE'
ORDER BY tc.table_name;

