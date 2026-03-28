-- =====================================================================
-- SABOR AÇAÍTERIA — FINAL SQL V10 (COMPLETO)
-- Inclui: Tabelas, Funções, RPCs, RLS, Storage, Bootstrap Auth
-- Execute no SQL Editor do Supabase como superadmin
-- =====================================================================

-- =====================================================================
-- 0. EXTENSÕES
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- =====================================================================
-- 1. TABELAS BASE (Multi-Tenant)
-- =====================================================================

-- LOJAS
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID,
  owner_email TEXT,
  password TEXT,
  plan_type TEXT DEFAULT 'test' CHECK (plan_type IN ('test', 'paid')),
  plan_duration_days INTEGER DEFAULT 30,
  plan_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  plan_expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  title TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GRUPOS DE OPÇÕES
CREATE TABLE IF NOT EXISTS product_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  title TEXT NOT NULL,
  min INTEGER NOT NULL DEFAULT 0,
  max INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OPÇÕES
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  group_id UUID NOT NULL REFERENCES product_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRODUTOS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RELAÇÃO N:N PRODUTOS-GRUPOS
CREATE TABLE IF NOT EXISTS product_group_relations (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES product_groups(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  position INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, group_id)
);

-- CUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  order_number SERIAL UNIQUE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('DELIVERY', 'PICKUP')),
  address TEXT,
  payment_method TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  items_summary TEXT,
  full_details JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'delivery', 'completed', 'cancelled')),
  is_quote BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONFIGURAÇÕES DA LOJA (1:1 com stores)
CREATE TABLE IF NOT EXISTS settings (
  store_id UUID PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL DEFAULT 'Loja Nova',
  logo_url TEXT,
  logo_shape VARCHAR(10) DEFAULT 'circle' CHECK (logo_shape IN ('circle', 'rectangle')),
  banner_url TEXT,
  whatsapp_number TEXT,
  store_status TEXT DEFAULT 'auto' CHECK (store_status IN ('open', 'closed', 'auto')),
  delivery_fee DECIMAL(10,2) DEFAULT 5,
  delivery_only BOOLEAN DEFAULT false,
  opening_hours JSONB DEFAULT '[]'::jsonb,
  theme_colors JSONB,
  closed_message TEXT DEFAULT '🚫 Loja Fechada',
  open_message TEXT DEFAULT '✅ Aberto agora',
  delivery_time TEXT DEFAULT '40min à 1h',
  pickup_time TEXT DEFAULT '20min à 45min',
  delivery_close_time TEXT DEFAULT '21:00',
  instagram_url TEXT DEFAULT '',
  business_address TEXT DEFAULT '',
  copyright_text TEXT DEFAULT '© 2026',
  note_title TEXT DEFAULT 'Observações',
  note_placeholder TEXT DEFAULT 'Ex: Tirar cebola...',
  checkout_review_message TEXT,
  ui_mode TEXT DEFAULT 'modern' CHECK (ui_mode IN ('modern', 'classic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- 2. TABELAS DE ESTOQUE
-- =====================================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  contact TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id)
);

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  items JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================================
-- 3. VISITANTES DIÁRIOS
-- =====================================================================
CREATE TABLE IF NOT EXISTS daily_visitors (
  date DATE NOT NULL,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (date, store_id)
);

-- =====================================================================
-- 4. LOJAS PADRÃO
-- =====================================================================
INSERT INTO stores (id, slug, name, owner_email, password, plan_duration_days)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'sabor-acaiteria', 'Sabor Açaíteria', 'canaadoscarajaspasabor@gmail.com', 'acaiteria123', 365),
  (gen_random_uuid(), 'canaadelivery', 'Canaã Delivery', 'parauapebasdeliveryoficial@gmail.com', 'canaa123', 365)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  owner_email = COALESCE(stores.owner_email, EXCLUDED.owner_email),
  password = COALESCE(stores.password, EXCLUDED.password);

