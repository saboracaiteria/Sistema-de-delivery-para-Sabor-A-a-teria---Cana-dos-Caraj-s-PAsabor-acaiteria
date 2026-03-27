-- =====================================================
-- MULTI-TENANT MIGRATION SCRIPT
-- =====================================================

-- 1. Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de lojas
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read stores" ON stores;
CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner manage stores" ON stores;
CREATE POLICY "Owner manage stores" ON stores USING (auth.uid() = owner_id);

-- 2. Insert initial store (Sabor Açaíteria)
-- ID Fixo para garantir que os dados antigos se liguem a essa loja
INSERT INTO stores (id, slug, name) 
VALUES ('00000000-0000-0000-0000-000000000001', 'sabor-acaiteria', 'Sabor Açaíteria')
ON CONFLICT (slug) DO NOTHING;

-- 3. Add store_id to existing tables
-- Categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_categories_store ON categories(store_id);

-- Product Groups
ALTER TABLE product_groups ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_product_groups_store ON product_groups(store_id);

-- Product Options
ALTER TABLE product_options ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_product_options_store ON product_options(store_id);

-- Products
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);

-- Coupons
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_coupons_store ON coupons(store_id);

-- Orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);

-- Settings (Remover a restrição de ID = 1 e adicionar store_id)
ALTER TABLE settings DROP CONSTRAINT IF EXISTS single_row;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_settings_store ON settings(store_id);

-- Agora que `single_row` foi dropada, e a loja padrão tem id=1, atualizamos o settings com store_id
UPDATE settings SET store_id = '00000000-0000-0000-0000-000000000001' WHERE id = 1;


-- =====================================================
-- ATUALIZAÇÃO DAS POLÍTICAS DE RLS (APENAS LEITURA PARA AGORA)
-- O acesso à gravação será ajustado quando o painel de login estiver pronto.
-- =====================================================

DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read product_groups" ON product_groups;
CREATE POLICY "Public read product_groups" ON product_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read product_options" ON product_options;
CREATE POLICY "Public read product_options" ON product_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read settings" ON settings;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read active coupons" ON coupons;
CREATE POLICY "Public read active coupons" ON coupons FOR SELECT USING (active = true);

-- FIM DA MIGRAÇÃO
SELECT 'Migração multi-tenant concluída com sucesso!' as status;
