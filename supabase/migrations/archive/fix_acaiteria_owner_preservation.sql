-- =====================================================
-- FIX: VINCULAR DONO À AÇAÍTERIA (SALA MESTRA) - V2
-- Corregido para a nova estrutura do banco (sem coluna 'id')
-- =====================================================

DO $$
DECLARE
    target_owner_id UUID;
    acaiteria_store_id UUID;
BEGIN
    -- 1. Pega o ID da loja Açaíteria
    SELECT id INTO acaiteria_store_id FROM stores WHERE slug = 'sabor-acaiteria';

    IF acaiteria_store_id IS NULL THEN
        RAISE EXCEPTION '❌ Erro: Loja sabor-acaiteria não encontrada no banco.';
    END IF;

    -- 2. Tenta pegar o dono da loja que sabemos que funciona (paulista-mat)
    SELECT owner_id INTO target_owner_id 
    FROM stores 
    WHERE slug = 'paulista-mat' 
    AND owner_id IS NOT NULL
    LIMIT 1;

    -- 3. Se não encontrar a paulista, pega o primeiro dono disponível no banco
    IF target_owner_id IS NULL THEN
        SELECT owner_id INTO target_owner_id 
        FROM stores 
        WHERE owner_id IS NOT NULL
        LIMIT 1;
    END IF;

    -- 4. Aplica o dono à Sabor Açaíteria
    IF target_owner_id IS NOT NULL THEN
        UPDATE stores 
        SET owner_id = target_owner_id 
        WHERE id = acaiteria_store_id;
        
        RAISE NOTICE '✅ Dono da Açaíteria vinculado com sucesso ao ID: %', target_owner_id;
    ELSE
        RAISE EXCEPTION '❌ Erro: Nenhum dono de loja encontrado no banco. Faça login no painel pelo menos uma vez.';
    END IF;

    -- 5. Garante que existe uma entrada na tabela settings para a Açaíteria
    -- Se não existir, cria. Se existir, não mexe (para não perder dados).
    INSERT INTO settings (store_id, store_name, store_status)
    VALUES (acaiteria_store_id, 'Sabor Açaíteria', 'open')
    ON CONFLICT (store_id) DO NOTHING;

    RAISE NOTICE '✅ Configurações da Açaíteria verificadas/criadas sem perda de dados.';

END $$;
