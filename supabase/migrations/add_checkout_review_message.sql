-- Adicionar a nova coluna para a mensagem customizável no checkout
ALTER TABLE settings ADD COLUMN IF NOT EXISTS checkout_review_message TEXT;
