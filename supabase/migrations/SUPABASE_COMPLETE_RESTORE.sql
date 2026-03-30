-- =====================================================================
-- SABOR AÇAÍTERIA — SCRIPT DEFINITIVO DE RESTAURAÇÃO DE FUNÇÕES
-- Resolve: Salvar Configurações (Capa/Rodapé), Admin e RLS
-- Execute no Editor SQL do Supabase
-- =====================================================================

-- 1. FUNÇÃO: Salvar Configurações da Loja (Capa, Rodapé, Infos)
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
    v_caller_email := (auth.jwt() ->> 'email');

    IF v_caller_email IS NOT NULL THEN
        IF v_caller_email = ANY(superadmin_emails) THEN
            v_is_authorized := TRUE;
        ELSE
            SELECT EXISTS(
                SELECT 1 FROM stores
                WHERE id = p_store_id
                AND (owner_email = v_caller_email OR owner_id = auth.uid())
            ) INTO v_is_authorized;
        END IF;
    END IF;

    -- Fallback por senha da loja (sem sessão de Auth)
    IF NOT v_is_authorized AND p_store_password IS NOT NULL THEN
        SELECT EXISTS(
            SELECT 1 FROM stores
            WHERE id = p_store_id AND password = p_store_password
        ) INTO v_is_authorized;
    END IF;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'Acesso negado.' USING ERRCODE = '42501';
    END IF;

    -- Buscar nome existente
    SELECT COALESCE(s.store_name, st.name)
    INTO v_existing_store_name
    FROM stores st
    LEFT JOIN settings s ON s.store_id = st.id
    WHERE st.id = p_store_id;

    v_store_name := COALESCE((p_settings ->> 'store_name'), v_existing_store_name, 'Loja');

    INSERT INTO settings (
        store_id, store_name, logo_url, logo_shape, banner_url,
        whatsapp_number, store_status, delivery_fee, delivery_only,
        opening_hours, theme_colors, closed_message, open_message,
        delivery_time, pickup_time, delivery_close_time,
        instagram_url, business_address, copyright_text,
        note_title, note_placeholder, checkout_review_message, ui_mode, updated_at
    ) VALUES (
        p_store_id,
        v_store_name,
        (p_settings ->> 'logo_url'),
        COALESCE((p_settings ->> 'logo_shape'), 'circle'),
        (p_settings ->> 'banner_url'),
        (p_settings ->> 'whatsapp_number'),
        COALESCE((p_settings ->> 'store_status'), 'auto'),
        COALESCE((p_settings ->> 'delivery_fee')::NUMERIC, 5),
        COALESCE((p_settings ->> 'delivery_only')::BOOLEAN, false),
        COALESCE((p_settings -> 'opening_hours'), '[]'::jsonb),
        (p_settings -> 'theme_colors'),
        COALESCE((p_settings ->> 'closed_message'), '🚫 Loja Fechada'),
        COALESCE((p_settings ->> 'open_message'), '✅ Aberto agora'),
        COALESCE((p_settings ->> 'delivery_time'), '40min à 1h'),
        COALESCE((p_settings ->> 'pickup_time'), '20min à 45min'),
        COALESCE((p_settings ->> 'delivery_close_time'), '21:00'),
        COALESCE((p_settings ->> 'instagram_url'), ''),
        COALESCE((p_settings ->> 'business_address'), ''),
        COALESCE((p_settings ->> 'copyright_text'), '© 2026'),
        COALESCE((p_settings ->> 'note_title'), 'Observações'),
        COALESCE((p_settings ->> 'note_placeholder'), 'Ex: Tirar cebola...'),
        (p_settings ->> 'checkout_review_message'),
        COALESCE((p_settings ->> 'ui_mode'), 'modern'),
        NOW()
    )
    ON CONFLICT (store_id) DO UPDATE SET
        store_name              = COALESCE(EXCLUDED.store_name, settings.store_name),
        logo_url                = COALESCE(EXCLUDED.logo_url, settings.logo_url),
        logo_shape              = COALESCE(EXCLUDED.logo_shape, settings.logo_shape),
        banner_url              = COALESCE(EXCLUDED.banner_url, settings.banner_url),
        whatsapp_number         = COALESCE(EXCLUDED.whatsapp_number, settings.whatsapp_number),
        store_status            = COALESCE(EXCLUDED.store_status, settings.store_status),
        delivery_fee            = COALESCE(EXCLUDED.delivery_fee, settings.delivery_fee),
        delivery_only           = COALESCE(EXCLUDED.delivery_only, settings.delivery_only),
        opening_hours           = COALESCE(EXCLUDED.opening_hours, settings.opening_hours),
        theme_colors            = COALESCE(EXCLUDED.theme_colors, settings.theme_colors),
        closed_message          = COALESCE(EXCLUDED.closed_message, settings.closed_message),
        open_message            = COALESCE(EXCLUDED.open_message, settings.open_message),
        delivery_time           = COALESCE(EXCLUDED.delivery_time, settings.delivery_time),
        pickup_time             = COALESCE(EXCLUDED.pickup_time, settings.pickup_time),
        delivery_close_time     = COALESCE(EXCLUDED.delivery_close_time, settings.delivery_close_time),
        instagram_url           = COALESCE(EXCLUDED.instagram_url, settings.instagram_url),
        business_address        = COALESCE(EXCLUDED.business_address, settings.business_address),
        copyright_text          = COALESCE(EXCLUDED.copyright_text, settings.copyright_text),
        note_title              = COALESCE(EXCLUDED.note_title, settings.note_title),
        note_placeholder        = COALESCE(EXCLUDED.note_placeholder, settings.note_placeholder),
        checkout_review_message = COALESCE(EXCLUDED.checkout_review_message, settings.checkout_review_message),
        ui_mode                 = COALESCE(EXCLUDED.ui_mode, settings.ui_mode),
        updated_at              = NOW();
END;
$$;

-- 2. FUNÇÃO: Contador de Visitantes
CREATE OR REPLACE FUNCTION public.increment_visitor_count(p_store_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO daily_visitors (date, store_id, count, updated_at)
  VALUES (CURRENT_DATE, p_store_id, 1, NOW())
  ON CONFLICT (date, store_id) DO UPDATE SET
    count = daily_visitors.count + 1, updated_at = NOW();
END;
$$;

-- 3. FUNÇÃO: Master Admin Check
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN COALESCE((auth.jwt() ->> 'email'), '') = ANY(ARRAY[
    'parauapebasdeliveryoficial@gmail.com', 'nildopereira60@gmail.com',
    'nildoxz@gmail.com', 'canaadoscarajaspasabor@gmail.com'
  ]);
END;
$$;

-- 4. FUNÇÃO: Criar Lojista (Master Admin only)
CREATE OR REPLACE FUNCTION public.create_store_owner(p_email text, p_password text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_user_id uuid;
BEGIN
    IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
    -- Criação simplificada/correção do owner_id
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    IF v_user_id IS NOT NULL THEN
        UPDATE public.stores SET owner_id = v_user_id WHERE owner_email = p_email;
    END IF;
    RETURN v_user_id;
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION public.save_store_settings(UUID, JSONB, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_visitor_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

SELECT '✅ Funções restauradas com sucesso!' as status;
