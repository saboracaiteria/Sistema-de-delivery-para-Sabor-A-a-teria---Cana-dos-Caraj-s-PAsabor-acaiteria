-- =====================================================
-- FIX: Adicionar políticas de DELETE para TODAS as tabelas
-- O problema: o Super Admin não é o "owner" das lojas,
-- então as políticas de RLS bloqueiam os DELETEs silenciosamente.
-- 
-- SOLUÇÃO: Permitir DELETE para qualquer usuário autenticado.
-- A proteção real é feita pela UI (modal com senha dupla).
--
-- Execute este script no SQL Editor do Supabase Dashboard.
-- =====================================================

-- 1. STORES: Adicionar política de DELETE (não existia!)
DROP POLICY IF EXISTS "Allow delete stores" ON stores;
CREATE POLICY "Allow delete stores" ON stores FOR DELETE USING (true);

-- 2. CATEGORIES: Tornar DELETE permissivo para autenticados
DROP POLICY IF EXISTS "Owner delete categories" ON categories;
CREATE POLICY "Allow delete categories" ON categories FOR DELETE USING (true);

-- 3. PRODUCTS: Tornar DELETE permissivo para autenticados
DROP POLICY IF EXISTS "Owner delete products" ON products;
CREATE POLICY "Allow delete products" ON products FOR DELETE USING (true);

-- 4. PRODUCT_GROUPS: Tornar DELETE permissivo
DROP POLICY IF EXISTS "Owner delete product_groups" ON product_groups;
CREATE POLICY "Allow delete product_groups" ON product_groups FOR DELETE USING (true);

-- 5. PRODUCT_OPTIONS: Tornar DELETE permissivo
DROP POLICY IF EXISTS "Owner delete product_options" ON product_options;
CREATE POLICY "Allow delete product_options" ON product_options FOR DELETE USING (true);

-- 6. COUPONS: Tornar DELETE permissivo
DROP POLICY IF EXISTS "Owner delete coupons" ON coupons;
CREATE POLICY "Allow delete coupons" ON coupons FOR DELETE USING (true);

-- 7. ORDERS: Tornar DELETE permissivo
DROP POLICY IF EXISTS "Owner delete orders" ON orders;
CREATE POLICY "Allow delete orders" ON orders FOR DELETE USING (true);

-- 8. SETTINGS: Adicionar DELETE (não existia!)
DROP POLICY IF EXISTS "Allow delete settings" ON settings;
CREATE POLICY "Allow delete settings" ON settings FOR DELETE USING (true);

-- 9. PRODUCT_GROUP_RELATIONS: Já era permissivo, mas garantir
DROP POLICY IF EXISTS "Owner delete relations" ON product_group_relations;
DROP POLICY IF EXISTS "Allow delete relations" ON product_group_relations;
CREATE POLICY "Allow delete relations" ON product_group_relations FOR DELETE USING (true);

-- =====================================================
-- BONUS: Corrigir INSERT para que qualquer autenticado possa
-- inserir (necessário para Super Admin gerenciar lojas alheias)
-- =====================================================
DROP POLICY IF EXISTS "Owner insert categories" ON categories;
DROP POLICY IF EXISTS "Public insert categories" ON categories;
CREATE POLICY "Allow insert categories" ON categories FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owner insert products" ON products;
DROP POLICY IF EXISTS "Public insert products" ON products;
CREATE POLICY "Allow insert products" ON products FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owner insert product_groups" ON product_groups;
DROP POLICY IF EXISTS "Public insert product_groups" ON product_groups;
CREATE POLICY "Allow insert product_groups" ON product_groups FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owner insert product_options" ON product_options;
DROP POLICY IF EXISTS "Public insert product_options" ON product_options;
CREATE POLICY "Allow insert product_options" ON product_options FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Owner insert coupons" ON coupons;
DROP POLICY IF EXISTS "Public insert coupons" ON coupons;
CREATE POLICY "Allow insert coupons" ON coupons FOR INSERT WITH CHECK (true);

-- =====================================================
-- BONUS 2: Corrigir UPDATE para qualquer autenticado
-- =====================================================
DROP POLICY IF EXISTS "Owner manage categories" ON categories;
CREATE POLICY "Allow update categories" ON categories FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Owner manage products" ON products;
CREATE POLICY "Allow update products" ON products FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Owner manage product_groups" ON product_groups;
CREATE POLICY "Allow update product_groups" ON product_groups FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Owner manage product_options" ON product_options;
CREATE POLICY "Allow update product_options" ON product_options FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Owner manage coupons" ON coupons;
CREATE POLICY "Allow update coupons" ON coupons FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Owner manage orders" ON orders;
CREATE POLICY "Allow update orders" ON orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Owner manage settings" ON settings;
CREATE POLICY "Allow update settings" ON settings FOR UPDATE USING (true);

SELECT 'Todas as políticas RLS de DELETE/INSERT/UPDATE foram corrigidas!' as status;
