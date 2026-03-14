-- =====================================================
-- ADD PUBLIC READ ACCESS AND STORAGE POLICIES
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. Permissões de Leitura Pública para Tabelas Principais
-- Isso permite que o app carregue os dados da loja sem exigir login

-- STORES
DROP POLICY IF EXISTS "Public read stores" ON stores;
CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true);

-- SETTINGS
DROP POLICY IF EXISTS "Public read settings" ON settings;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- CATEGORIES
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

-- PRODUCTS
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

-- PRODUCT_GROUPS
DROP POLICY IF EXISTS "Public read product_groups" ON product_groups;
CREATE POLICY "Public read product_groups" ON product_groups FOR SELECT USING (true);

-- PRODUCT_OPTIONS
DROP POLICY IF EXISTS "Public read product_options" ON product_options;
CREATE POLICY "Public read product_options" ON product_options FOR SELECT USING (true);

-- PRODUCT_GROUP_RELATIONS
DROP POLICY IF EXISTS "Public read relations" ON product_group_relations;
CREATE POLICY "Public read relations" ON product_group_relations FOR SELECT USING (true);

-- COUPONS
DROP POLICY IF EXISTS "Public read coupons" ON coupons;
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (active = true);


-- 2. Configurações de STORAGE (Bucket product-images)
-- Garante que o bucket existe e tem as políticas corretas

-- Certificar que o bucket existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Política para LEITURA pública de imagens
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Política para UPLOAD (Apenas ADMINS e OWNERS via JWT email)
-- Nota: Usamos o email do JWT para simplificar o acesso do Super Admin
DROP POLICY IF EXISTS "Admin upload images" ON storage.objects;
CREATE POLICY "Admin upload images" ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'product-images' AND 
  (
    (auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com')
    OR
    (auth.role() = 'authenticated')
  )
);

-- Política para UPDATE/DELETE (Apenas ADMINS e OWNERS)
DROP POLICY IF EXISTS "Admin manage images" ON storage.objects;
CREATE POLICY "Admin manage images" ON storage.objects FOR ALL
USING (
  bucket_id = 'product-images' AND 
  (
    (auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com')
    OR
    (auth.role() = 'authenticated')
  )
);

SELECT 'PUBLIC READ AND STORAGE POLICIES APPLIED! ✅' as status;
