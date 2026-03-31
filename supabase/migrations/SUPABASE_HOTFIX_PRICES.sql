-- =====================================================
-- HOTFIX: ATUALIZAR PREÇOS CORRETOS NOS PRODUTOS VIVOS
-- Resolve "os preços ainda estão errados, não muda nada"
-- Execute no SQL Editor do Supabase
-- =====================================================

DO $$
BEGIN
    -- Atualiza os produtos "Açaí Tradicional" que têm o nome Copo 300ml, 400ml, 500ml na loja dele
    UPDATE public.products SET price = 14.00 WHERE name ILIKE '%300ml%' AND price != 14.00;
    UPDATE public.products SET price = 17.00 WHERE name ILIKE '%400ml%' AND price != 17.00;
    UPDATE public.products SET price = 20.00 WHERE name ILIKE '%500ml%' AND price != 20.00;

    -- Atualiza os Combos (produtos que na descrição tenham 'Sugestão')
    -- E que não sejam os copos padrão. 
    -- Ao colocar a base do combo para R$ 14,00, a opção 400ml (que cobra +3) vira R$ 17,00 automaticamente!
    UPDATE public.products 
    SET price = 14.00 
    WHERE (description ILIKE '%Sugestão%' OR category_id IN (SELECT id FROM categories WHERE title ILIKE '%Combo%'))
      AND price != 14.00
      AND name NOT ILIKE '%Ml%';

    -- Atualiza a tabela de opcões de tamanho (Garante que é +0, +3 e +6)
    UPDATE public.product_options SET price = 0.00 WHERE name ILIKE '%300ml%';
    UPDATE public.product_options SET price = 3.00 WHERE name ILIKE '%400ml%';
    UPDATE public.product_options SET price = 6.00 WHERE name ILIKE '%500ml%';

END $$;
