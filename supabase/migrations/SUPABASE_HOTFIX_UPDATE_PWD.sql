-- HOTFIX: Criar função update_store_owner_password para o Admin conseguir trocar a senha
CREATE OR REPLACE FUNCTION public.update_store_owner_password(p_user_id UUID, p_new_password TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
    UPDATE auth.users SET encrypted_password = crypt(p_new_password, gen_salt('bf')) WHERE id = p_user_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.update_store_owner_password(UUID, TEXT) TO authenticated;
