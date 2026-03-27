-- =====================================================
-- FINAL MULTI-TENANT ISOLATION FIX
-- Isolates visitors, suppliers, and purchases by store_id
-- =====================================================

-- 1. DAILY_VISITORS
-- Add store_id and change primary key to composite (date, store_id)
ALTER TABLE daily_visitors DROP CONSTRAINT IF EXISTS daily_visitors_pkey;
ALTER TABLE daily_visitors ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE daily_visitors ADD PRIMARY KEY (date, store_id);

-- Update increment function to be store-aware
CREATE OR REPLACE FUNCTION increment_visitor_count(p_store_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_visitors (date, store_id, count)
  VALUES (CURRENT_DATE, p_store_id, 1)
  ON CONFLICT (date, store_id)
  DO UPDATE SET 
    count = daily_visitors.count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. SUPPLIERS
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_suppliers_store ON suppliers(store_id);

-- 3. PURCHASES
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_purchases_store ON purchases(store_id);

-- 4. RLS UPDATES
-- Visitors
DROP POLICY IF EXISTS "Public read visitors" ON daily_visitors;
CREATE POLICY "Public read visitors" ON daily_visitors FOR SELECT USING (true);

-- Suppliers
DROP POLICY IF EXISTS "Public read suppliers" ON suppliers;
CREATE POLICY "Public read suppliers" ON suppliers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owner manage suppliers" ON suppliers;
CREATE POLICY "Owner manage suppliers" ON suppliers FOR ALL 
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- Purchases
DROP POLICY IF EXISTS "Public read purchases" ON purchases;
CREATE POLICY "Public read purchases" ON purchases FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owner manage purchases" ON purchases;
CREATE POLICY "Owner manage purchases" ON purchases FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- Permissions
GRANT EXECUTE ON FUNCTION increment_visitor_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_visitor_count(UUID) TO authenticated;

-- 2. ITENS DE ESTOQUE (Vinculado a Produtos)
ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
CREATE INDEX IF NOT EXISTS idx_stock_items_store ON stock_items(store_id);

-- RLS Update for stock_items
DROP POLICY IF EXISTS "Public read stock_items" ON stock_items;
CREATE POLICY "Public read stock_items" ON stock_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Owner manage stock_items" ON stock_items;
CREATE POLICY "Owner manage stock_items" ON stock_items FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

-- 4. RLS Update for daily_visitors (Defense in Depth)
DROP POLICY IF EXISTS "Owner manage visitors" ON daily_visitors;
CREATE POLICY "Owner manage visitors" ON daily_visitors FOR ALL
  USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()))
  WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));

SELECT 'Reforço de isolamento concluído! ✅' as status;
