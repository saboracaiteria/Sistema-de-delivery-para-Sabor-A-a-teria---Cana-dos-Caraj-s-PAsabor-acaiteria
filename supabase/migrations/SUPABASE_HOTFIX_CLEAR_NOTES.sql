-- =====================================================
-- HOTFIX: LIMPAR PLACEHOLDERS DE OBSERVAÇÃO
-- Remove exemplos de açaí de todas as lojas existentes
-- Execute no SQL Editor do Supabase
-- =====================================================

UPDATE settings 
SET note_placeholder = '', note_title = 'Observações'
WHERE note_placeholder LIKE '%granola%' 
   OR note_placeholder LIKE '%cebola%' 
   OR note_placeholder LIKE '%entrega%';

-- Limpar todos por precaução
UPDATE settings SET note_placeholder = '';
