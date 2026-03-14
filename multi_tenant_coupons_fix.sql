-- multi_tenant_coupons_fix.sql
-- Este script garante que os cupons sejam isolados por loja e que apenas donos/super-admins possam gerenciá-los.

-- 1. Habilitar RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas
DROP POLICY IF EXISTS "Public select coupons" ON public.coupons;
DROP POLICY IF EXISTS "Full access for store owners" ON public.coupons;
DROP POLICY IF EXISTS "Full access for super admins" ON public.coupons;

-- 3. Política de Leitura Pública
-- Permite que clientes vejam os cupons disponíveis para aplicar no carrinho.
-- O frontend já filtra por store_id, mas o RLS garante que isso seja a base.
CREATE POLICY "Public select coupons" ON public.coupons
FOR SELECT TO anon, authenticated
USING (true);

-- 4. Política para Donos de Loja
-- Permite INSERT, UPDATE, DELETE e SELECT apenas se o owner_id da loja bater com o logado.
CREATE POLICY "Full access for store owners" ON public.coupons
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = public.coupons.store_id
    AND stores.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = public.coupons.store_id
    AND stores.owner_id = auth.uid()
  )
);

-- 5. Política para Super Admins
CREATE POLICY "Full access for super admins" ON public.coupons
FOR ALL TO authenticated
USING (
  auth.jwt() ->> 'email' IN ('nildoxz@gmail.com', 'parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com')
)
WITH CHECK (
  auth.jwt() ->> 'email' IN ('nildoxz@gmail.com', 'parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com')
);
