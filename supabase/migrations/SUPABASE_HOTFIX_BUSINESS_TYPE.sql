-- =====================================================
-- HOTFIX: ADICIONAR CAMPO BUSINESS_TYPE À TABELA STORES
-- Resolve a necessidade de categorizar os ramos das lojas
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. Adicionar o tipo enum se desejar maior segurança (opcional)
-- DROP TYPE IF EXISTS business_activity_type;
-- CREATE TYPE business_activity_type AS ENUM ('livre', 'acaiteria', 'sorveteria');

-- 2. Adicionar a coluna à tabela stores
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'acaiteria';

-- 3. Atualizar lojas existentes para 'acaiteria' (opcional, como já definimos o default)
UPDATE stores SET business_type = 'acaiteria' WHERE business_type IS NULL;
