-- 1. Tentar habilitar pgcrypto explicitamente (caso não esteja)
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;
-- Caso falhe por permissão, o Supabase geralmente já tem pgcrypto disponível no schema extensions ou public.

-- 2. Recriar funções de admin usando caminhos absolutos para segurança
CREATE OR REPLACE FUNCTION public.create_store_owner(p_email text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_user_id uuid;
    v_encrypted_password text;
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    -- Tenta gerar o hash com fallback para schemas comuns se necessário
    BEGIN
        v_encrypted_password := crypt(p_password, gen_salt('bf'));
    EXCEPTION WHEN undefined_function THEN
        -- Fallback: tentar com schema prefixado
        v_encrypted_password := extensions.crypt(p_password, extensions.gen_salt('bf'));
    END;

    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role, instance_id, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (gen_random_uuid(), p_email, v_encrypted_password, now(), 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', '{"provider":"email","providers":["email"]}', '{}', now(), now())
        RETURNING id INTO v_user_id;

        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
        VALUES (v_user_id, v_user_id, format('{"sub":"%s","email":"%s"}', v_user_id, p_email)::jsonb, 'email', v_user_id::text, now(), now());
    ELSE
        UPDATE auth.users SET encrypted_password = v_encrypted_password, updated_at = now() WHERE id = v_user_id;
    END IF;

    RETURN v_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_store_owner_password(p_user_id uuid, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    v_encrypted_password text;
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    BEGIN
        v_encrypted_password := crypt(p_new_password, gen_salt('bf'));
    EXCEPTION WHEN undefined_function THEN
        v_encrypted_password := extensions.crypt(p_new_password, extensions.gen_salt('bf'));
    END;

    UPDATE auth.users 
    SET encrypted_password = v_encrypted_password,
        updated_at = now()
    WHERE id = p_user_id;
END;
$$;
