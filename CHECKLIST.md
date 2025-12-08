# ✅ Checklist de Migração - Sabor Açaíteria

Use este checklist para acompanhar o progresso da migração.

## 📋 Pré-requisitos

- [ ] Node.js instalado (versão 16+)
- [ ] Conta no Supabase criada
- [ ] Projeto criado no Supabase
- [ ] Credenciais do Supabase em mãos (URL + anon key)

## 🔧 Configuração Inicial

- [ ] Arquivo `.env.local` criado
- [ ] Credenciais do Supabase adicionadas ao `.env.local`
- [ ] Dependências instaladas (`npm install`)

## 🗄️ Configuração do Banco de Dados

Execute os scripts SQL no Supabase (nesta ordem):

- [ ] **supabase-schema.sql** ← Obrigatório
- [ ] **supabase-storage.sql** ← Obrigatório
- [ ] add_active_column.sql
- [ ] add_theme_colors.sql
- [ ] add_status_messages.sql
- [ ] update_footer_info.sql
- [ ] (Opcional) inventory_schema.sql

## 🔄 Migração de Dados

- [ ] `npm run verify` executado com sucesso
  - [ ] Conexão com Supabase OK
  - [ ] Todas as tabelas encontradas
- [ ] `npm run import` executado com sucesso
  - [ ] Settings atualizados
  - [ ] Categorias importadas (2)
  - [ ] Grupos importados (3)
  - [ ] Opções importadas (34)
  - [ ] Produtos importados (19)
  - [ ] Relações criadas (22)

## 🚀 Validação

- [ ] Servidor de desenvolvimento rodando (`npm run dev`)
- [ ] Site acessível em http://localhost:5173
- [ ] Painel admin acessível (http://localhost:5173/setup)
- [ ] Login com senha `1245` funciona
- [ ] Produtos aparecem na página inicial
- [ ] Categorias visíveis
- [ ] Ingredientes carregam corretamente

## 🎨 Personalização

- [ ] Imagens dos produtos adicionadas
- [ ] Logo personalizado (se necessário)
- [ ] Banner/capa atualizado (se necessário)
- [ ] Cores do tema ajustadas
- [ ] Horários de funcionamento verificados
- [ ] Taxa de entrega configurada
- [ ] Bairros e taxas adicionados

## 🔐 Segurança

- [ ] Senha de admin alterada (era `1245`)
- [ ] Senha de funcionário alterada (era `777`)
- [ ] Variáveis de ambiente (.env.local) **NÃO** commitadas no Git

## 🧪 Testes

- [ ] Adicionar produto ao carrinho
- [ ] Personalizar açaí com ingredientes
- [ ] Verificar limite de ingredientes (3 acompanhamentos)
- [ ] Verificar limite de caldas (1 calda)
- [ ] Testar cupom de desconto
- [ ] Testar pedido via WhatsApp
- [ ] Verificar horário de funcionamento
- [ ] Testar em mobile (responsividade)

## 📊 Painel Admin

- [ ] Acesso ao painel admin OK
- [ ] Gerenciar produtos funciona
- [ ] Gerenciar categorias funciona
- [ ] Criar/editar cupons funciona
- [ ] Relatórios carregam
- [ ] Configurações podem ser alteradas
- [ ] Pedidos aparecem (após teste)

## 📱 Mobile & PWA

- [ ] Site responsivo no mobile
- [ ] PWA instalável (teste em Chrome/Android)
- [ ] (Opcional) Build Android gerado

## 🌐 Deploy (Produção)

- [ ] Build de produção gerado (`npm run build`)
- [ ] Deploy na Vercel/Netlify/outro
- [ ] Variáveis de ambiente configuradas no hosting
- [ ] Site em produção acessível
- [ ] Teste completo em produção
- [ ] Pedido real via WhatsApp testado

## ✅ Pós-Migração

- [ ] Backup do banco de dados Supabase criado
- [ ] Documentação lida e compreendida
- [ ] Time/cliente treinado no uso do sistema
- [ ] Senhas documentadas em local seguro
- [ ] Números de WhatsApp corretos
- [ ] Instagram e redes sociais atualizados

## 📝 Notas

- **Data de migração:** _______________
- **Responsável:** _______________
- **URL de produção:** _______________
- **Problemas encontrados:** 
  - 
  - 
  - 

## 🆘 Em Caso de Problemas

1. Consulte **QUICK_START.md** para solução rápida
2. Veja **MIGRATION_GUIDE.md** para detalhes
3. Execute `npm run verify` para diagnóstico
4. Verifique logs do console do navegador
5. Verifique logs do Supabase

---

**Última atualização:** Dezembro 2025
