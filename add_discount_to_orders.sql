-- =====================================================
-- ADICIONAR COLUNAS DE DESCONTO E ORÇAMENTO À TABELA ORDERS
-- =====================================================

-- 1. Adicionar colunas se não existirem
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_quote BOOLEAN DEFAULT false;

-- 2. Comentários para documentação
COMMENT ON COLUMN orders.discount_percent IS 'Percentual de desconto aplicado pelo lojista (0-100)';
COMMENT ON COLUMN orders.is_quote IS 'Define se o registro é um orçamento (true) ou um pedido real (false)';

DO $$ BEGIN
    RAISE NOTICE '✅ Colunas discount_percent e is_quote adicionadas com sucesso!';
END $$;