-- =====================================================================
-- 5. FUNÇÕES AUXILIARES
-- =====================================================================

-- 5.1 Verificar se é superadmin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN COALESCE((auth.jwt() ->> 'email'), '') = ANY(ARRAY[
    'parauapebasdeliveryoficial@gmail.com',
    'nildopereira60@gmail.com',
    'nildoxz@gmail.com',
    'canaadoscarajaspasabor@gmail.com'
  ]);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- =====================================================================
-- 6. RPCs PRINCIPAIS
-- =====================================================================

-- 6.1 save_store_settings (com fallback por senha da loja)
DROP FUNCTION IF EXISTS public.save_store_settings(UUID, JSONB);
DROP FUNCTION IF EXISTS public.save_store_settings(UUID, JSONB, TEXT);

CREATE OR REPLACE FUNCTION public.save_store_settings(
    p_store_id UUID,
    p_settings JSONB,
    p_store_password TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_caller_email TEXT;
    v_is_authorized BOOLEAN := FALSE;
    v_store_name TEXT;
    v_existing_store_name TEXT;
    superadmin_emails TEXT[] := ARRAY[
        'parauapebasdeliveryoficial@gmail.com',
        'nildopereira60@gmail.com',
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
    ];
BEGIN
    v_caller_email := (auth.jwt() ->> 'email');

    IF v_caller_email IS NOT NULL THEN
        IF v_caller_email = ANY(superadmin_emails) THEN
            v_is_authorized := TRUE;
        ELSE
            SELECT EXISTS(
                SELECT 1 FROM stores
                WHERE id = p_store_id
                AND (owner_email = v_caller_email OR owner_id = auth.uid())
            ) INTO v_is_authorized;
        END IF;
    END IF;

    -- Fallback por senha da loja (sem sessão de Auth)
    IF NOT v_is_authorized AND p_store_password IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM stores
            WHERE id = p_store_id AND password = p_store_password
        ) INTO v_is_authorized;
    END IF;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501';
    END IF;

    -- Buscar nome existente para COALESCE
    SELECT COALESCE(s.store_name, st.name)
    INTO v_existing_store_name
    FROM stores st
    LEFT JOIN settings s ON s.store_id = st.id
    WHERE st.id = p_store_id;

    v_store_name := COALESCE((p_settings ->> 'store_name'), v_existing_store_name, 'Loja');

    INSERT INTO settings (
        store_id, store_name, logo_url, logo_shape, banner_url,
        whatsapp_number, store_status, delivery_fee, delivery_only,
        opening_hours, theme_colors, closed_message, open_message,
        delivery_time, pickup_time, delivery_close_time,
        instagram_url, business_address, copyright_text,
        note_title, note_placeholder, checkout_review_message, ui_mode, updated_at
    ) VALUES (
        p_store_id,
        v_store_name,
        (p_settings ->> 'logo_url'),
        COALESCE((p_settings ->> 'logo_shape'), 'circle'),
        (p_settings ->> 'banner_url'),
        (p_settings ->> 'whatsapp_number'),
        COALESCE((p_settings ->> 'store_status'), 'auto'),
        COALESCE((p_settings ->> 'delivery_fee')::NUMERIC, 5),
        COALESCE((p_settings ->> 'delivery_only')::BOOLEAN, false),
        COALESCE((p_settings -> 'opening_hours'), '[]'::jsonb),
        (p_settings -> 'theme_colors'),
        COALESCE((p_settings ->> 'closed_message'), '🚫 Loja Fechada'),
        COALESCE((p_settings ->> 'open_message'), '✅ Aberto agora'),
        COALESCE((p_settings ->> 'delivery_time'), '40min à 1h'),
        COALESCE((p_settings ->> 'pickup_time'), '20min à 45min'),
        COALESCE((p_settings ->> 'delivery_close_time'), '21:00'),
        COALESCE((p_settings ->> 'instagram_url'), ''),
        COALESCE((p_settings ->> 'business_address'), ''),
        COALESCE((p_settings ->> 'copyright_text'), '© 2026'),
        COALESCE((p_settings ->> 'note_title'), 'Observações'),
        COALESCE((p_settings ->> 'note_placeholder'), 'Ex: Tirar cebola...'),
        (p_settings ->> 'checkout_review_message'),
        COALESCE((p_settings ->> 'ui_mode'), 'modern'),
        NOW()
    )
    ON CONFLICT (store_id) DO UPDATE SET
        store_name              = COALESCE(EXCLUDED.store_name, settings.store_name),
        logo_url                = COALESCE(EXCLUDED.logo_url, settings.logo_url),
        logo_shape              = COALESCE(EXCLUDED.logo_shape, settings.logo_shape),
        banner_url              = COALESCE(EXCLUDED.banner_url, settings.banner_url),
        whatsapp_number         = COALESCE(EXCLUDED.whatsapp_number, settings.whatsapp_number),
        store_status            = COALESCE(EXCLUDED.store_status, settings.store_status),
        delivery_fee            = COALESCE(EXCLUDED.delivery_fee, settings.delivery_fee),
        delivery_only           = COALESCE(EXCLUDED.delivery_only, settings.delivery_only),
        opening_hours           = COALESCE(EXCLUDED.opening_hours, settings.opening_hours),
        theme_colors            = COALESCE(EXCLUDED.theme_colors, settings.theme_colors),
        closed_message          = COALESCE(EXCLUDED.closed_message, settings.closed_message),
        open_message            = COALESCE(EXCLUDED.open_message, settings.open_message),
        delivery_time           = COALESCE(EXCLUDED.delivery_time, settings.delivery_time),
        pickup_time             = COALESCE(EXCLUDED.pickup_time, settings.pickup_time),
        delivery_close_time     = COALESCE(EXCLUDED.delivery_close_time, settings.delivery_close_time),
        instagram_url           = COALESCE(EXCLUDED.instagram_url, settings.instagram_url),
        business_address        = COALESCE(EXCLUDED.business_address, settings.business_address),
        copyright_text          = COALESCE(EXCLUDED.copyright_text, settings.copyright_text),
        note_title              = COALESCE(EXCLUDED.note_title, settings.note_title),
        note_placeholder        = COALESCE(EXCLUDED.note_placeholder, settings.note_placeholder),
        checkout_review_message = COALESCE(EXCLUDED.checkout_review_message, settings.checkout_review_message),
        ui_mode                 = COALESCE(EXCLUDED.ui_mode, settings.ui_mode),
        updated_at              = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_store_settings(UUID, JSONB, TEXT) TO anon, authenticated;

