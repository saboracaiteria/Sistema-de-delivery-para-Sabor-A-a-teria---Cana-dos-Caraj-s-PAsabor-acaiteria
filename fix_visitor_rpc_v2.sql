-- =====================================================
-- FIX: Criar função RPC increment_visitor_count
-- Execute no SQL Editor do Supabase
-- Erro: POST /rpc/increment_visitor_count → 404
-- =====================================================

-- Garantir que a tabela daily_visitors tenha store_id
ALTER TABLE daily_visitors DROP CONSTRAINT IF EXISTS daily_visitors_pkey;
ALTER TABLE daily_visitors ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE daily_visitors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Recriar primary key composta
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'daily_visitors_pkey' AND conrelid = 'daily_visitors'::regclass
  ) THEN
    ALTER TABLE daily_visitors ADD PRIMARY KEY (date, store_id);
  END IF;
END $$;

-- Criar/atualizar a função increment_visitor_count com p_store_id
CREATE OR REPLACE FUNCTION increment_visitor_count(p_store_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_visitors (date, store_id, count, updated_at)
  VALUES (CURRENT_DATE, p_store_id, 1, NOW())
  ON CONFLICT (date, store_id)
  DO UPDATE SET 
    count = daily_visitors.count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permissões
GRANT EXECUTE ON FUNCTION increment_visitor_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_visitor_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_visitor_count(UUID) TO service_role;

SELECT '✅ Função increment_visitor_count(UUID) criada com sucesso!' as status;
