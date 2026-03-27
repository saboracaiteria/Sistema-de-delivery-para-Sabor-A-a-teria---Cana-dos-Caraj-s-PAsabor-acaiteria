-- =====================================================
-- FIX RLS POLICIES FOR SUPERADMIN AND TENANT ACCESS
-- Execute no SQL Editor do Supabase
-- =====================================================

-- List of Super Admin Emails (Sync these with constants.ts if possible)
-- Here we use a subquery to identify if the current user should have superadmin powers
-- Or we simply allow updates if the user is the owner.

-- -- 0. STORES: Super Admins gerenciam TUDO, Donos gerenciem sua própria loja
DROP POLICY IF EXISTS "Superadmin manage stores" ON stores;
CREATE POLICY "Superadmin manage stores" ON stores FOR ALL
  USING ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'));

DROP POLICY IF EXISTS "Owner update stores" ON stores;
CREATE POLICY "Owner update stores" ON stores FOR UPDATE
  USING (auth.uid() = owner_id);

-- 1. SETTINGS: Super Admins gerenciem TUDO e Donos gerenciem sua loja
DROP POLICY IF EXISTS "Superadmin manage settings" ON settings;
CREATE POLICY "Superadmin manage settings" ON settings FOR ALL
  USING ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'));

DROP POLICY IF EXISTS "Owner manage own settings" ON settings;
CREATE POLICY "Owner manage own settings" ON settings FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- 2. PRODUCTS
DROP POLICY IF EXISTS "Superadmin manage products" ON products;
CREATE POLICY "Superadmin manage products" ON products FOR ALL
  USING ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'));

DROP POLICY IF EXISTS "Owner manage own products" ON products;
CREATE POLICY "Owner manage own products" ON products FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- 3. CATEGORIES
DROP POLICY IF EXISTS "Superadmin manage categories" ON categories;
CREATE POLICY "Superadmin manage categories" ON categories FOR ALL
  USING ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'));

DROP POLICY IF EXISTS "Owner manage own categories" ON categories;
CREATE POLICY "Owner manage own categories" ON categories FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- 4. PRODUCT_GROUPS
DROP POLICY IF EXISTS "Superadmin manage product_groups" ON product_groups;
CREATE POLICY "Superadmin manage product_groups" ON product_groups FOR ALL
  USING ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'));

DROP POLICY IF EXISTS "Owner manage own product_groups" ON product_groups;
CREATE POLICY "Owner manage own product_groups" ON product_groups FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- 5. PRODUCT_OPTIONS
DROP POLICY IF EXISTS "Superadmin manage product_options" ON product_options;
CREATE POLICY "Superadmin manage product_options" ON product_options FOR ALL
  USING ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'));

DROP POLICY IF EXISTS "Owner manage own product_options" ON product_options;
CREATE POLICY "Owner manage own product_options" ON product_options FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- 6. PRODUCT_GROUP_RELATIONS (N:N)
DROP POLICY IF EXISTS "Superadmin manage relations" ON product_group_relations;
CREATE POLICY "Superadmin manage relations" ON product_group_relations FOR ALL
  USING ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'));

DROP POLICY IF EXISTS "Owner manage own relations" ON product_group_relations;
CREATE POLICY "Owner manage own relations" ON product_group_relations FOR ALL
  USING (EXISTS (SELECT 1 FROM products WHERE id = product_id AND store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM products WHERE id = product_id AND store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));

-- 7. COUPONS
DROP POLICY IF EXISTS "Superadmin manage coupons" ON coupons;
CREATE POLICY "Superadmin manage coupons" ON coupons FOR ALL
  USING ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'));

DROP POLICY IF EXISTS "Owner manage own coupons" ON coupons;
CREATE POLICY "Owner manage own coupons" ON coupons FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- 8. ORDERS
DROP POLICY IF EXISTS "Superadmin manage orders" ON orders;
CREATE POLICY "Superadmin manage orders" ON orders FOR ALL
  USING ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'))
  WITH CHECK ((auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com'));

DROP POLICY IF EXISTS "Owner manage own orders" ON orders;
CREATE POLICY "Owner manage own orders" ON orders FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- 9. Sincronizar Sequência de IDs e Recuperação de Lojas
-- Forçamos a sequência a começar acima de 100 para evitar qualquer conflito com IDs manuais baixos (como o ID 1)
SELECT setval(pg_get_serial_sequence('settings', 'id'), GREATEST((SELECT MAX(id) FROM settings), 100));

-- Criar settings faltantes apenas para lojas que realmente não possuem
INSERT INTO settings (store_id, store_name, store_status)
SELECT id, name, 'open'
FROM stores
WHERE id NOT IN (SELECT store_id FROM settings);

SELECT 'RLS MASTER FIX V6 + RECOVERY: Sequence synced and stores recovered! ✅' as status;