-- 6.2 increment_visitor_count
CREATE OR REPLACE FUNCTION public.increment_visitor_count(p_store_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO daily_visitors (date, store_id, count, updated_at)
  VALUES (CURRENT_DATE, p_store_id, 1, NOW())
  ON CONFLICT (date, store_id)
  DO UPDATE SET
    count = daily_visitors.count + 1,
    updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_visitor_count(UUID) TO anon, authenticated, service_role;

-- 6.3 is_super_admin (helper)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN COALESCE((auth.jwt() ->> 'email'), '') = ANY(ARRAY[
    'parauapebasdeliveryoficial@gmail.com',
    'nildopereira60@gmail.com',
    'nildoxz@gmail.com',
    'canaadoscarajaspasabor@gmail.com'
  ]);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- 6.4 create_store_owner (criar conta Auth para novo lojista)
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
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Acesso negado. Apenas Master Admins podem criar contas.';
    END IF;

    BEGIN
        v_encrypted_password := extensions.crypt(p_password, extensions.gen_salt('bf'));
    EXCEPTION WHEN OTHERS THEN
        v_encrypted_password := crypt(p_password, gen_salt('bf'));
    END;

    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;

    IF v_user_id IS NULL THEN
        INSERT INTO auth.users (
            id, email, encrypted_password, email_confirmed_at,
            aud, role, instance_id,
            raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at
        ) VALUES (
            gen_random_uuid(), p_email, v_encrypted_password, now(),
            'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000',
            '{"provider":"email","providers":["email"]}', '{}',
            now(), now()
        ) RETURNING id INTO v_user_id;

        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
        VALUES (
            v_user_id, v_user_id,
            format('{"sub":"%s","email":"%s"}', v_user_id, p_email)::jsonb,
            'email', v_user_id::text, now(), now()
        );
    ELSE
        UPDATE auth.users
        SET encrypted_password = v_encrypted_password, updated_at = now(),
            email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = v_user_id;
    END IF;

    -- Sincronizar owner_id na tabela stores
    UPDATE public.stores SET owner_id = v_user_id WHERE owner_email = p_email;

    RETURN v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_store_owner(text, text) TO authenticated;

-- 6.5 update_store_owner_password (alterar senha de lojista)
CREATE OR REPLACE FUNCTION public.update_store_owner_password(p_user_id uuid, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_encrypted_password text;
BEGIN
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Acesso negado. Apenas Master Admins podem alterar senhas.';
    END IF;

    BEGIN
        v_encrypted_password := extensions.crypt(p_new_password, extensions.gen_salt('bf'));
    EXCEPTION WHEN OTHERS THEN
        v_encrypted_password := crypt(p_new_password, gen_salt('bf'));
    END;

    UPDATE auth.users
    SET encrypted_password = v_encrypted_password, updated_at = now()
    WHERE id = p_user_id;

    -- Sincronizar senha na tabela stores
    UPDATE public.stores SET password = p_new_password WHERE owner_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_store_owner_password(uuid, text) TO authenticated;

-- =====================================================================
-- 7. BOOTSTRAP AUTH — Sincronizar contas Auth para lojas existentes
-- =====================================================================
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

        SELECT id INTO v_user_id FROM auth.users WHERE email = store_rec.owner_email;

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
            v_user_id := gen_random_uuid();
            INSERT INTO auth.users (
                id, email, encrypted_password, email_confirmed_at,
                aud, role, instance_id,
                raw_app_meta_data, raw_user_meta_data,
                created_at, updated_at
            ) VALUES (
                v_user_id, store_rec.owner_email, v_encrypted_password, now(),
                'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000',
                '{"provider":"email","providers":["email"]}', '{}',
                now(), now()
            );

            INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
            VALUES (
                v_user_id, v_user_id,
                format('{"sub":"%s","email":"%s"}', v_user_id, store_rec.owner_email)::jsonb,
                'email', v_user_id::text, now(), now()
            );
            RAISE NOTICE 'Usuário criado: % → %', store_rec.owner_email, v_user_id;
        ELSE
            UPDATE auth.users
            SET encrypted_password = v_encrypted_password,
                updated_at = now(),
                email_confirmed_at = COALESCE(email_confirmed_at, now())
            WHERE id = v_user_id;
            RAISE NOTICE 'Senha sincronizada: %', store_rec.owner_email;
        END IF;

        UPDATE public.stores SET owner_id = v_user_id WHERE id = store_rec.id;
        RAISE NOTICE 'owner_id atualizado: % → %', store_rec.slug, v_user_id;
    END LOOP;
END $$;

-- =====================================================================
-- 8. SEGURANÇA (RLS) — Políticas completas
-- =====================================================================
DO $$
DECLARE
    tbl RECORD;
    pol RECORD;
    superadmin_emails TEXT[] := ARRAY[
        'parauapebasdeliveryoficial@gmail.com',
        'nildopereira60@gmail.com',
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
    ];
    all_tables TEXT[] := ARRAY[
        'stores', 'settings', 'categories', 'products',
        'product_groups', 'product_options', 'product_group_relations',
        'orders', 'coupons', 'daily_visitors', 'suppliers', 'purchases', 'stock_items'
    ];
    public_read_tables TEXT[] := ARRAY[
        'stores', 'settings', 'categories', 'products',
        'product_groups', 'product_options', 'product_group_relations', 'coupons'
    ];
    store_scoped_tables TEXT[] := ARRAY[
        'settings', 'categories', 'products', 'product_groups', 'product_options',
        'product_group_relations', 'orders', 'coupons', 'daily_visitors',
        'suppliers', 'purchases', 'stock_items'
    ];
BEGIN
    -- Limpar todas as políticas antigas
    FOR tbl IN SELECT unnest(all_tables) AS tablename LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl.tablename);
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl.tablename LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl.tablename);
        END LOOP;
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);
    END LOOP;

    -- POLÍTICA 1: Superadmin tem acesso total a tudo
    FOR tbl IN SELECT unnest(all_tables) AS tablename LOOP
        EXECUTE format(
            'CREATE POLICY "superadmin_all" ON %I FOR ALL TO authenticated
             USING ((auth.jwt() ->> ''email'') = ANY(%L))
             WITH CHECK ((auth.jwt() ->> ''email'') = ANY(%L))',
            tbl.tablename, superadmin_emails, superadmin_emails
        );
    END LOOP;

    -- POLÍTICA 2: Dono da loja acessa a própria loja (stores)
    CREATE POLICY "owner_store_access" ON stores FOR ALL TO authenticated
    USING (owner_id = auth.uid() OR owner_email = (auth.jwt() ->> 'email'))
    WITH CHECK (owner_id = auth.uid() OR owner_email = (auth.jwt() ->> 'email'));

    -- POLÍTICA 3: Dono acessa dados das suas lojas (via store_id)
    FOR tbl IN SELECT unnest(store_scoped_tables) AS tablename LOOP
        EXECUTE format(
            'CREATE POLICY "owner_record_access" ON %I FOR ALL TO authenticated
             USING (EXISTS (
                SELECT 1 FROM stores s WHERE s.id = store_id
                AND (s.owner_id = auth.uid() OR s.owner_email = (auth.jwt() ->> ''email''))
             ))
             WITH CHECK (EXISTS (
                SELECT 1 FROM stores s WHERE s.id = store_id
                AND (s.owner_id = auth.uid() OR s.owner_email = (auth.jwt() ->> ''email''))
             ))',
            tbl.tablename
        );
    END LOOP;

    -- POLÍTICA 4: Leitura pública para anon (cardápio dos clientes)
    FOR tbl IN SELECT unnest(public_read_tables) AS tablename LOOP
        EXECUTE format(
            'CREATE POLICY "public_read_anon" ON %I FOR SELECT TO anon, authenticated USING (true)',
            tbl.tablename
        );
    END LOOP;

    -- POLÍTICA 5: Clientes anônimos podem fazer pedidos
    CREATE POLICY "public_insert_order" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);

    RAISE NOTICE '✅ RLS configurado com sucesso!';
END $$;

-- =====================================================================
-- 9. STORAGE
-- =====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_public_upload" ON storage.objects;
CREATE POLICY "product_images_public_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_auth_update" ON storage.objects;
CREATE POLICY "product_images_auth_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_auth_delete" ON storage.objects;
CREATE POLICY "product_images_auth_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-images');

-- =====================================================================
-- 10. VERIFICAÇÃO FINAL
-- =====================================================================
SELECT
  'TABELAS' as tipo,
  table_name as nome,
  'OK' as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'stores','categories','products','product_groups','product_options',
    'product_group_relations','coupons','orders','settings',
    'suppliers','stock_items','purchases','daily_visitors'
  )
UNION ALL
SELECT
  'FUNÇÕES' as tipo,
  routine_name as nome,
  'OK' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'save_store_settings', 'increment_visitor_count',
    'is_super_admin', 'create_store_owner', 'update_store_owner_password'
  )
ORDER BY tipo, nome;
