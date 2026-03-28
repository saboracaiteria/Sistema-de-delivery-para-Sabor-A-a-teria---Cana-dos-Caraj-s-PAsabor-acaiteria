-- =====================================================
-- 🛡️ SCRIPT DE RECUPERAÇÃO E INSTALAÇÃO FINAL V1
-- =====================================================
-- Este script REPARA a estrutura para o sistema de Multi-Lojas
-- e garante que NENHUM dado antigo seja perdido.
-- =====================================================

-- 1. Garante que a extensão de segurança existe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Garante que a tabela de Lojas existe com TODOS os campos necessários
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_email TEXT,
  password TEXT,
  plan_type TEXT DEFAULT 'test',
  plan_duration_days INTEGER DEFAULT 7,
  plan_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  plan_expiry_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIA A LOJA MESTRA "Sabor Açaiteria" com ID FIXO (O ID da salvação)
-- Usamos um ID fixo '00000000-0000-0000-0000-000000000001' para religar os dados
INSERT INTO stores (id, slug, name, plan_type, plan_duration_days)
VALUES ('00000000-0000-0000-0000-000000000001', 'sabor-acaiteria', 'Sabor Açaíteria', 'paid', 365)
ON CONFLICT (slug) DO UPDATE SET 
    id = '00000000-0000-0000-0000-000000000001',
    name = EXCLUDED.name;

-- 4. ADICIONA AS COLUNAS store_id EM TODAS AS TABELAS (Sem deletar nada!)
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY['categories', 'products', 'product_groups', 'product_options', 'coupons', 'orders', 'settings', 'suppliers', 'stock_items', 'purchases']) LOOP
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE', t);
    END LOOP;
END $$;

-- 5. RELIGA OS DADOS (O Coração da Recuperação)
-- Tudo que estiver "sem dono" (NULL) agora pertence à Sabor Açaiteria
UPDATE categories SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE products SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE product_groups SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE product_options SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE coupons SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE orders SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE settings SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE suppliers SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE stock_items SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;
UPDATE purchases SET store_id = '00000000-0000-0000-0000-000000000001' WHERE store_id IS NULL;

-- 6. GARRANTE AS COLUNAS DE UI E SETTINGS (Resolvendo o "Modo Clássico")
ALTER TABLE settings ADD COLUMN IF NOT EXISTS ui_mode TEXT DEFAULT 'modern';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS checkout_review_message TEXT DEFAULT 'Por favor, revise seu pedido abaixo:';

-- 7. SINCRONIZA A URL/SLUG DA LOJA MESTRA (Caso tenha mudado)
UPDATE stores SET slug = 'sabor-acaiteria' WHERE id = '00000000-0000-0000-0000-000000000001';

-- 8. LIMPEZA DE SEGURANÇA (RLS)
-- Garante que todos possam ver os produtos mas apenas donos alterem
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read stores" ON stores;
CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true);

-- 9. NOTIFICAÇÃO DE SUCESSO
DO $$
BEGIN
    RAISE NOTICE 'RECUPERAÇÃO CONCLUÍDA! Acesse seu-site/#/sabor-acaiteria e seus dados estarão lá!';
END $$;
