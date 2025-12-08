# 🎯 COMECE AQUI - Migração Sabor Açaíteria

## 👋 Bem-vindo!

Este projeto está **100% pronto** para migrar os dados da **Sabor Açaíteria** do HTML para um sistema moderno React + Supabase.

## 🚀 Início Rápido (Escolha uma opção)

### Opção A: Super Rápido (Para quem tem pressa)
```bash
# 1. Configure credenciais (edite com suas chaves)
copy .env.example .env.local

# 2. Instale dependências
npm install

# 3. Execute migração completa
npm run migrate

# 4. Inicie o projeto
npm run dev
```

### Opção B: Passo a Passo (Recomendado)
👉 Abra: **[QUICK_START.md](./QUICK_START.md)**  
📄 Tempo estimado: 10-15 minutos

### Opção C: Guia Completo
👉 Abra: **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)**  
📖 Para entender todos os detalhes

## 📚 Documentos Disponíveis

| 📄 Arquivo | 📝 Descrição | ⏱️ Tempo |
|-----------|-------------|---------|
| **[COMECE_AQUI.md](./COMECE_AQUI.md)** | Este arquivo (ponto de partida) | 2 min |
| **[QUICK_START.md](./QUICK_START.md)** | Guia rápido de migração | 15 min |
| **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** | Guia completo e detalhado | 30 min |
| **[CHECKLIST.md](./CHECKLIST.md)** | Checklist interativo | - |
| **[README_MIGRACAO.md](./README_MIGRACAO.md)** | Visão geral do projeto | 10 min |
| **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** | Como configurar Supabase | 20 min |

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] **Node.js** instalado (versão 16+)  
      → Verifique: `node --version`
      
- [ ] **Conta no Supabase** criada  
      → Acesse: https://supabase.com
      
- [ ] **Projeto no Supabase** criado  
      → Dashboard: https://supabase.com/dashboard
      
- [ ] **Credenciais do Supabase** em mãos  
      → Settings → API → URL + anon key

## 🛠️ Comandos Principais

| Comando | O que faz |
|---------|-----------|
| `npm install` | Instala todas as dependências |
| `npm run verify` | Verifica configuração e conectividade |
| `npm run import` | Importa dados para o Supabase |
| `npm run migrate` | Verifica + Importa (tudo de uma vez) |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |

## 📊 O Que Será Importado

### ✅ Configurações da Loja
- Nome: Sabor Açaíteria
- WhatsApp: 5594991623576
- Endereço completo
- Logo e banner

### ✅ Horários
- Segunda a Sexta: 19:15 às 22:00
- Sábado e Domingo: 15:30 às 21:45

### ✅ Produtos (19 itens)
- **3 tamanhos** de açaí tradicional (300ml, 400ml, 500ml)
- **16 combos** especiais (Diet Granola, Refrescante, etc.)

### ✅ Ingredientes (34 opções)
- **25 acompanhamentos** gratuitos (limite: 3)
- **6 caldas** gratuitas (limite: 1)

## 🎯 Fluxo Recomendado

```
1. Ler este arquivo (COMECE_AQUI.md) ✅ Você está aqui!
   ↓
2. Seguir o QUICK_START.md
   ↓
3. Executar npm run migrate
   ↓
4. Verificar se tudo funcionou
   ↓
5. Personalizar (adicionar imagens, ajustar cores)
   ↓
6. Testar pedidos
   ↓
7. Deploy em produção
```

## 🔑 Senhas Padrão

Após a migração, você poderá acessar o painel admin com:

- **Admin:** `1245`
- **Funcionário:** `777`

> ⚠️ **IMPORTANTE:** Altere essas senhas em produção!

## 🆘 Precisa de Ajuda?

### Problema com credenciais do Supabase?
👉 Leia: **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

### Erro ao importar dados?
```bash
npm run verify
```
Este comando diagnostica o problema.

### Produtos não aparecem?
1. Verifique se a importação foi bem-sucedida
2. Acesse o Supabase Table Editor
3. Confirme que há dados nas tabelas

### Outras dúvidas?
- Consulte **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** (seção "Solução de Problemas")
- Verifique **[CHECKLIST.md](./CHECKLIST.md)** para ver se não pulou nenhum passo

## 🎉 Após a Migração

1. ✅ **Adicione imagens** dos produtos no painel admin
2. ✅ **Teste um pedido** via WhatsApp
3. ✅ **Personalize as cores** do tema
4. ✅ **Ajuste os horários** se necessário
5. ✅ **Altere as senhas** de acesso
6. ✅ **Faça um backup** do banco de dados

## 📱 Próximo Nível

Depois que tudo estiver funcionando:

- 🌐 **Deploy na Vercel/Netlify**
- 📱 **Build para Android** (PWA ou APK)
- 📊 **Configure relatórios** financeiros
- 🏷️ **Crie cupons** de desconto
- 🖨️ **Configure impressora** Bluetooth (opcional)

## 💡 Dica Final

**Não tenha pressa!** Siga o passo a passo do **QUICK_START.md** com calma.  
Em 15 minutos você terá tudo funcionando. 🚀

---

## 🎬 Pronto para Começar?

### Próximo passo → **[QUICK_START.md](./QUICK_START.md)**

ou

### Execute agora:
```bash
copy .env.example .env.local
# (edite o .env.local com suas credenciais)

npm install
npm run migrate
npm run dev
```

**Última atualização:** Dezembro 2025  
**Desenvolvedor:** @_nildoxz
