ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS instagram_url TEXT DEFAULT 'https://www.instagram.com/obba_acai_/',
ADD COLUMN IF NOT EXISTS business_address TEXT DEFAULT 'Canaã dos Carajás - PA',
ADD COLUMN IF NOT EXISTS copyright_text TEXT DEFAULT '© 2025-2026 Obba Açaí';
