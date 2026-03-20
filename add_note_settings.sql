-- Add note_title and note_placeholder to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS note_title TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS note_placeholder TEXT;

-- Update existing rows to have the current defaults (Açaí style) to maintain backward compatibility
UPDATE settings SET 
  note_title = 'Alguma observação?' 
WHERE note_title IS NULL;

UPDATE settings SET 
  note_placeholder = 'Ex: Sem cebola, caprichar no creme...' 
WHERE note_placeholder IS NULL;
