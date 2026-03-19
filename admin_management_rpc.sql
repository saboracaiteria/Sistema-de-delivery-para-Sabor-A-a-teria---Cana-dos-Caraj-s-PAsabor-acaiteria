-- =====================================================
-- ADMIN MANAGEMENT RPC
-- Permite que o Master Admin crie e gerencie contas de lojistas
-- sem ser deslogado (sem usar signUp/signIn do cliente)
-- =====================================================

-- 1. Função para Criar Dono de Loja
CREATE OR REPLACE FUNCTION create_store_owner(p_email text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Executa com privilégios de superusuário
SET search_path = public, auth
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Verifica se o usuário já existe
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        -- Cria novo usuário no auth.users
        -- Nota: Senhas no Supabase Auth são criptografadas com bcrypt.
        -- O Supabase fornece a extensão pgcrypto.
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            p_email,
            crypt(p_password, gen_salt('bf')),
            now(), -- Já marca como confirmado para evitar problemas de email
            NULL,
            NULL,
            '{"provider":"email","providers":["email"]}',
            '{}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO v_user_id;

        -- Criar entrada na tabela auth.identities para o provedor de email
        INSERT INTO auth.identities (
            id, -- Deve ser o id do usuário no auth.users para o provider email
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        )
        VALUES (
            v_user_id,
            v_user_id,
            format('{"sub":"%s","email":"%s"}', v_user_id, p_email)::jsonb,
            'email',
            NULL,
            now(),
            now()
        );
    ELSE
        -- Usuário já existe, vamos apenas atualizar a senha caso necessário
        UPDATE auth.users 
        SET encrypted_password = crypt(p_password, gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = COALESCE(email_confirmed_at, now())
        WHERE id = v_user_id;
    END IF;

    RETURN v_user_id;
END;
$$;

-- 2. Função para Atualizar Senha de Dono de Loja
CREATE OR REPLACE FUNCTION update_store_owner_password(p_user_id uuid, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    UPDATE auth.users 
    SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
        updated_at = now()
    WHERE id = p_user_id;
END;
$$;

-- 3. Dar permissão de execução (apenas para usuários autenticados, o RLS das tabelas ainda vai proteger o resto)
-- Nota: Como o Master Admin está logado, ele terá acesso.
GRANT EXECUTE ON FUNCTION create_store_owner(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION update_store_owner_password(uuid, text) TO authenticated;

-- 4. Adicionar política de RLS para que o lojista não possa chamar essas funções contra outros?
-- Na verdade, no Supabase, funções RPC executadas por usuários autenticados 
-- rodam sob a identidade do usuário. No entanto, SECURITY DEFINER faz rodar como dono da função (postgres).
-- Portanto, devemos restringir quem pode chamar isso baseando-se no e-mail do admin no código ou aqui.

-- Opcional: Restringir apenas para os e-mails de Super Admin definidos
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (auth.jwt() ->> 'email') IN (
        'parauapebasdeliveryoficial@gmail.com',
        'nildopereira60@gmail.com',
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
    );
END;
$$;

-- Re-definir as funções com check de super admin para segurança máxima
CREATE OR REPLACE FUNCTION create_store_owner(p_email text, p_password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_user_id uuid;
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Acesso negado. Apenas Master Admins podem criar contas.';
    END IF;

    -- (mesmo código acima...)
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    IF v_user_id IS NULL THEN
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, aud, role, instance_id, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (gen_random_uuid(), p_email, crypt(p_password, gen_salt('bf')), now(), 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', '{"provider":"email","providers":["email"]}', '{}', now(), now())
        RETURNING id INTO v_user_id;

        INSERT INTO auth.identities (id, user_id, identity_data, provider, created_at, updated_at)
        VALUES (v_user_id, v_user_id, format('{"sub":"%s","email":"%s"}', v_user_id, p_email)::jsonb, 'email', now(), now());
    ELSE
        UPDATE auth.users SET encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now() WHERE id = v_user_id;
    END IF;
    RETURN v_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION update_store_owner_password(p_user_id uuid, p_new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Acesso negado. Apenas Master Admins podem alterar senhas.';
    END IF;

    UPDATE auth.users SET encrypted_password = crypt(p_new_password, gen_salt('bf')), updated_at = now() WHERE id = p_user_id;
END;
$$;
