# 🚀 Guia de Migração - Sabor Açaíteria

Este guia detalha como migrar os dados do HTML da **Sabor Açaíteria** para o sistema baseado em React + Supabase.

## 📋 Pré-requisitos

1. **Node.js** instalado (versão 16+)
2. **Conta no Supabase** criada e configurada
3. **Projeto criado no Supabase**

## ⚙️ Passo 1: Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
```bash
copy .env.example .env.local
```

2. Edite o `.env.local` e adicione suas credenciais do Supabase:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

> 💡 **Onde encontrar as credenciais:**
> - Acesse: https://supabase.com/dashboard
> - Selecione seu projeto
> - Vá em: Settings → API
> - Copie a URL e a `anon/public` key

## 🗄️ Passo 2: Criar o Schema no Supabase

Execute os seguintes SQL scripts no Supabase SQL Editor (nesta ordem):

1. **`supabase-schema.sql`** - Cria as tabelas principais
2. **`supabase-storage.sql`** - Configura o storage de imagens
3. **`add_active_column.sql`** - Adiciona campos de ativação
4. **`add_theme_colors.sql`** - Adiciona configurações de tema
5. **`add_status_messages.sql`** - Adiciona mensagens de status
6. **`update_footer_info.sql`** - Atualiza informações do rodapé
7. **`inventory_schema.sql`** - Cria tabelas de estoque (opcional)

> 📂 Todos estes arquivos já estão na raiz do projeto

## 📦 Passo 3: Instalar Dependências

```bash
npm install
```

Isso instalará todas as dependências necessárias, incluindo:
- `@supabase/supabase-js` - Cliente Supabase
- `uuid` - Gerador de IDs únicos
- React, TypeScript, Vite e outras

## 🔄 Passo 4: Executar a Importação de Dados

O arquivo `import_user_data.ts` já está configurado com todos os dados da Sabor Açaíteria:

### Dados que serão importados:

✅ **Configurações da Loja:**
- Nome: Sabor Açaíteria
- WhatsApp: 5594991623576
- Endereço: Av. rio Branco, novo Horizonte
- Logo: URL da imagem no GitHub

✅ **Horários de Funcionamento:**
- Seg-Sex: 19:15 às 22:00
- Sáb-Dom: 15:30 às 21:45

✅ **Categorias:**
- Açaí Tradicional (300ml, 400ml, 500ml)
- Combos Especiais (16 combos)

✅ **Grupos de Opções:**
- Acompanhamentos (até 3 itens gratuitos)
- Caldas (até 1 calda gratuita)
- Tamanhos (para combos)

✅ **Opções/Ingredientes:**
- 25 acompanhamentos gratuitos
- 6 caldas gratuitas
- 3 opções de tamanho

### Executar a importação:

**Opção 1: Importação direta**
```bash
npm run import
```

**Opção 2: Script completo (verificação + importação)**
```bash
npm run migrate
```

**Opção 3: Comandos individuais**
```bash
npm run verify     # Verifica ambiente
npm run import     # Importa dados
```

Você verá uma saída como:
```
⚙️ Updating Settings...
✅ Settings updated.
📂 Inserting Categories...
✅ 2 Categories inserted.
🧩 Inserting Groups...
✅ 3 Groups inserted.
🍬 Inserting Options...
✅ 34 Options inserted.
🍦 Inserting Products...
✅ 19 Products inserted.
🔗 Linking Products to Groups...
✅ 22 Relations created.

🎉 IMPORT COMPLETED SUCCESSFULLY!
```

## 🚀 Passo 5: Iniciar o Projeto

```bash
npm run dev
```

Abra: http://localhost:5173

## 🔐 Acesso Administrativo

Senhas padrão:
- **Admin:** `1245`
- **Funcionário:** `777`

> ⚠️ **Altere essas senhas em produção!**

## 📸 Passo 6: Adicionar Imagens de Produtos

1. Acesse o **Painel Admin** → **Produtos**
2. Para cada produto, clique em **Editar**
3. Faça upload da imagem do produto
4. Salve as alterações

As imagens serão armazenadas no Supabase Storage.

## 🎨 Passo 7: Personalizar as Configurações

No **Painel Admin** → **Configurações**, você pode ajustar:

- ✏️ Nome da loja
- 📱 Número de WhatsApp
- 🕐 Horários de funcionamento
- 💵 Taxa de entrega
- 🎨 Cores do tema
- 🏷️ Logo e banner
- 📍 Endereço
- 📸 Instagram URL

## 📊 Funcionalidades Disponíveis

### Para Clientes:
- 🛒 Carrinho de compras
- 🎨 Personalização de açaí
- 💰 Sistema de cupons
- 📱 PWA (instalar como app)
- 📲 Envio de pedido via WhatsApp

### Para Admin:
- 📦 Gerenciar produtos e categorias
- 🎁 Criar cupons de desconto
- 📊 Relatórios financeiros
- 👥 Visualizar pedidos
- ⚙️ Configurações gerais
- 🖨️ Impressão de pedidos

## 🔧 Solução de Problemas

### Erro: "Missing Supabase credentials"
- Verifique se o arquivo `.env.local` existe
- Confirme que as credenciais estão corretas
- Reinicie o servidor dev (`npm run dev`)

### Erro ao importar dados
- Execute `npm run verify` para diagnosticar o problema
- Verifique se os scripts SQL foram executados
- Confirme a conexão com o Supabase
- Verifique os logs de erro no console

### Produtos não aparecem
- Verifique se a importação foi bem-sucedida
- Acesse o Supabase Dashboard → Table Editor
- Confirme que as tabelas `products`, `categories`, etc. têm dados

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- `README.md` - Documentação geral
- `SUPABASE_SETUP.md` - Configuração do Supabase
- `CHANGELOG.md` - Histórico de alterações

## ✅ Checklist Pós-Migração

- [ ] Credenciais do Supabase configuradas no `.env.local`
- [ ] Scripts SQL executados no Supabase
- [ ] Dependências instaladas (`npm install`)
- [ ] Dados importados (`npx tsx import_user_data.ts`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Acesso ao painel admin funcionando
- [ ] Imagens de produtos adicionadas
- [ ] Configurações da loja personalizadas
- [ ] Teste de pedido via WhatsApp realizado
- [ ] Horários de funcionamento ajustados
- [ ] Senhas de acesso alteradas

---

**Última Atualização:** Dezembro 2025
