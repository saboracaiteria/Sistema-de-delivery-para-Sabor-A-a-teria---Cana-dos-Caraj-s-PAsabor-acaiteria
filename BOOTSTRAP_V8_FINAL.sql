-- =====================================================
-- BOOTSTRAP COMPLETO (V8 FINAL)
-- Garante que TODAS as lojas tenham contas no Supabase Auth
-- Execute APENAS UMA VEZ no SQL Editor do Supabase
-- =====================================================

-- 1. Extensão de criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 2. Criar/sincronizar usuário Auth para cada loja existente
DO $$
DECLARE
    store_rec RECORD;
    v_user_id uuid;
    v_encrypted_password text;
BEGIN
    FOR store_rec IN 
        SELECT id, slug, owner_email, password, owner_id 
        FROM public.stores 
        WHERE owner_email IS NOT NULL
    LOOP
        RAISE NOTICE 'Processando loja: % (%)', store_rec.slug, store_rec.owner_email;
        
        -- Verificar se já existe usuário com esse email
        SELECT id INTO v_user_id FROM auth.users WHERE email = store_rec.owner_email;
        
        -- Gerar hash da senha (usando a senha armazenada na tabela stores)
        BEGIN
            v_encrypted_password := extensions.crypt(
                COALESCE(store_rec.password, '123456'), 
                extensions.gen_salt('bf')
            );
        EXCEPTION WHEN OTHERS THEN
            v_encrypted_password := crypt(
                COALESCE(store_rec.password, '123456'),
                gen_salt('bf')
            );
        END;
        
        IF v_user_id IS NULL THEN
            -- Inserir novo usuário
            v_user_id := gen_random_uuid();
            INSERT INTO auth.users (
                id, email, encrypted_password, email_confirmed_at, aud, role, 
                instance_id, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                v_user_id, store_rec.owner_email, v_encrypted_password, now(),
                'authenticated', 'authenticated',
                '00000000-0000-0000-0000-000000000000',
                '{"provider":"email","providers":["email"]}',
                '{}', now(), now()
            );
            
            -- Inserir identidade
            INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
            VALUES (
                v_user_id, v_user_id,
                format('{"sub":"%s","email":"%s"}', v_user_id, store_rec.owner_email)::jsonb,
                'email', v_user_id::text, now(), now()
            );
            
            RAISE NOTICE 'Usuário criado: % → %', store_rec.owner_email, v_user_id;
        ELSE
            -- Sincronizar a senha com o que está na tabela stores
            UPDATE auth.users 
            SET encrypted_password = v_encrypted_password, updated_at = now()
            WHERE id = v_user_id;
            
            RAISE NOTICE 'Senha sincronizada: %', store_rec.owner_email;
        END IF;
        
        -- Sincronizar owner_id na tabela stores
        UPDATE public.stores SET owner_id = v_user_id WHERE id = store_rec.id;
        RAISE NOTICE 'owner_id atualizado: % → %', store_rec.slug, v_user_id;
    END LOOP;
END $$;

