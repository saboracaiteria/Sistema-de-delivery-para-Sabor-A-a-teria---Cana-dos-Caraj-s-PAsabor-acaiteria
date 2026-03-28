-- =====================================================
-- SABOR A├çA├ìTERIA - MASTER CONSOLIDATED SCHEMA (V9)
-- =====================================================
-- Este script RE├ÜNE e ORGANIZA todos os SQLs do projeto.
-- Ele resolve o problema de dados 'embaralhados' e 
-- unifica as corre├º├Áes de RLS e Multi-tenant.
-- =====================================================

-- 0. PR├ë-REQUISITOS
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 1. TABELA DE LOJAS (STORE FRONT)
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID, -- Linkado ao auth.users(id)
  owner_email TEXT,
  password TEXT, -- Senha de acesso r├ípido (fallback)
  plan_type TEXT DEFAULT 'test' CHECK (plan_type IN ('test', 'paid')),
  plan_duration_days INTEGER DEFAULT 30,
  plan_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  plan_expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir Lojas Padr├úo
INSERT INTO stores (id, slug, name, owner_email, password, plan_duration_days) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'sabor-acaiteria', 'Sabor A├ºa├¡teria', 'canaadoscarajaspasabor@gmail.com', 'acaiteria123', 365),
  (gen_random_uuid(), 'canaadelivery', 'Cana├ú Delivery', 'parauapebasdeliveryoficial@gmail.com', 'canaa123', 365)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  password = COALESCE(stores.password, EXCLUDED.password);

-- 2. SCHEMA BASE COM MULTI-TENANT (store_id)
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

-- GRUPOS DE OP├ç├òES
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

-- OP├ç├òES
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

