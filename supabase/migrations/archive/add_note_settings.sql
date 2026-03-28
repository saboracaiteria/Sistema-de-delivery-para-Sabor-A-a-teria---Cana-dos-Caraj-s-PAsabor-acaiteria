-- Add note_title and note_placeholder to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS note_title TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS note_placeholder TEXT;

-- Update existing rows to have generic defaults
UPDATE settings SET 
  note_title = 'Observações' 
WHERE note_title IS NULL;

UPDATE settings SET 
  note_placeholder = 'Ex: Detalhes sobre a entrega, cor, tamanho, etc...' 
WHERE note_placeholder IS NULL;
