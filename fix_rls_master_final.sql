-- =====================================================
-- FIX RLS MASTER FINAL - SUPABASE
-- Este script unifica o acesso para MASTER ADMIN e LOJISTAS
-- =====================================================

-- 1. Definição da lista de Superadmins (Master Admins)
-- Esta variável será usada para facilitar a manutenção
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
    -- Habilitar RLS em todas as tabelas caso não estejam
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

    -- =====================================================
    -- POLÍTICAS PARA A TABELA 'STORES'
    -- =====================================================
    query := format('DROP POLICY IF EXISTS "Superadmin manage stores" ON stores;');
    EXECUTE query;
    query := format('CREATE POLICY "Superadmin manage stores" ON stores FOR ALL USING ((auth.jwt() ->> ''email'') = ANY(%L)) WITH CHECK ((auth.jwt() ->> ''email'') = ANY(%L));', superadmin_emails, superadmin_emails);
    EXECUTE query;

    DROP POLICY IF EXISTS "Public read stores" ON stores;
    CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Owner update stores" ON stores;
    CREATE POLICY "Owner update stores" ON stores FOR UPDATE
      USING (auth.uid() = owner_id);

    -- =====================================================
    -- POLÍTICAS PARA TABELAS COM 'store_id'
    -- =====================================================
    -- Tabelas: settings, categories, products, product_groups, product_options, coupons, orders, daily_visitors, suppliers, purchases, stock_items
    
    FOR tbl IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
            'settings', 'categories', 'products', 'product_groups', 'product_options', 
            'coupons', 'orders', 'daily_visitors', 'suppliers', 'purchases', 'stock_items'
        )
    LOOP
        -- Policy: Select (Public/Tenant)
        query := format('DROP POLICY IF EXISTS "Public read %I" ON %I;', tbl.table_name, tbl.table_name);
        EXECUTE query;
        query := format('CREATE POLICY "Public read %I" ON %I FOR SELECT USING (true);', tbl.table_name, tbl.table_name);
        EXECUTE query;

        -- Policy: Superadmin (Full Access)
        query := format('DROP POLICY IF EXISTS "Superadmin manage %I" ON %I;', tbl.table_name, tbl.table_name);
        EXECUTE query;
        query := format('CREATE POLICY "Superadmin manage %I" ON %I FOR ALL USING ((auth.jwt() ->> ''email'') = ANY(%L)) WITH CHECK ((auth.jwt() ->> ''email'') = ANY(%L));', tbl.table_name, tbl.table_name, superadmin_emails, superadmin_emails);
        EXECUTE query;

        -- Policy: Owner (Tenant Access) - APENAS SE A COLUNA store_id EXISTIR
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl.table_name AND column_name = 'store_id') THEN
            query := format('DROP POLICY IF EXISTS "Owner manage own %I" ON %I;', tbl.table_name, tbl.table_name);
            EXECUTE query;
            query := format('CREATE POLICY "Owner manage own %I" ON %I FOR ALL USING (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())) WITH CHECK (store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()));', tbl.table_name, tbl.table_name);
            EXECUTE query;
        END IF;
    END LOOP;

    -- =====================================================
    -- POLÍTICA ESPECIAL PARA 'product_group_relations' (N:N sem store_id direto)
    -- =====================================================
    query := format('DROP POLICY IF EXISTS "Superadmin manage relations" ON product_group_relations;');
    EXECUTE query;
    query := format('CREATE POLICY "Superadmin manage relations" ON product_group_relations FOR ALL USING ((auth.jwt() ->> ''email'') = ANY(%L)) WITH CHECK ((auth.jwt() ->> ''email'') = ANY(%L));', superadmin_emails, superadmin_emails);
    EXECUTE query;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_group_relations') THEN
        DROP POLICY IF EXISTS "Owner manage own relations" ON product_group_relations;
        CREATE POLICY "Owner manage own relations" ON product_group_relations FOR ALL
          USING (EXISTS (SELECT 1 FROM products WHERE id = product_id AND store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())))
          WITH CHECK (EXISTS (SELECT 1 FROM products WHERE id = product_id AND store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())));
    END IF;

    -- =====================================================
    -- RECUPERAÇÃO DE OWNER_ID (Vínculo com Auth Users)
    -- =====================================================
    -- Garante que se o e-mail existe no Auth, a loja aponte para o ID correto.
    UPDATE stores s
    SET owner_id = u.id
    FROM auth.users u
    WHERE s.owner_email = u.email
    AND (s.owner_id IS NULL OR s.owner_id <> u.id);

END $$;

-- Limpeza e recuperação de configurações
INSERT INTO settings (store_id, store_name, store_status)
SELECT id, name, 'open'
FROM stores
WHERE id NOT IN (SELECT store_id FROM settings)
ON CONFLICT (store_id) DO NOTHING;

SELECT '✅ RLS MASTER FINAL aplicado com sucesso! Superadmins e Lojistas configurados.' as status;
