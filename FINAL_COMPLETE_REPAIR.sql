-- =====================================================
-- FINAL COMPLETE REPAIR (V5 + COLUNAS FALTANTES)
-- Execute este script uma única vez para resolver tudo.
-- =====================================================

-- 1. Habilitar Criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 2. Recriar Funções de Admin (Correção de provider_id e gen_salt)
CREATE OR REPLACE FUNCTION public.create_store_owner(p_email text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_encrypted_password text;
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    -- Tenta gerar o hash (bf para bcrypt)
    BEGIN
        v_encrypted_password := crypt(p_password, gen_salt('bf'));
    EXCEPTION WHEN undefined_function THEN
        v_encrypted_password := extensions.crypt(p_password, extensions.gen_salt('bf'));
    END;

    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        -- Criar novo usuário no Auth
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role, instance_id, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (gen_random_uuid(), p_email, v_encrypted_password, now(), 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', '{"provider":"email","providers":["email"]}', '{}', now(), now())
        RETURNING id INTO v_user_id;

        -- Criar Identidade (PROVIDER_ID CORRIGIDO)
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
        VALUES (v_user_id, v_user_id, format('{"sub":"%s","email":"%s"}', v_user_id, p_email)::jsonb, 'email', v_user_id::text, now(), now());
    ELSE
        -- Atualizar senha do usuário existente
        UPDATE auth.users SET encrypted_password = v_encrypted_password, updated_at = now() WHERE id = v_user_id;
    END IF;

    RETURN v_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_store_owner_password(p_user_id uuid, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_encrypted_password text;
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    BEGIN
        v_encrypted_password := crypt(p_new_password, gen_salt('bf'));
    EXCEPTION WHEN undefined_function THEN
        v_encrypted_password := extensions.crypt(p_new_password, extensions.gen_salt('bf'));
    END;

    UPDATE auth.users 
    SET encrypted_password = v_encrypted_password,
        updated_at = now()
    WHERE id = p_user_id;
END;
$$;

-- 3. Adicionar Colunas store_id onde faltam
DO $$
BEGIN
    -- Suppliers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'store_id') THEN
        ALTER TABLE suppliers ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
    END IF;

    -- Stock Items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_items' AND column_name = 'store_id') THEN
        ALTER TABLE stock_items ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
    END IF;

    -- Purchases
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'store_id') THEN
        ALTER TABLE purchases ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
    END IF;

    -- Product Group Relations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_group_relations' AND column_name = 'store_id') THEN
        ALTER TABLE product_group_relations ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
    END IF;

    -- Daily Visitors (Ajuste de PK)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'daily_visitors' AND column_name = 'store_id') THEN
        ALTER TABLE daily_visitors DROP CONSTRAINT IF EXISTS daily_visitors_pkey;
        ALTER TABLE daily_visitors ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
        ALTER TABLE daily_visitors ADD PRIMARY KEY (date, store_id);
    END IF;
END $$;

-- 4. Limpar e Recriar RLS (V5 - Ultra Robusta)
DO $$
DECLARE
    superadmin_emails TEXT[] := ARRAY[
        'parauapebasdeliveryoficial@gmail.com',
        'nildopereira60@gmail.com',
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
    ];
    tbl RECORD;
    pol RECORD;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['stores', 'settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'orders', 'coupons', 'daily_visitors', 'suppliers', 'purchases', 'stock_items']) AS tablename LOOP
        -- Remover todas as tentativas anteriores para limpar o terreno
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl.tablename);
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl.tablename LOOP
             EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl.tablename);
        END LOOP;
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);

        -- Política MASTER ADMIN (Full Access)
        EXECUTE format('
            CREATE POLICY "Platform_Master_Admin" ON %I
            FOR ALL
            TO authenticated
            USING ((auth.jwt() ->> ''email'') = ANY(%L))
            WITH CHECK ((auth.jwt() ->> ''email'') = ANY(%L))
        ', tbl.tablename, superadmin_emails, superadmin_emails);
    END LOOP;

    -- Política de DONO - TABELA STORES
    CREATE POLICY "Store_Owner_Access" ON stores
    FOR ALL
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

    -- Política de DONO - OUTRAS TABELAS
    FOR tbl IN SELECT unnest(ARRAY['settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'orders', 'coupons', 'daily_visitors', 'suppliers', 'purchases', 'stock_items']) AS tablename LOOP
        EXECUTE format('
            CREATE POLICY "Store_Owner_Record_Access" ON %I
            FOR ALL
            TO authenticated
            USING (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND s.owner_id = auth.uid()))
            WITH CHECK (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND s.owner_id = auth.uid()))
        ', tbl.tablename);
    END LOOP;

    -- Política PÚBLICA (Read only para anon)
    FOR tbl IN SELECT unnest(ARRAY['stores', 'settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'coupons']) AS tablename LOOP
        EXECUTE format('
            CREATE POLICY "Anonymous_Public_Read" ON %I
            FOR SELECT
            TO anon, authenticated
            USING (true)
        ', tbl.tablename);
    END LOOP;

END $$;
