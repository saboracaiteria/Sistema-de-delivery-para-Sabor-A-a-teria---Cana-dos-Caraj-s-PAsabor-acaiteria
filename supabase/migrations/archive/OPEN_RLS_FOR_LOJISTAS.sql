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
        'stores',
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

-- =====================================================
-- STORAGE: Abrir upload para role 'anon' no bucket product-images
-- Necessário para lojistas sem sessão Supabase Auth
-- =====================================================

-- Garantir que o bucket existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Leitura pública (manter)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

-- Upload aberto para anon e authenticated
DROP POLICY IF EXISTS "Admin upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anon_Upload_Images" ON storage.objects;
CREATE POLICY "Anon_Upload_Images" ON storage.objects 
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'product-images');

-- Update aberto
DROP POLICY IF EXISTS "Admin manage images" ON storage.objects;
DROP POLICY IF EXISTS "Anon_Update_Images" ON storage.objects;
CREATE POLICY "Anon_Update_Images" ON storage.objects 
FOR UPDATE TO anon, authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

-- Delete aberto
DROP POLICY IF EXISTS "Anon_Delete_Images" ON storage.objects;
CREATE POLICY "Anon_Delete_Images" ON storage.objects 
FOR DELETE TO anon, authenticated
USING (bucket_id = 'product-images');

DO $$ BEGIN
    RAISE NOTICE '✅ Storage policies abertas para upload sem sessão Auth!';
END $$;
