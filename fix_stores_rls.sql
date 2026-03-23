-- =====================================================
-- fix_stores_rls.sql
-- Abre permissões de escrita para 'anon' na tabela 'stores'
-- Essa tabela estava faltando no OPEN_RLS_FOR_LOJISTAS.sql
-- Execute UMA VEZ no SQL Editor do Supabase
-- =====================================================

-- Garantir que RLS está habilitado
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Remover policies conflitantes
DROP POLICY IF EXISTS "Anon_Write" ON stores;
DROP POLICY IF EXISTS "Anon_Update" ON stores;
DROP POLICY IF EXISTS "Anon_Delete" ON stores;
DROP POLICY IF EXISTS "Allow insert stores" ON stores;
DROP POLICY IF EXISTS "Public Read" ON stores;

-- Leitura pública
CREATE POLICY "Public_Read" ON stores
FOR SELECT TO anon, authenticated
USING (true);

-- Escrita aberta para anon (necessário para superadmin criar lojas sem sessão Auth)
CREATE POLICY "Anon_Write" ON stores
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Update aberto
CREATE POLICY "Anon_Update" ON stores
FOR UPDATE TO anon, authenticated
USING (true) WITH CHECK (true);

-- Delete aberto
CREATE POLICY "Anon_Delete" ON stores
FOR DELETE TO anon, authenticated
USING (true);

DO $$ BEGIN
    RAISE NOTICE '✅ Políticas de RLS abertas para tabela stores!';
END $$;
