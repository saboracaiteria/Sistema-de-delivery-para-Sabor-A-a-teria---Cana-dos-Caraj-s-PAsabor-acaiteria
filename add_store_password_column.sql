-- Migration: Add password column to stores table
-- This password will be used for the Sidebar "Acesso Restrito" check.

-- 1. Add column
ALTER TABLE stores ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Update existing stores with a default password if they don't have one
-- We use '1245' as it was the previous hardcoded default for admin.
UPDATE stores SET password = '1245' WHERE password IS NULL;

-- 3. Make it NOT NULL for future inserts (optional, but good for consistency)
ALTER TABLE stores ALTER COLUMN password SET NOT NULL;

-- 4. Ensure RLS allows reading this column for the store check
-- Usually stores are public read, but specifically checking RLS for the 'password' column.
-- If we want to keep it somewhat hidden, we could be more specific, 
-- but since it's an "Access Code" for a public-ish side, public read is consistent with current stores RLS.

SELECT 'Migration complete: password column added to stores table.' as result;
