-- =====================================================
-- RPC: save_store_settings
-- Permite lojistas salvarem configurações sem depender de RLS
-- Verificação de identidade via JWT email (duplamente seguro)
-- =====================================================

CREATE OR REPLACE FUNCTION public.save_store_settings(
    p_store_id UUID,
    p_settings JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_caller_email TEXT;
    v_store_email TEXT;
BEGIN
    -- Pegar o email do usuário autenticado via JWT
    v_caller_email := (auth.jwt() ->> 'email');

    IF v_caller_email IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado.';
    END IF;

    -- Verificar se o usuário é dono da loja (por email ou owner_id)
    SELECT owner_email INTO v_store_email 
    FROM stores 
    WHERE id = p_store_id 
      AND (owner_email = v_caller_email OR owner_id = auth.uid());

    IF v_store_email IS NULL THEN
        -- Verificar se é superadmin
        IF NOT EXISTS (
            SELECT 1 FROM stores WHERE id = p_store_id
        ) THEN
            RAISE EXCEPTION 'Loja não encontrada.';
        END IF;
        -- Verificar superadmin emails
        IF v_caller_email NOT IN (
            'parauapebasdeliveryoficial@gmail.com',
            'nildopereira60@gmail.com', 
            'nildoxz@gmail.com',
            'canaadoscarajaspasabor@gmail.com'
        ) THEN
            RAISE EXCEPTION 'Acesso negado. Você não é o dono desta loja.';
        END IF;
    END IF;

    -- Upsert nas configurações (SECURITY DEFINER bypassa RLS)
    INSERT INTO settings (
        store_id,
        store_name,
        logo_url,
        logo_shape,
        banner_url,
        whatsapp_number,
        store_status,
        delivery_fee,
        delivery_only,
        opening_hours,
        theme_colors,
        closed_message,
        open_message,
        delivery_time,
        pickup_time,
        delivery_close_time,
        instagram_url,
        business_address,
        copyright_text,
        updated_at
    ) VALUES (
        p_store_id,
        (p_settings ->> 'store_name'),
        (p_settings ->> 'logo_url'),
        (p_settings ->> 'logo_shape'),
        (p_settings ->> 'banner_url'),
        (p_settings ->> 'whatsapp_number'),
        (p_settings ->> 'store_status'),
        (p_settings ->> 'delivery_fee')::NUMERIC,
        (p_settings ->> 'delivery_only')::BOOLEAN,
        (p_settings -> 'opening_hours'),
        (p_settings -> 'theme_colors'),
        (p_settings ->> 'closed_message'),
        (p_settings ->> 'open_message'),
        (p_settings ->> 'delivery_time'),
        (p_settings ->> 'pickup_time'),
        (p_settings ->> 'delivery_close_time'),
        (p_settings ->> 'instagram_url'),
        (p_settings ->> 'business_address'),
        (p_settings ->> 'copyright_text'),
        NOW()
    )
    ON CONFLICT (store_id) DO UPDATE SET
        store_name = COALESCE(EXCLUDED.store_name, settings.store_name),
        logo_url = COALESCE(EXCLUDED.logo_url, settings.logo_url),
        logo_shape = COALESCE(EXCLUDED.logo_shape, settings.logo_shape),
        banner_url = COALESCE(EXCLUDED.banner_url, settings.banner_url),
        whatsapp_number = COALESCE(EXCLUDED.whatsapp_number, settings.whatsapp_number),
        store_status = COALESCE(EXCLUDED.store_status, settings.store_status),
        delivery_fee = COALESCE(EXCLUDED.delivery_fee, settings.delivery_fee),
        delivery_only = COALESCE(EXCLUDED.delivery_only, settings.delivery_only),
        opening_hours = COALESCE(EXCLUDED.opening_hours, settings.opening_hours),
        theme_colors = COALESCE(EXCLUDED.theme_colors, settings.theme_colors),
        closed_message = COALESCE(EXCLUDED.closed_message, settings.closed_message),
        open_message = COALESCE(EXCLUDED.open_message, settings.open_message),
        delivery_time = COALESCE(EXCLUDED.delivery_time, settings.delivery_time),
        pickup_time = COALESCE(EXCLUDED.pickup_time, settings.pickup_time),
        delivery_close_time = COALESCE(EXCLUDED.delivery_close_time, settings.delivery_close_time),
        instagram_url = COALESCE(EXCLUDED.instagram_url, settings.instagram_url),
        business_address = COALESCE(EXCLUDED.business_address, settings.business_address),
        copyright_text = COALESCE(EXCLUDED.copyright_text, settings.copyright_text),
        updated_at = NOW();
END;
$$;

-- Dar permissão à role authenticated
GRANT EXECUTE ON FUNCTION public.save_store_settings(UUID, JSONB) TO authenticated;
