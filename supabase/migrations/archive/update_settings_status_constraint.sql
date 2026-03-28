-- update_settings_status_constraint.sql
-- Fixes the constraint on settings table to allow 'auto' status

DO $$ 
BEGIN
    -- Drop the check constraint if it exists. 
    -- We try a few common names found in migrations or schema files.
    ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_store_status_check;
    
    -- Add the updated constraint
    ALTER TABLE settings ADD CONSTRAINT settings_store_status_check 
    CHECK (store_status IN ('open', 'closed', 'auto'));

    RAISE NOTICE 'Constraint settings_store_status_check updated successfully to include "auto".';
END $$;
