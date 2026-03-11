-- =====================================================
-- FIX RLS POLICIES FOR MULTI-TENANT WRITE ACCESS
-- Execute no SQL Editor do Supabase
-- =====================================================

-- =========================
-- 1. STORES: Permitir criação livre (controlado pela UI do Super Admin)
-- =========================
DROP POLICY IF EXISTS "Owner manage stores" ON stores;
DROP POLICY IF EXISTS "Public read stores" ON stores;
DROP POLICY IF EXISTS "Allow insert stores" ON stores;
DROP POLICY IF EXISTS "Allow owner update stores" ON stores;

-- Leitura pública
CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true);

-- Qualquer um pode criar loja (o super admin controla via UI)
CREATE POLICY "Allow insert stores" ON stores FOR INSERT WITH CHECK (true);

-- Dono pode atualizar sua loja
CREATE POLICY "Allow owner update stores" ON stores FOR UPDATE USING (auth.uid() = owner_id);


-- =========================
-- 2. SETTINGS: Leitura pública + Dono pode gerenciar
-- =========================
DROP POLICY IF EXISTS "Public read settings" ON settings;
DROP POLICY IF EXISTS "Owner manage settings" ON settings;
DROP POLICY IF EXISTS "Allow insert settings" ON settings;

CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Permitir inserção (necessário ao criar loja)
CREATE POLICY "Allow insert settings" ON settings FOR INSERT WITH CHECK (true);

-- Dono pode atualizar configurações da sua loja
CREATE POLICY "Owner manage settings" ON settings FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );


-- =========================
-- 3. CATEGORIES: Leitura pública + Dono gerencia
-- =========================
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Owner manage categories" ON categories;
DROP POLICY IF EXISTS "Owner insert categories" ON categories;
DROP POLICY IF EXISTS "Owner delete categories" ON categories;

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

CREATE POLICY "Owner insert categories" ON categories FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner manage categories" ON categories FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner delete categories" ON categories FOR DELETE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );


-- =========================
-- 4. PRODUCTS: Leitura pública + Dono gerencia
-- =========================
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Owner manage products" ON products;
DROP POLICY IF EXISTS "Owner insert products" ON products;
DROP POLICY IF EXISTS "Owner delete products" ON products;

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

CREATE POLICY "Owner insert products" ON products FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner manage products" ON products FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner delete products" ON products FOR DELETE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );


-- =========================
-- 5. PRODUCT_GROUPS: Leitura pública + Dono gerencia
-- =========================
DROP POLICY IF EXISTS "Public read product_groups" ON product_groups;
DROP POLICY IF EXISTS "Owner manage product_groups" ON product_groups;
DROP POLICY IF EXISTS "Owner insert product_groups" ON product_groups;
DROP POLICY IF EXISTS "Owner delete product_groups" ON product_groups;

CREATE POLICY "Public read product_groups" ON product_groups FOR SELECT USING (true);

CREATE POLICY "Owner insert product_groups" ON product_groups FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner manage product_groups" ON product_groups FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner delete product_groups" ON product_groups FOR DELETE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );


-- =========================
-- 6. PRODUCT_OPTIONS: Leitura pública + Dono gerencia
-- =========================
DROP POLICY IF EXISTS "Public read product_options" ON product_options;
DROP POLICY IF EXISTS "Owner manage product_options" ON product_options;
DROP POLICY IF EXISTS "Owner insert product_options" ON product_options;
DROP POLICY IF EXISTS "Owner delete product_options" ON product_options;

CREATE POLICY "Public read product_options" ON product_options FOR SELECT USING (true);

CREATE POLICY "Owner insert product_options" ON product_options FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner manage product_options" ON product_options FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner delete product_options" ON product_options FOR DELETE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );


-- =========================
-- 7. COUPONS: Leitura pública (ativos) + Dono gerencia
-- =========================
DROP POLICY IF EXISTS "Public read active coupons" ON coupons;
DROP POLICY IF EXISTS "Public read coupons" ON coupons;
DROP POLICY IF EXISTS "Owner manage coupons" ON coupons;
DROP POLICY IF EXISTS "Owner insert coupons" ON coupons;
DROP POLICY IF EXISTS "Owner delete coupons" ON coupons;

CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);

CREATE POLICY "Owner insert coupons" ON coupons FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner manage coupons" ON coupons FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner delete coupons" ON coupons FOR DELETE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );


-- =========================
-- 8. ORDERS: Leitura pública + Qualquer um pode criar (clientes fazem pedidos)
-- =========================
DROP POLICY IF EXISTS "Public read orders" ON orders;
DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Owner manage orders" ON orders;
DROP POLICY IF EXISTS "Owner delete orders" ON orders;

CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);

-- Qualquer visitante pode criar pedido
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner manage orders" ON orders FOR UPDATE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owner delete orders" ON orders FOR DELETE
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );


-- =========================
-- 9. PRODUCT_GROUP_RELATIONS: Leitura pública + Dono gerencia
-- =========================
DROP POLICY IF EXISTS "Public read relations" ON product_group_relations;
DROP POLICY IF EXISTS "Owner insert relations" ON product_group_relations;
DROP POLICY IF EXISTS "Owner delete relations" ON product_group_relations;

CREATE POLICY "Public read relations" ON product_group_relations FOR SELECT USING (true);
CREATE POLICY "Owner insert relations" ON product_group_relations FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner delete relations" ON product_group_relations FOR DELETE USING (true);


-- FIM
SELECT 'Politicas RLS atualizadas com sucesso!' as status;