-- RELA├ç├âO N:N PRODUTOS-GRUPOS
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
  full_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'delivery', 'completed', 'cancelled')),
  is_quote BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONFIGURA├ç├òES (Multi-tenant)
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
  closed_message TEXT DEFAULT '├░┼╕ÔÇÜ┬┤ Loja Fechada',
  open_message TEXT DEFAULT '├░┼╕ÔÇÜ┬ó Aberto agora',
  delivery_time TEXT DEFAULT '40min ├á 1h',
  pickup_time TEXT DEFAULT '20min ├á 45min',
  delivery_close_time TEXT DEFAULT '21:00',
  instagram_url TEXT DEFAULT '',
  business_address TEXT DEFAULT '',
  copyright_text TEXT DEFAULT '┬┬® 2026',
  note_title TEXT DEFAULT 'Observa├º├Áes',
  note_placeholder TEXT DEFAULT 'Ex: Tirar cebola...',
  checkout_review_message TEXT,
  ui_mode TEXT DEFAULT 'modern' CHECK (ui_mode IN ('modern', 'classic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SCHEMA DE ESTOQUE
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

-- 4. VISITANTES
CREATE TABLE IF NOT EXISTS daily_visitors (
  date DATE NOT NULL,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (date, store_id)
);

-- =====================================================
-- FUN├ç├òES E RPCS (ULTRA SAFE)
-- =====================================================

-- RPC para salvar configura├º├Áes sem falha de RLS
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
            SELECT EXISTS(SELECT 1 FROM stores WHERE id = p_store_id AND (owner_email = v_caller_email OR owner_id = auth.uid())) INTO v_is_authorized;
        END IF;
    END IF;
    IF NOT v_is_authorized AND p_store_password IS NOT NULL THEN
        SELECT EXISTS(SELECT 1 FROM stores WHERE id = p_store_id AND password = p_store_password) INTO v_is_authorized;
    END IF;
    IF NOT v_is_authorized THEN RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501'; END IF;

    INSERT INTO settings (
        store_id, store_name, logo_url, logo_shape, banner_url,
        whatsapp_number, store_status, delivery_fee, delivery_only,
        opening_hours, theme_colors, closed_message, open_message,
        delivery_time, pickup_time, delivery_close_time,
        instagram_url, business_address, copyright_text, checkout_review_message, ui_mode, updated_at
    ) VALUES (
        p_store_id, COALESCE((p_settings ->> 'store_name'), 'Loja'), (p_settings ->> 'logo_url'),
        COALESCE((p_settings ->> 'logo_shape'), 'circle'), (p_settings ->> 'banner_url'),
        (p_settings ->> 'whatsapp_number'), COALESCE((p_settings ->> 'store_status'), 'open'),
        COALESCE((p_settings ->> 'delivery_fee')::NUMERIC, 5), COALESCE((p_settings ->> 'delivery_only')::BOOLEAN, false),
        COALESCE((p_settings -> 'opening_hours'), '[]'::jsonb), (p_settings -> 'theme_colors'),
        (p_settings ->> 'closed_message'), (p_settings ->> 'open_message'), (p_settings ->> 'delivery_time'),
        (p_settings ->> 'pickup_time'), (p_settings ->> 'delivery_close_time'), (p_settings ->> 'instagram_url'),
        (p_settings ->> 'business_address'), (p_settings ->> 'copyright_text'), (p_settings ->> 'checkout_review_message'),
        COALESCE((p_settings ->> 'ui_mode'), 'modern'), NOW()
    )
    ON CONFLICT (store_id) DO UPDATE SET
        store_name = EXCLUDED.store_name, logo_url = EXCLUDED.logo_url, logo_shape = EXCLUDED.logo_shape, 
        banner_url = EXCLUDED.banner_url, whatsapp_number = EXCLUDED.whatsapp_number, store_status = EXCLUDED.store_status,
        delivery_fee = EXCLUDED.delivery_fee, delivery_only = EXCLUDED.delivery_only, opening_hours = EXCLUDED.opening_hours,
        theme_colors = EXCLUDED.theme_colors, closed_message = EXCLUDED.closed_message, open_message = EXCLUDED.open_message,
        delivery_time = EXCLUDED.delivery_time, pickup_time = EXCLUDED.pickup_time, delivery_close_time = EXCLUDED.delivery_close_time,
        instagram_url = EXCLUDED.instagram_url, business_address = EXCLUDED.business_address, copyright_text = EXCLUDED.copyright_text,
        checkout_review_message = EXCLUDED.checkout_review_message, ui_mode = EXCLUDED.ui_mode, updated_at = NOW();
END;
$$;

-- DATA RECOVERY & RELINKING (Resgate de Dados)
-- Utilize estas consultas para 'desembaralhar' produtos se necessário:
/*
-- 1. Atribuir produtos com nomes específicos para a loja correta
UPDATE products 
SET store_id = (SELECT id FROM stores WHERE slug = 'canaadelivery')
WHERE (name ILIKE '%Canaã%' OR description ILIKE '%Canaã%')
AND store_id = '00000000-0000-0000-0000-000000000001';

-- 2. Atribuir categorias
UPDATE categories 
SET store_id = (SELECT id FROM stores WHERE slug = 'canaadelivery')
WHERE title ILIKE '%Canaã%'
AND store_id = '00000000-0000-0000-0000-000000000001';
*/

-- RPC para aumentar contador de visitantes
CREATE OR REPLACE FUNCTION public.increment_visitor_count(p_store_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_visitors (date, store_id, count)
  VALUES (CURRENT_DATE, p_store_id, 1)
  ON CONFLICT (date, store_id)
  DO UPDATE SET count = daily_visitors.count + 1, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEGURAN├çA (RLS) - O "RELIGAMENTO"
-- =====================================================

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
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['stores', 'settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'orders', 'coupons', 'daily_visitors', 'suppliers', 'purchases', 'stock_items']) AS tablename LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl.tablename);
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl.tablename LOOP
             EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl.tablename);
        END LOOP;
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);

        -- ADMIN MASTER: Acesso total para os emails da lista
        EXECUTE format('
            CREATE POLICY "Platform_Admin_Master" ON %I FOR ALL TO authenticated
            USING ((auth.jwt() ->> ''email'') = ANY(%L))
            WITH CHECK ((auth.jwt() ->> ''email'') = ANY(%L))
        ', tbl.tablename, superadmin_emails, superadmin_emails);
    END LOOP;

    -- DONOS DE LOJA: Acesso aos seus pr├│prios registros
    -- Loja (Stores)
    CREATE POLICY "Owner_Store_Access" ON stores FOR ALL TO authenticated
    USING (owner_id = auth.uid() OR owner_email = (auth.jwt() ->> 'email'))
    WITH CHECK (owner_id = auth.uid() OR owner_email = (auth.jwt() ->> 'email'));

    -- Demais tabelas (via store_id)
    FOR tbl IN SELECT unnest(ARRAY['settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'orders', 'coupons', 'daily_visitors', 'suppliers', 'purchases', 'stock_items']) AS tablename LOOP
        EXECUTE format('
            CREATE POLICY "Owner_Record_Access" ON %I FOR ALL TO authenticated
            USING (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND (s.owner_id = auth.uid() OR s.owner_email = (auth.jwt() ->> ''email''))))
            WITH CHECK (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND (s.owner_id = auth.uid() OR s.owner_email = (auth.jwt() ->> ''email''))))
        ', tbl.tablename);
    END LOOP;

    -- ACESSO P├ÜBLICO: Sele├º├úo para anonimatos (Site do cliente)
    FOR tbl IN SELECT unnest(ARRAY['stores', 'settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'coupons']) AS tablename LOOP
        EXECUTE format('CREATE POLICY "Public_Read_Anon" ON %I FOR SELECT TO anon, authenticated USING (true)', tbl.tablename);
    END LOOP;
    
    -- Pedidos: Clientes podem enviar pedidos
    CREATE POLICY "Public_Insert_Order" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);

END $$;

-- 5. STORAGE
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "Public_Read" ON storage.objects;
CREATE POLICY "Public_Read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "Public_Upload" ON storage.objects;
CREATE POLICY "Public_Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- =====================================================
-- FINALIZA├ç├âO
-- =====================================================
SELECT '┬┬á Script Consolidado V9 executado com sucesso! ' as status;
