-- =====================================================
-- NUCLEAR RLS FIX - DEFINITIVO
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
    query TEXT;
BEGIN
    -- 1. Limpar TODAS as políticas existentes para evitar conflitos
    FOR tbl IN 
        SELECT tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'stores', 'settings', 'categories', 'products', 'product_groups', 
            'product_options', 'product_group_relations', 'coupons', 'orders', 
            'daily_visitors', 'suppliers', 'purchases', 'stock_items'
        )
    LOOP
        -- Como pode haver múltiplas políticas, vamos dar um drop em massa
        FOR query IN SELECT format('DROP POLICY IF EXISTS %I ON %I', policyname, tablename) FROM pg_policies WHERE tablename = tbl.tablename LOOP
            EXECUTE query;
        END LOOP;
    END LOOP;

    -- 2. Habilitar RLS em tudo
    ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
    ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE product_groups ENABLE ROW LEVEL SECURITY;
    ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
    ALTER TABLE product_group_relations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE daily_visitors ENABLE ROW LEVEL SECURITY;
    ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
    ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

    -- 3. Criar Políticas para STORES
    CREATE POLICY "superadmin_stores" ON stores FOR ALL 
    USING ((auth.jwt() ->> 'email') = ANY(superadmin_emails));
    
    CREATE POLICY "owner_stores" ON stores FOR UPDATE 
    USING (auth.uid() = owner_id);
    
    CREATE POLICY "public_stores" ON stores FOR SELECT 
    USING (true);

    -- 4. Criar Políticas para tabelas com store_id
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'settings', 'categories', 'products', 'product_groups', 'product_options', 
            'coupons', 'orders', 'daily_visitors', 'suppliers', 'purchases', 'stock_items'
        )
    LOOP
        -- Superadmin
        EXECUTE format('CREATE POLICY "sa_%I" ON %I FOR ALL USING ((auth.jwt() ->> ''email'') = ANY(%L))', tbl.table_name, tbl.table_name, superadmin_emails);
        
        -- Owner (Usando EXISTS para performance e clareza)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl.table_name AND column_name = 'store_id') THEN
            EXECUTE format('CREATE POLICY "ow_%I" ON %I FOR ALL USING (EXISTS (SELECT 1 FROM stores WHERE id = store_id AND owner_id = auth.uid()))', tbl.table_name, tbl.table_name);
        END IF;

        -- Public Read
        EXECUTE format('CREATE POLICY "pb_%I" ON %I FOR SELECT USING (true)', tbl.table_name, tbl.table_name);
    END LOOP;

    -- 5. Política Especial para Relations (N:N)
    CREATE POLICY "sa_relations" ON product_group_relations FOR ALL 
    USING ((auth.jwt() ->> 'email') = ANY(superadmin_emails));
    
    CREATE POLICY "ow_relations" ON product_group_relations FOR ALL 
    USING (EXISTS (SELECT 1 FROM products p JOIN stores s ON p.store_id = s.id WHERE p.id = product_id AND s.owner_id = auth.uid()));

    -- 6. Garantir vínculo de owner_id
    UPDATE stores s SET owner_id = u.id FROM auth.users u WHERE s.owner_email = u.email AND (s.owner_id IS NULL OR s.owner_id <> u.id);

END $$;
