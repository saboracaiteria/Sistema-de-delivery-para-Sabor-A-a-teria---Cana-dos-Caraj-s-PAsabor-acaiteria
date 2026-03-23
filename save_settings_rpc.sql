-- =====================================================
-- save_store_settings V2 (Autenticação por Senha da Loja)
-- Remove dependência de sessão JWT do Supabase Auth
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Limpar versão antiga
DROP FUNCTION IF EXISTS public.save_store_settings(UUID, JSONB);

-- Recriar com suporte a senha como token alternativo
CREATE OR REPLACE FUNCTION public.save_store_settings(
    p_store_id UUID,
    p_settings JSONB,
    p_store_password TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_caller_email TEXT;
    v_is_authorized BOOLEAN := FALSE;
    v_store_name TEXT;
    v_existing_store_name TEXT;
    superadmin_emails TEXT[] := ARRAY[
        'parauapebasdeliveryoficial@gmail.com',
        'nildopereira60@gmail.com',
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
    ];
BEGIN
    -- Tentar autenticação via JWT
    v_caller_email := (auth.jwt() ->> 'email');

    IF v_caller_email IS NOT NULL THEN
        -- Superadmin?
        IF v_caller_email = ANY(superadmin_emails) THEN
            v_is_authorized := TRUE;
        ELSE
            -- Dono via email ou owner_id?
            SELECT EXISTS(
                SELECT 1 FROM stores 
                WHERE id = p_store_id 
                AND (owner_email = v_caller_email OR owner_id = auth.uid())
            ) INTO v_is_authorized;
        END IF;
    END IF;

    -- Fallback: autenticação via senha da loja (sem precisar de sessão Supabase)
    IF NOT v_is_authorized AND p_store_password IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM stores 
            WHERE id = p_store_id 
            AND password = p_store_password
        ) INTO v_is_authorized;
    END IF;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501';
    END IF;

    -- Buscar store_name existente para usar como fallback (evita violação NOT NULL)
    SELECT COALESCE(s.store_name, st.name) INTO v_existing_store_name
    FROM stores st
    LEFT JOIN settings s ON s.store_id = st.id
    WHERE st.id = p_store_id;

    -- Usar store_name fornecido ou o existente no banco
    v_store_name := COALESCE((p_settings ->> 'store_name'), v_existing_store_name, 'Loja');

    -- Upsert nas configurações (SECURITY DEFINER — bypass total do RLS)
    INSERT INTO settings (
        store_id, store_name, logo_url, logo_shape, banner_url,
        whatsapp_number, store_status, delivery_fee, delivery_only,
        opening_hours, theme_colors, closed_message, open_message,
        delivery_time, pickup_time, delivery_close_time,
        instagram_url, business_address, copyright_text, checkout_review_message, updated_at
    ) VALUES (
        p_store_id,
        v_store_name,
        (p_settings ->> 'logo_url'),
        COALESCE((p_settings ->> 'logo_shape'), 'circle'),
        (p_settings ->> 'banner_url'),
        (p_settings ->> 'whatsapp_number'),
        COALESCE((p_settings ->> 'store_status'), 'open'),
        COALESCE((p_settings ->> 'delivery_fee')::NUMERIC, 5),
        COALESCE((p_settings ->> 'delivery_only')::BOOLEAN, false),
        COALESCE((p_settings -> 'opening_hours'), '[]'::jsonb),
        (p_settings -> 'theme_colors'),
        (p_settings ->> 'closed_message'),
        (p_settings ->> 'open_message'),
        (p_settings ->> 'delivery_time'),
        (p_settings ->> 'pickup_time'),
        (p_settings ->> 'delivery_close_time'),
        (p_settings ->> 'instagram_url'),
        (p_settings ->> 'business_address'),
        (p_settings ->> 'copyright_text'),
        (p_settings ->> 'checkout_review_message'),
        NOW()
    )
    ON CONFLICT (store_id) DO UPDATE SET
        store_name        = COALESCE(EXCLUDED.store_name, settings.store_name),
        logo_url          = COALESCE(EXCLUDED.logo_url, settings.logo_url),
        logo_shape        = COALESCE(EXCLUDED.logo_shape, settings.logo_shape),
        banner_url        = COALESCE(EXCLUDED.banner_url, settings.banner_url),
        whatsapp_number   = COALESCE(EXCLUDED.whatsapp_number, settings.whatsapp_number),
        store_status      = COALESCE(EXCLUDED.store_status, settings.store_status),
        delivery_fee      = COALESCE(EXCLUDED.delivery_fee, settings.delivery_fee),
        delivery_only     = COALESCE(EXCLUDED.delivery_only, settings.delivery_only),
        opening_hours     = COALESCE(EXCLUDED.opening_hours, settings.opening_hours),
        theme_colors      = COALESCE(EXCLUDED.theme_colors, settings.theme_colors),
        closed_message    = COALESCE(EXCLUDED.closed_message, settings.closed_message),
        open_message      = COALESCE(EXCLUDED.open_message, settings.open_message),
        delivery_time     = COALESCE(EXCLUDED.delivery_time, settings.delivery_time),
        pickup_time       = COALESCE(EXCLUDED.pickup_time, settings.pickup_time),
        delivery_close_time = COALESCE(EXCLUDED.delivery_close_time, settings.delivery_close_time),
        instagram_url     = COALESCE(EXCLUDED.instagram_url, settings.instagram_url),
        business_address  = COALESCE(EXCLUDED.business_address, settings.business_address),
        copyright_text    = COALESCE(EXCLUDED.copyright_text, settings.copyright_text),
        checkout_review_message = COALESCE(EXCLUDED.checkout_review_message, settings.checkout_review_message),
        updated_at        = NOW();
END;
$$;

-- Liberar para anon E authenticated (sem depender de login)
GRANT EXECUTE ON FUNCTION public.save_store_settings(UUID, JSONB, TEXT) TO anon, authenticated;
