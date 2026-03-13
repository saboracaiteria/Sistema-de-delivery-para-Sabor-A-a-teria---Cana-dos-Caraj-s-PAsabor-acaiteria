-- =====================================================
-- FIX RLS POLICIES FOR SUPERADMIN AND TENANT ACCESS
-- Execute no SQL Editor do Supabase
-- =====================================================

-- List of Super Admin Emails (Sync these with constants.ts if possible)
-- Here we use a subquery to identify if the current user should have superadmin powers
-- Or we simply allow updates if the user is the owner.

-- 0. STORES: Permitir que Super Admins gerenciem o nome/slug e Donos gerenciem sua loja
DROP POLICY IF EXISTS "Allow owner update stores" ON stores;
CREATE POLICY "Allow owner update stores" ON stores FOR UPDATE
  USING (
    auth.uid() = owner_id
    OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com')
  );

-- 1. SETTINGS: Permitir que Super Admins gerenciem TUDO e Donos gerenciem sua loja
DROP POLICY IF EXISTS "Owner manage settings" ON settings;
CREATE POLICY "Owner manage settings" ON settings FOR UPDATE
  USING (
    -- É o dono da loja
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR
    -- É um super admin (identificado pelo email no auth.users)
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com')
  );

-- 2. PRODUCTS: Permitir que Super Admins gerenciem TUDO e Donos gerenciem sua loja
DROP POLICY IF EXISTS "Owner manage products" ON products;
CREATE POLICY "Owner manage products" ON products FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com')
  );

DROP POLICY IF EXISTS "Owner insert products" ON products;
CREATE POLICY "Owner insert products" ON products FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com')
  );

DROP POLICY IF EXISTS "Owner delete products" ON products;
CREATE POLICY "Owner delete products" ON products FOR DELETE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com')
  );

-- 3. CATEGORIES: Mesma lógica
DROP POLICY IF EXISTS "Owner manage categories" ON categories;
CREATE POLICY "Owner manage categories" ON categories FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com')
  );

DROP POLICY IF EXISTS "Owner insert categories" ON categories;
CREATE POLICY "Owner insert categories" ON categories FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com')
  );

DROP POLICY IF EXISTS "Owner delete categories" ON categories;
CREATE POLICY "Owner delete categories" ON categories FOR DELETE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com')
  );

-- 4. Garantir que a tabela SETTINGS tenha store_id preenchido para a loja padrão se não estiver
UPDATE settings SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;

SELECT 'Políticas de Super Admin e Multi-tenant corrigidas! ✅' as status;
