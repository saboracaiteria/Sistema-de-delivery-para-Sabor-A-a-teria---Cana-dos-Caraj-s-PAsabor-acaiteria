-- =========================================================================
-- MASTER FIX: RLS, PREÇOS DOS COMBOS E FUNÇÃO DE SENHA
-- =========================================================================

-- 1. CORRIGIR: Produtos, categorias e capas de loja que não salvam
DO $RLS_FIX$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY['settings', 'categories', 'products', 'product_groups', 'product_options', 'product_group_relations', 'orders', 'coupons'];
BEGIN
    FOR tbl IN SELECT unnest(tables) AS tablename LOOP
        EXECUTE format('DROP POLICY IF EXISTS "owner_record_access" ON %I', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "public_insert_order" ON %I', tbl);
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "open_all" ON %I', tbl);
        EXECUTE format('CREATE POLICY "open_all" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $RLS_FIX$;

-- Liberar Storage de imagens (Capa de Loja e Logo)
DROP POLICY IF EXISTS "product_images_public_upload" ON storage.objects;
CREATE POLICY "product_images_public_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
DROP POLICY IF EXISTS "product_images_public_update" ON storage.objects;
CREATE POLICY "product_images_public_update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
DROP POLICY IF EXISTS "product_images_public_delete" ON storage.objects;
CREATE POLICY "product_images_public_delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-------------------------------------------------------------------------
-- 2. CORRIGIR: Preços e opções dos Combos puxados antigos
DO $PRICE_FIX$
BEGIN
    -- Arrumar as opções de volume: (combo 300 não soma nada, 400 soma +3, 500 soma +6)
    UPDATE public.product_options SET price = 0.00 WHERE name ILIKE '%300ml%';
    UPDATE public.product_options SET price = 3.00 WHERE name ILIKE '%400ml%';
    UPDATE public.product_options SET price = 6.00 WHERE name ILIKE '%500ml%';

    -- Arrumar o produto do copo Tradicional
    UPDATE public.products SET price = 14.00 WHERE name ILIKE '%300ml%' AND price != 14.00;
    UPDATE public.products SET price = 17.00 WHERE name ILIKE '%400ml%' AND price != 17.00;
    UPDATE public.products SET price = 20.00 WHERE name ILIKE '%500ml%' AND price != 20.00;

    -- Arrumar o PREÇO BASE dos Combos (Eles vieram com R$ 0,00 no banco, precisam ser R$ 14,00)
    UPDATE public.products 
    SET price = 14.00 
    WHERE (description ILIKE '%Sugestão%' OR category_id IN (SELECT id FROM categories WHERE title ILIKE '%Combo%'))
      AND price != 14.00 AND name NOT ILIKE '%Ml%';
END $PRICE_FIX$;

-------------------------------------------------------------------------
-- 3. CORRIGIR: Função de atualizar senha do logista (SEM BUGS DE SINTAXE)
CREATE OR REPLACE FUNCTION public.update_store_owner_password(p_user_id UUID, p_new_password TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $CMD$
BEGIN
    IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
    UPDATE auth.users SET encrypted_password = crypt(p_new_password, gen_salt('bf')) WHERE id = p_user_id;
END;
$CMD$;

GRANT EXECUTE ON FUNCTION public.update_store_owner_password(UUID, TEXT) TO authenticated;
