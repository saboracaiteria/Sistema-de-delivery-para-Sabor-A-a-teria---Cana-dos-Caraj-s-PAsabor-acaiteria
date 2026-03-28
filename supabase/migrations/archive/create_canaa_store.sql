-- =====================================================
-- FIX: Criar loja "canaadelivery" que está faltando
-- Execute no SQL Editor do Supabase
-- 
-- PROBLEMA: A loja com slug "canaadelivery" não existe
-- na tabela stores, o que causa falha de RLS ao tentar
-- salvar settings (store.id fica null na aplicação).
--
-- INSTRUÇÃO: 
--   1. Execute este script no SQL Editor do Supabase.
--   2. Informe o email do dono desta loja para que o
--      owner_id seja corretamente associado.
--   3. Se não souber o owner_id, use o super admin.
-- =====================================================

-- PASSO 1: Verificar se a loja já existe (segurança)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM stores WHERE slug = 'canaadelivery') THEN
    RAISE NOTICE '✅ Loja canaadelivery já existe! Abortando inserção.';
  ELSE
    RAISE NOTICE '⚠️ Loja canaadelivery NÃO existe. Criando...';
  END IF;
END $$;

-- PASSO 2: Buscar o owner_id do super admin (parauapebasdeliveryoficial@gmail.com)
-- Usaremos como dono padrão. Se o dono real for outro, substitua depois.
DO $$
DECLARE
  v_owner_id UUID;
  v_store_id UUID := gen_random_uuid();
BEGIN
  -- Tentar encontrar o usuário super admin
  SELECT id INTO v_owner_id
  FROM auth.users
  WHERE email IN (
    'parauapebasdeliveryoficial@gmail.com',
    'nildopereira60@gmail.com',
    'nildoxz@gmail.com'
  )
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_owner_id IS NULL THEN
    RAISE NOTICE '⚠️ Nenhum super admin encontrado em auth.users. Verifique os emails.';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Super admin encontrado: %', v_owner_id;

  -- PASSO 3: Inserir a loja na tabela stores (se não existir)
  INSERT INTO stores (id, name, slug, owner_id, owner_email)
  SELECT 
    v_store_id,
    'Canaã Delivery',
    'canaadelivery',
    v_owner_id,
    (SELECT email FROM auth.users WHERE id = v_owner_id)
  WHERE NOT EXISTS (SELECT 1 FROM stores WHERE slug = 'canaadelivery');

  IF NOT FOUND THEN
    -- Loja já existia, pegar o ID existente
    SELECT id INTO v_store_id FROM stores WHERE slug = 'canaadelivery';
    RAISE NOTICE '✅ Loja canaadelivery já existia com id: %', v_store_id;
  ELSE
    RAISE NOTICE '✅ Loja canaadelivery criada com id: %', v_store_id;
  END IF;

  -- PASSO 4: Criar settings inicial para a loja (se não existir)
  INSERT INTO settings (store_id, store_name, store_status)
  SELECT v_store_id, 'Canaã Delivery', 'open'
  WHERE NOT EXISTS (SELECT 1 FROM settings WHERE store_id = v_store_id);

  IF FOUND THEN
    RAISE NOTICE '✅ Settings inicial criado para a loja.';
  ELSE
    RAISE NOTICE '✅ Settings já existia para a loja.';
  END IF;

END $$;

-- PASSO 5: Verificar resultado
SELECT 
  s.id as store_id,
  s.name,
  s.slug,
  s.owner_id,
  s.owner_email,
  st.store_name,
  st.store_status
FROM stores s
LEFT JOIN settings st ON st.store_id = s.id
WHERE s.slug = 'canaadelivery';

SELECT '✅ Script executado com sucesso! Loja canaadelivery criada/verificada.' as resultado;
