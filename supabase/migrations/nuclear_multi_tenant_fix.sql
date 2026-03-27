-- =====================================================
-- NUCLEAR MULTI-TENANT FIX: SETTINGS & RLS
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. Limpeza e Reestruturação da Tabela Settings
-- Vamos migrar os dados para uma estrutura nova sem o limite de linha única do ID=1

-- Criar tabela temporária para backup dos dados existentes
CREATE TEMP TABLE settings_backup AS SELECT * FROM settings;

-- Dropar a tabela antiga (isso remove restrições antigas como single_row e id=1)
DROP TABLE settings CASCADE;

-- Recriar a tabela settings com estrutura multi-tenant correta
CREATE TABLE settings (
  store_id UUID PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL DEFAULT 'Minha Loja',
  logo_url TEXT,
  banner_url TEXT,
  logo_shape TEXT DEFAULT 'circle',
  whatsapp_number TEXT,
  store_status TEXT DEFAULT 'open' CHECK (store_status IN ('open', 'closed')),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  delivery_only BOOLEAN DEFAULT false,
  opening_hours JSONB,
  theme_colors JSONB,
  closed_message TEXT,
  open_message TEXT,
  delivery_time TEXT,
  pickup_time TEXT,
  delivery_close_time TEXT,
  instagram_url TEXT,
  business_address TEXT,
  copyright_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurar dados do backup (se houver store_id válido)
INSERT INTO settings (
  store_id, store_name, logo_url, banner_url, whatsapp_number, store_status, delivery_fee, delivery_only, opening_hours
)
SELECT 
  COALESCE(store_id, (SELECT id FROM stores WHERE slug = 'sabor-acaiteria' LIMIT 1)), 
  store_name, logo_url, banner_url, whatsapp_number, store_status, delivery_fee, delivery_only, opening_hours
FROM settings_backup
WHERE store_id IS NOT NULL OR (SELECT COUNT(*) FROM stores WHERE slug = 'sabor-acaiteria') > 0;

-- Garantir que TODAS as lojas tenham um registro em settings
INSERT INTO settings (store_id, store_name, store_status)
SELECT id, name, 'open'
FROM stores
WHERE id NOT IN (SELECT store_id FROM settings)
ON CONFLICT (store_id) DO NOTHING;

-- 2. Habilitar RLS e Políticas
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- SELECT Público (Qualquer um pode ver as configurações da loja)
DROP POLICY IF EXISTS "Public read settings" ON settings;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Gerenciamento pelo Dono ou Super Admin
DROP POLICY IF EXISTS "Admin manage settings" ON settings;
CREATE POLICY "Admin manage settings" ON settings FOR ALL
USING (
  store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  OR 
  (auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com')
)
WITH CHECK (
  store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  OR 
  (auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com')
);

-- 3. Configurações de Storage (Bucket product-images)
-- Garantir o bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas de Storage
DROP POLICY IF EXISTS "Public Read Images" ON storage.objects;
CREATE POLICY "Public Read Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins manage images" ON storage.objects;
CREATE POLICY "Admins manage images" ON storage.objects FOR ALL
USING (
  bucket_id = 'product-images' 
  AND (
    (auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com')
    OR auth.role() = 'authenticated'
  )
)
WITH CHECK (
  bucket_id = 'product-images' 
  AND (
    (auth.jwt() ->> 'email') IN ('parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com', 'nildoxz@gmail.com')
    OR auth.role() = 'authenticated'
  )
);

-- 4. Sync Database Schema Cache
NOTIFY pgrst, 'reload schema';

SELECT 'NUCLEAR MULTI-TENANT FIX APPLIED! ✅' as status;
