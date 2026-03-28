-- =====================================================
-- FIX RLS PARA SUPERADMIN (V2)
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Defina aqui os emails que devem ter poder total sobre a plataforma
-- Adicione o e-mail que você está usando atualmente!
DO $$
BEGIN
    -- Tabelas para atualizar: stores, settings, products, categories, product_groups, product_options, product_group_relations, coupons, orders
    
    -- STORES
    DROP POLICY IF EXISTS "Superadmin manage stores" ON stores;
    CREATE POLICY "Superadmin manage stores" ON stores FOR ALL
      USING ((auth.jwt() ->> 'email') IN (
        'parauapebasdeliveryoficial@gmail.com', 
        'nildopereira60@gmail.com', 
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com' -- Adicionando possível email da screenshot
      ))
      WITH CHECK ((auth.jwt() ->> 'email') IN (
        'parauapebasdeliveryoficial@gmail.com', 
        'nildopereira60@gmail.com', 
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
      ));

    -- SETTINGS
    DROP POLICY IF EXISTS "Superadmin manage settings" ON settings;
    CREATE POLICY "Superadmin manage settings" ON settings FOR ALL
      USING ((auth.jwt() ->> 'email') IN (
        'parauapebasdeliveryoficial@gmail.com', 
        'nildopereira60@gmail.com', 
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
      ))
      WITH CHECK ((auth.jwt() ->> 'email') IN (
        'parauapebasdeliveryoficial@gmail.com', 
        'nildopereira60@gmail.com', 
        'nildoxz@gmail.com',
        'canaadoscarajaspasabor@gmail.com'
      ));

    -- Repetir para outras tabelas se necessário...
    -- Por brevidade, focamos em STORES e SETTINGS que são os que falharam.
END $$;

-- IMPORTANTE: Se o seu e-mail não estiver na lista acima, as alterações serão bloqueadas.
-- Verifique no painel do Supabase -> Authentication -> Users qual e-mail você está usando.

SELECT 'Políticas de SuperAdmin atualizadas! Tente alterar a senha novamente.' as status;
