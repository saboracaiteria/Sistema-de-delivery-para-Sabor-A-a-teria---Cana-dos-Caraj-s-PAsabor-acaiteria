-- =====================================================
-- ADD OWNER_EMAIL TO STORES TABLE
-- Allows slug-based login and mapping without Supabase Auth Admin access on client
-- =====================================================

DO $$
BEGIN
    -- 1. Add owner_email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'owner_email') THEN
        ALTER TABLE stores ADD COLUMN owner_email TEXT;
        RAISE NOTICE '✅ Coluna owner_email adicionada à tabela stores.';
    END IF;

    -- 2. Populate owner_email for existing stores from auth.users (if linked)
    UPDATE stores s
    SET owner_email = u.email
    FROM auth.users u
    WHERE s.owner_id = u.id
    AND s.owner_email IS NULL;

    -- 3. For stores without auth.users link (orphan stores), use slug@internal.com as fallback
    UPDATE stores
    SET owner_email = slug || '@internal.com'
    WHERE owner_email IS NULL;

    RAISE NOTICE '✅ E-mails de proprietários sincronizados.';
END $$;
