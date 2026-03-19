-- =====================================================
-- FINAL RLS FIX V3 - SUPABASE
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
    -- 1. Limpar TODAS as políticas existentes para evitar conflitos
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename IN ('stores', 'settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'orders', 'coupons', 'daily_visitors', 'suppliers', 'purchases', 'stock_items')
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tbl.tablename);
        -- Remover políticas existentes
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl.tablename LOOP
             EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl.tablename);
        END LOOP;
    END LOOP;

    -- 2. Habilitar RLS em massa
    FOR tbl IN SELECT unnest(ARRAY['stores', 'settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'orders', 'coupons', 'daily_visitors', 'suppliers', 'purchases', 'stock_items']) AS tablename LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl.tablename);
    END LOOP;

    -- 3. POLÍTICA MASTER ADMIN (Acesso Total)
    FOR tbl IN SELECT unnest(ARRAY['stores', 'settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'orders', 'coupons', 'daily_visitors', 'suppliers', 'purchases', 'stock_items']) AS tablename LOOP
        EXECUTE format('
            CREATE POLICY "Master_Admin_Full_Access" ON %I
            FOR ALL
            TO authenticated
            USING ((auth.jwt() ->> ''email'') = ANY(%L))
            WITH CHECK ((auth.jwt() ->> ''email'') = ANY(%L))
        ', tbl.tablename, superadmin_emails, superadmin_emails);
    END LOOP;

    -- 4. POLÍTICA PÚBLICA (Leitura para clientes)
    FOR tbl IN SELECT unnest(ARRAY['stores', 'settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'coupons']) AS tablename LOOP
        EXECUTE format('
            CREATE POLICY "Public_Read_Access" ON %I
            FOR SELECT
            TO anon, authenticated
            USING (true)
        ', tbl.tablename);
    END LOOP;

    -- 5. POLÍTICA DE DONO (Lojista) - ESPECÍFICA PARA STORES
    CREATE POLICY "Owner_Stores_Access" ON stores
    FOR ALL
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

    -- 6. POLÍTICA DE DONO (Lojista) - PARA TABELAS COM store_id
    FOR tbl IN SELECT unnest(ARRAY['settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'orders', 'coupons', 'daily_visitors', 'suppliers', 'purchases', 'stock_items']) AS tablename LOOP
        EXECUTE format('
            CREATE POLICY "Owner_Table_Access" ON %I
            FOR ALL
            TO authenticated
            USING (store_id IN (SELECT s.id FROM stores s WHERE s.owner_id = auth.uid()))
            WITH CHECK (store_id IN (SELECT s.id FROM stores s WHERE s.owner_id = auth.uid()))
        ', tbl.tablename);
    END LOOP;

END $$;

-- Sincronizar owner_id caso algum ainda esteja nulo (baseado no owner_email)
UPDATE stores s 
SET owner_id = u.id 
FROM auth.users u 
WHERE s.owner_email = u.email AND (s.owner_id IS NULL OR s.owner_id <> u.id);

-- Função de Debug (Opcional, mas útil)
CREATE OR REPLACE FUNCTION debug_rls_access(p_table text, p_store_id uuid)
RETURNS table(has_access boolean, current_user_id uuid, store_owner_id uuid) 
LANGUAGE plpgsql
SECURITY INVOKER -- Roda com as permissões de quem chama
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        EXISTS (SELECT 1 FROM stores WHERE id = p_store_id AND owner_id = auth.uid()) as has_access,
        auth.uid() as current_user_id,
        (SELECT owner_id FROM stores WHERE id = p_store_id) as store_owner_id;
END;
$$;
