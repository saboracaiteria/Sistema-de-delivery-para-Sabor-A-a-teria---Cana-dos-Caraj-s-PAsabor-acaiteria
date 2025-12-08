# 🚀 Quick Start - Migração Sabor Açaíteria

Guia rápido para migrar os dados da Sabor Açaíteria para o projeto React.

## Passo a Passo Rápido

### 1️⃣ Configurar Credenciais (.env.local)

```bash
# Copiar o arquivo de exemplo
copy .env.example .env.local

# Editar .env.local e adicionar suas credenciais do Supabase
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 2️⃣ Criar Schema no Supabase

Acesse o Supabase SQL Editor e execute (nesta ordem):

1. `supabase-schema.sql` ← **Obrigatório**
2. `supabase-storage.sql` ← **Obrigatório**
3. `add_active_column.sql`
4. `add_theme_colors.sql`
5. `add_status_messages.sql`
6. `update_footer_info.sql`

### 3️⃣ Instalar Dependências

```bash
npm install
```

### 4️⃣ Verificar Ambiente (Opcional mas Recomendado)

```bash
npm run verify
```

Este comando verifica:
- ✅ Se as credenciais estão corretas
- ✅ Se a conexão com Supabase funciona
- ✅ Se todas as tabelas foram criadas

### 5️⃣ Importar Dados

```bash
npm run import
# OU execute ambos (verificação + importação):
npm run migrate
```

Você verá:
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

### 6️⃣ Iniciar o Projeto

```bash
npm run dev
```

Abra: http://localhost:5173

### 7️⃣ Acessar Painel Admin

- **URL:** http://localhost:5173/setup
- **Senha Admin:** `1245`
- **Senha Funcionário:** `777`

## 📋 Dados Importados

### Configurações
- Nome: **Sabor Açaíteria**
- WhatsApp: **5594991623576**
- Endereço: **Av. rio Branco, novo Horizonte**

### Horários
- **Seg-Sex:** 19:15 às 22:00
- **Sáb-Dom:** 15:30 às 21:45

### Produtos
- **Açaí Tradicional:** 3 tamanhos (300ml, 400ml, 500ml)
- **Combos Especiais:** 16 combos variados

### Opções/Ingredientes
- **25 acompanhamentos** gratuitos (escolher até 3)
- **6 caldas** gratuitas (escolher até 1)

## 🔧 Solução Rápida de Problemas

### ❌ "Missing Supabase credentials"
```bash
# Verifique se o .env.local existe e tem as credenciais corretas
cat .env.local
```

### ❌ Erro ao conectar com Supabase
1. Confirme que os scripts SQL foram executados
2. Verifique se as credenciais estão corretas
3. Execute: `npm run verify`

### ❌ Produtos não aparecem
1. Verifique se a importação foi bem-sucedida
2. Acesse: Supabase Dashboard → Table Editor
3. Confirme que há dados nas tabelas `products` e `categories`

## 📚 Documentação Completa

Para mais detalhes, consulte:
- **`MIGRATION_GUIDE.md`** - Guia completo de migração
- **`README.md`** - Documentação do projeto
- **`SUPABASE_SETUP.md`** - Configuração do Supabase

## ✅ Checklist

- [ ] `.env.local` criado com credenciais
- [ ] Scripts SQL executados no Supabase
- [ ] `npm install` executado
- [ ] `npm run verify` passou sem erros
- [ ] `npm run import` executado com sucesso
- [ ] Projeto rodando (`npm run dev`)
- [ ] Painel admin acessível
- [ ] Produtos visíveis na home

## 🎯 Próximos Passos

Após a importação:
1. **Adicionar imagens** dos produtos no painel admin
2. **Personalizar cores** do tema nas configurações
3. **Ajustar horários** se necessário
4. **Testar pedido** via WhatsApp
5. **Alterar senhas** de acesso

---

**Tempo estimado:** 10-15 minutos

**Dúvidas?** Consulte `MIGRATION_GUIDE.md` para detalhes completos.
