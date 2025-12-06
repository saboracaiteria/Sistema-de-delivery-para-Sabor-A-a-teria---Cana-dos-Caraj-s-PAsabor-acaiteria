-- Add columns for editable home page info
ALTER TABLE settings ADD COLUMN IF NOT EXISTS delivery_time TEXT DEFAULT '40min à 1h';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS pickup_time TEXT DEFAULT '20min à 45min';
-- Storing just the time "21:00" might be flexible enough if we keep the "Entregas somente até as ...hrs!" hardcoded or configurable.
-- Let's make the whole text configurable or just the time. User said "Entregas somente até as 21:00hrs! esses campos...".
-- I'll define a column for the time.
ALTER TABLE settings ADD COLUMN IF NOT EXISTS delivery_close_time TEXT DEFAULT '21:00'; -- stores "21:00"
