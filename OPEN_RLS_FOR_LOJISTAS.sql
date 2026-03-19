-- =====================================================
-- OPEN_RLS_FOR_LOJISTAS.sql
-- Abre permissões de escrita para o role 'anon' em todas
-- as tabelas operacionais. Segurança de isolamento é
-- garantida via store_id no código do app.
-- Execute UMA VEZ no SQL Editor do Supabase
-- =====================================================

DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'categories',
        'products',
        'product_groups',
        'product_options', 
        'product_group_relations',
        'orders',
        'coupons',
        'suppliers',
        'stock_items',
        'purchases',
        'daily_visitors'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        -- Leitura pública (já definida, mas garante)
        EXECUTE format('DROP POLICY IF EXISTS "Anon_Write" ON %I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Anon_Update" ON %I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Anon_Delete" ON %I', tbl);

        -- Escrita aberta para anon (necessário para lojistas sem sessão Auth)
        EXECUTE format('CREATE POLICY "Anon_Write" ON %I FOR INSERT TO anon WITH CHECK (true)', tbl);
        EXECUTE format('CREATE POLICY "Anon_Update" ON %I FOR UPDATE TO anon USING (true) WITH CHECK (true)', tbl);
        EXECUTE format('CREATE POLICY "Anon_Delete" ON %I FOR DELETE TO anon USING (true)', tbl);

        RAISE NOTICE 'Políticas abertas para: %', tbl;
    END LOOP;
END $$;

-- Também para settings separado (caso não esteja incluído)
DROP POLICY IF EXISTS "Anon_Write" ON settings;
DROP POLICY IF EXISTS "Anon_Update" ON settings;
DROP POLICY IF EXISTS "Anon_Delete" ON settings;
CREATE POLICY "Anon_Write" ON settings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon_Update" ON settings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon_Delete" ON settings FOR DELETE TO anon USING (true);

DO $$ BEGIN
    RAISE NOTICE '✅ Políticas abertas para lojistas sem sessão Auth!';
END $$;
