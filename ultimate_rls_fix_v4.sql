-- =====================================================
-- ULTIMATE RLS SIMPLIFICATION V4
-- =====================================================

DO $$
DECLARE
    superadmin_emails TEXT[] := ARRAY[
        'parauapebasdeliveryoficial@gmail.com',
        'nildopereira60@gmail.com',
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
    ];
    tbl RECORD;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'orders', 'coupons', 'daily_visitors', 'suppliers', 'purchases', 'stock_items']) AS tablename LOOP
        -- Remover políticas anteriores V3
        EXECUTE format('DROP POLICY IF EXISTS "Owner_Table_Access" ON %I', tbl.tablename);
        
        -- Criar nova política ultra simples sem subqueries complexas se possível
        -- Mas precisamos saber o store_id.
        -- O UID do usuário deve existir no stores.owner_id.
        
        EXECUTE format('
            CREATE POLICY "Owner_Direct_Access" ON %I
            FOR ALL
            TO authenticated
            USING (
                (auth.jwt() ->> ''email'') = ANY(%L)
                OR 
                EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND s.owner_id = auth.uid())
            )
            WITH CHECK (
                (auth.jwt() ->> ''email'') = ANY(%L)
                OR 
                EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND s.owner_id = auth.uid())
            )
        ', tbl.tablename, superadmin_emails, superadmin_emails);
    END LOOP;
END $$;
