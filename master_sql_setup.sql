-- =====================================================
-- SABOR AÇAITERIA - SETUP COMPLETO DO BANCO DE DADOS
-- =====================================================
-- Sistema de Delivery - Canaã dos Carajás-PA 2025-2026
-- 
-- Este arquivo consolida TODOS os scripts SQL do projeto
-- na ordem correta de execução.
-- 
-- ⚡ PRONTO PARA USAR: Copie e cole tudo no SQL Editor
-- do Supabase e execute de uma vez!
-- 
-- 📋 Conteúdo:
--   1. Schema Base (Categorias, Produtos, Pedidos, etc.)
--   2. Configurações e Rodapé
--   3. Sistema de Estoque
--   4. Storage (Bucket de Imagens para Produtos, Logo e Capa)
--   5. Atualizações Recentes (2025-2026, Cores, Status)
-- =====================================================

-- =====================================================
-- 1. ESTRUTURA BASE (TABELAS)
-- =====================================================

-- 1.1. CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2. GRUPOS DE OPÇÕES (complementos, sabores, etc)
CREATE TABLE IF NOT EXISTS product_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  min INTEGER NOT NULL DEFAULT 0,
  max INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3. OPÇÕES DENTRO DOS GRUPOS
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES product_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.4. PRODUTOS
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.5. RELAÇÃO N:N entre PRODUTOS e GRUPOS
CREATE TABLE IF NOT EXISTS product_group_relations (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES product_groups(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, group_id)
);

-- 1.6. CUPONS DE DESCONTO
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  min_order_value DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.7. PEDIDOS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL UNIQUE,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('DELIVERY', 'PICKUP')),
  address TEXT,
  payment_method TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  items_summary TEXT,
  full_details JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'delivery', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.8. CONFIGURAÇÕES GLOBAIS
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name TEXT NOT NULL DEFAULT 'Sabor Açaiteria',
  logo_url TEXT,
  banner_url TEXT,
  logo_shape VARCHAR(10) DEFAULT 'circle' CHECK (logo_shape IN ('circle', 'rectangle')),
  whatsapp_number TEXT,
  store_status TEXT DEFAULT 'auto' CHECK (store_status IN ('open', 'closed', 'auto')),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  delivery_only BOOLEAN DEFAULT false,
  opening_hours JSONB,
  -- Mensagens e Textos
  closed_message TEXT DEFAULT '🔴 Loja Fechada',
  open_message TEXT DEFAULT '🟢 Aberto até às 23:00',
  delivery_time TEXT DEFAULT '40min à 1h',
  pickup_time TEXT DEFAULT '20min à 45min',
  delivery_close_time TEXT DEFAULT '21:00',
  -- Rodapé e Temas
  instagram_url TEXT DEFAULT 'https://www.instagram.com/sabor_acaiteria/',
  business_address TEXT DEFAULT 'Canaã dos Carajás - PA 2025-2026',
  copyright_text TEXT DEFAULT '© 2025-2026 Sabor Açaiteria',
  theme_colors JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Inserir configurações padrão se não existirem
INSERT INTO settings (id, store_name, store_status, delivery_fee, delivery_only, opening_hours)
VALUES (
  1,
  'Sabor Açaiteria',
  'auto',
  5.00,
  false,
  '[
    {"dayOfWeek": 0, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 1, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 2, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 3, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 4, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 5, "open": "14:00", "close": "23:00", "enabled": true},
    {"dayOfWeek": 6, "open": "14:00", "close": "23:00", "enabled": true}
  ]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name, -- Garante nome atualizado
  business_address = 'Canaã dos Carajás - PA 2025-2026',
  copyright_text = '© 2025-2026 Sabor Açaiteria';

-- =====================================================
-- 2. SISTEMA DE ESTOQUE
-- =====================================================

-- 2.1. FORNECEDORES
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2. ITENS DE ESTOQUE (Vinculado a Produtos)
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id)
);

-- 2.3. COMPRAS / ENTRADAS
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  items JSONB, -- Detalhes: [{ productId, quantity, cost }]
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. STORAGE (IMAGENS)
-- =====================================================
-- Configura o bucket 'product-images' usado para produtos, logo e banner