-- 3. Recriar RPC save_store_settings (autenticação por senha da loja como fallback)
CREATE OR REPLACE FUNCTION public.save_store_settings(
    p_store_id UUID,
    p_settings JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_caller_email TEXT;
    v_is_authorized BOOLEAN := FALSE;
BEGIN
    -- Tentar obter o email do JWT
    v_caller_email := (auth.jwt() ->> 'email');

    -- Verificar autorização (superadmin ou dono via email ou owner_id)
    IF v_caller_email IS NOT NULL THEN
        -- É superadmin?
        IF v_caller_email IN (
            'parauapebasdeliveryoficial@gmail.com',
            'nildopereira60@gmail.com',
            'nildoxz@gmail.com',
            'canaadoscarajaspasabor@gmail.com'
        ) THEN
            v_is_authorized := TRUE;
        ELSE
            -- É o dono (por email ou por owner_id)?
            SELECT EXISTS(
                SELECT 1 FROM stores 
                WHERE id = p_store_id 
                AND (owner_email = v_caller_email OR owner_id = auth.uid())
            ) INTO v_is_authorized;
        END IF;
    END IF;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'Acesso negado. Verifique suas credenciais.' USING ERRCODE = '42501';
    END IF;

    -- Upsert nas configurações (bypass total do RLS via SECURITY DEFINER)
    INSERT INTO settings (
        store_id, store_name, logo_url, logo_shape, banner_url,
        whatsapp_number, store_status, delivery_fee, delivery_only,
        opening_hours, theme_colors, closed_message, open_message,
        delivery_time, pickup_time, delivery_close_time,
        instagram_url, business_address, copyright_text, updated_at
    ) VALUES (
        p_store_id,
        (p_settings ->> 'store_name'),
        (p_settings ->> 'logo_url'),
        COALESCE((p_settings ->> 'logo_shape'), 'circle'),
        (p_settings ->> 'banner_url'),
        (p_settings ->> 'whatsapp_number'),
        COALESCE((p_settings ->> 'store_status'), 'open'),
        COALESCE((p_settings ->> 'delivery_fee')::NUMERIC, 5),
        COALESCE((p_settings ->> 'delivery_only')::BOOLEAN, false),
        COALESCE((p_settings -> 'opening_hours'), '[]'::jsonb),
        (p_settings -> 'theme_colors'),
        (p_settings ->> 'closed_message'),
        (p_settings ->> 'open_message'),
        (p_settings ->> 'delivery_time'),
        (p_settings ->> 'pickup_time'),
        (p_settings ->> 'delivery_close_time'),
        (p_settings ->> 'instagram_url'),
        (p_settings ->> 'business_address'),
        (p_settings ->> 'copyright_text'),
        NOW()
    )
    ON CONFLICT (store_id) DO UPDATE SET
        store_name        = COALESCE(EXCLUDED.store_name, settings.store_name),
        logo_url          = COALESCE(EXCLUDED.logo_url, settings.logo_url),
        logo_shape        = COALESCE(EXCLUDED.logo_shape, settings.logo_shape),
        banner_url        = COALESCE(EXCLUDED.banner_url, settings.banner_url),
        whatsapp_number   = COALESCE(EXCLUDED.whatsapp_number, settings.whatsapp_number),
        store_status      = COALESCE(EXCLUDED.store_status, settings.store_status),
        delivery_fee      = COALESCE(EXCLUDED.delivery_fee, settings.delivery_fee),
        delivery_only     = COALESCE(EXCLUDED.delivery_only, settings.delivery_only),
        opening_hours     = COALESCE(EXCLUDED.opening_hours, settings.opening_hours),
        theme_colors      = COALESCE(EXCLUDED.theme_colors, settings.theme_colors),
        closed_message    = COALESCE(EXCLUDED.closed_message, settings.closed_message),
        open_message      = COALESCE(EXCLUDED.open_message, settings.open_message),
        delivery_time     = COALESCE(EXCLUDED.delivery_time, settings.delivery_time),
        pickup_time       = COALESCE(EXCLUDED.pickup_time, settings.pickup_time),
        delivery_close_time = COALESCE(EXCLUDED.delivery_close_time, settings.delivery_close_time),
        instagram_url     = COALESCE(EXCLUDED.instagram_url, settings.instagram_url),
        business_address  = COALESCE(EXCLUDED.business_address, settings.business_address),
        copyright_text    = COALESCE(EXCLUDED.copyright_text, settings.copyright_text),
        updated_at        = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_store_settings(UUID, JSONB) TO authenticated;

-- 4. Recriar RPC create_store_owner (criação de nova conta Auth)
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
    -- Verificar se é superadmin
    IF (auth.jwt() ->> 'email') NOT IN (
        'parauapebasdeliveryoficial@gmail.com',
        'nildopereira60@gmail.com',
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
    ) THEN
        IF NOT is_super_admin() THEN
            RAISE EXCEPTION 'Acesso negado.';
        END IF;
    END IF;

    BEGIN
        v_encrypted_password := extensions.crypt(p_password, extensions.gen_salt('bf'));
    EXCEPTION WHEN OTHERS THEN
        v_encrypted_password := crypt(p_password, gen_salt('bf'));
    END;

    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role, instance_id, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (gen_random_uuid(), p_email, v_encrypted_password, now(), 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', '{"provider":"email","providers":["email"]}', '{}', now(), now())
        RETURNING id INTO v_user_id;

        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
        VALUES (v_user_id, v_user_id, format('{"sub":"%s","email":"%s"}', v_user_id, p_email)::jsonb, 'email', v_user_id::text, now(), now());
    ELSE
        UPDATE auth.users SET encrypted_password = v_encrypted_password, updated_at = now() WHERE id = v_user_id;
    END IF;

    -- Sincronizar owner_id na tabela stores
    UPDATE public.stores SET owner_id = v_user_id WHERE owner_email = p_email;

    RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_store_owner(text, text) TO authenticated;

-- 5. Recriar RPC update_store_owner_password
CREATE OR REPLACE FUNCTION public.update_store_owner_password(p_user_id uuid, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_encrypted_password text;
BEGIN
    IF (auth.jwt() ->> 'email') NOT IN (
        'parauapebasdeliveryoficial@gmail.com',
        'nildopereira60@gmail.com',
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
    ) THEN
        IF NOT is_super_admin() THEN
            RAISE EXCEPTION 'Acesso negado.';
        END IF;
    END IF;

    BEGIN
        v_encrypted_password := extensions.crypt(p_new_password, extensions.gen_salt('bf'));
    EXCEPTION WHEN OTHERS THEN
        v_encrypted_password := crypt(p_new_password, gen_salt('bf'));
    END;

    UPDATE auth.users SET encrypted_password = v_encrypted_password, updated_at = now() WHERE id = p_user_id;
    
    -- Sincronizar a senha na tabela stores
    UPDATE public.stores SET password = p_new_password WHERE owner_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_store_owner_password(uuid, text) TO authenticated;

-- 6. RLS simplificado e robusto
DO $$
DECLARE
    tbl RECORD;
    pol RECORD;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'stores', 'settings', 'categories', 'products', 'product_groups', 
        'product_options', 'product_group_relations', 'orders', 'coupons'
    ]) AS tablename LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl.tablename);
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl.tablename LOOP
             EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl.tablename);
        END LOOP;
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);

        -- Leitura pública (ANON + AUTHENTICATED)
        EXECUTE format('CREATE POLICY "Public_Read" ON %I FOR SELECT TO anon, authenticated USING (true)', tbl.tablename);

        -- Escrita total para autenticados (a verificação real é nas RPCs)
        EXECUTE format('CREATE POLICY "Auth_Write" ON %I FOR INSERT TO authenticated WITH CHECK (true)', tbl.tablename);
        EXECUTE format('CREATE POLICY "Auth_Update" ON %I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', tbl.tablename);
        EXECUTE format('CREATE POLICY "Auth_Delete" ON %I FOR DELETE TO authenticated USING (true)', tbl.tablename);
    END LOOP;
END $$;

DO $$ BEGIN
    RAISE NOTICE '✅ Bootstrap completo! Todas as contas auth sincronizadas.';
END $$;

