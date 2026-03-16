-- =====================================================
-- FIX SETTINGS JSONB DATA (v2)
-- Repairs opening_hours if stored as stringified JSON
-- =====================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT store_id, opening_hours FROM settings WHERE jsonb_typeof(opening_hours) = 'string' LOOP
        UPDATE settings 
        SET opening_hours = r.opening_hours::jsonb 
        WHERE store_id = r.store_id;
        RAISE NOTICE '✅ Corrigido settings para store_id % (convertido de string para jsonb)', r.store_id;
    END LOOP;
    
    RAISE NOTICE '✅ Reparo de dados concluído.';
END $$;