-- 3.1. Criar o bucket (GARANTINDO QUE SEJA PÚBLICO)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 52428800, '{"image/png","image/jpeg","image/jpg","image/webp"}')
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = '{"image/png","image/jpeg","image/jpg","image/webp"}';

-- 3.2. Limpar políticas antigas
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
DROP POLICY IF EXISTS "Anon Insert" ON storage.objects; -- Remover possíveis nomes alternativos

-- 3.3. Criar Políticas de Segurança (Públicas para praticidade)
-- IMPORTANTE: "TO public" garante que usuários anônimos consigam usar

-- Permitir LEITURA para todos (anon e authenticated)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING ( bucket_id = 'product-images' );

-- Permitir UPLOAD para todos (anon e authenticated)
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT TO public WITH CHECK ( bucket_id = 'product-images' );

-- Permitir ATUALIZAÇÃO para todos
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE TO public USING ( bucket_id = 'product-images' );

-- Permitir DELEÇÃO para todos
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE TO public USING ( bucket_id = 'product-images' );

-- =====================================================
-- 4. SEGURANÇA E RELAÇÕES (RLS & INDEX)
-- =====================================================

-- Índices
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_options_group ON product_options(group_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(date DESC);

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_group_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública (Tudo liberado para leitura)
DROP POLICY IF EXISTS "Public read all" ON categories; CREATE POLICY "Public read all" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read all" ON products; CREATE POLICY "Public read all" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read all" ON product_groups; CREATE POLICY "Public read all" ON product_groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read all" ON product_options; CREATE POLICY "Public read all" ON product_options FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read all" ON product_group_relations; CREATE POLICY "Public read all" ON product_group_relations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read all" ON settings; CREATE POLICY "Public read all" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public read active" ON coupons; CREATE POLICY "Public read active" ON coupons FOR SELECT USING (active = true);

-- Políticas de Escrita Pública (Liberado para app sem login complexo)
-- EM PRODUÇÃO, IDEALMENTE RESTRINGIR, MAS SOLICITADO PARA PRATICIDADE
DROP POLICY IF EXISTS "Public write categories" ON categories;
CREATE POLICY "Public write categories" ON categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Public write products" ON products;
CREATE POLICY "Public write products" ON products FOR ALL USING (true);

DROP POLICY IF EXISTS "Public write product_groups" ON product_groups;
CREATE POLICY "Public write product_groups" ON product_groups FOR ALL USING (true);

DROP POLICY IF EXISTS "Public write product_options" ON product_options;
CREATE POLICY "Public write product_options" ON product_options FOR ALL USING (true);

DROP POLICY IF EXISTS "Public write product_group_relations" ON product_group_relations;
CREATE POLICY "Public write product_group_relations" ON product_group_relations FOR ALL USING (true);

DROP POLICY IF EXISTS "Public write coupons" ON coupons;
CREATE POLICY "Public write coupons" ON coupons FOR ALL USING (true);

DROP POLICY IF EXISTS "Public write orders" ON orders;
CREATE POLICY "Public write orders" ON orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Public write settings" ON settings;
CREATE POLICY "Public write settings" ON settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Public write suppliers" ON suppliers;
CREATE POLICY "Public write suppliers" ON suppliers FOR ALL USING (true);

DROP POLICY IF EXISTS "Public write stock_items" ON stock_items;
CREATE POLICY "Public write stock_items" ON stock_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Public write purchases" ON purchases;
CREATE POLICY "Public write purchases" ON purchases FOR ALL USING (true);

-- =====================================================
-- 5. TRIGGERS (UPDATED_AT AUTOMÁTICO)
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_categories_updated ON categories;
CREATE TRIGGER tr_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_products_updated ON products;
CREATE TRIGGER tr_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_groups_updated ON product_groups;
CREATE TRIGGER tr_groups_updated BEFORE UPDATE ON product_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_options_updated ON product_options;
CREATE TRIGGER tr_options_updated BEFORE UPDATE ON product_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_settings_updated ON settings;
CREATE TRIGGER tr_settings_updated BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FINALIZADO! ✅
-- =====================================================
SELECT 'Sabor Açaiteria - Banco de Dados Configurado com Sucesso! 🚀' AS status;
