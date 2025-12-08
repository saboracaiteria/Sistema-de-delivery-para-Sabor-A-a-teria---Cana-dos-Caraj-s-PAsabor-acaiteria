# 📝 README - Migração Sabor Açaíteria

Este projeto migra a aplicação HTML da **Sabor Açaíteria** para um sistema moderno baseado em **React + TypeScript + Supabase**.

## 🎯 O Que Foi Feito

### ✅ Estrutura do Projeto
- ✅ Projeto React com TypeScript configurado
- ✅ Integração com Supabase (banco de dados)
- ✅ Sistema de autenticação para admin/funcionários
- ✅ PWA (Progressive Web App) para Android
- ✅ Impressão de pedidos via Bluetooth

### ✅ Dados Extraídos do HTML
- ✅ **Configurações da loja** (nome, WhatsApp, endereço, logo)
- ✅ **Horários de funcionamento** (Seg-Sex e Sáb-Dom)
- ✅ **Categorias** (Açaí Tradicional, Combos Especiais)
- ✅ **Produtos** (3 tamanhos + 16 combos)
- ✅ **Ingredientes/Opções** (25 acompanhamentos + 6 caldas)
- ✅ **Sistema de cupons** (do HTML original)
- ✅ **Bairros e taxas de entrega**

### ✅ Ferramentas de Migração Criadas
1. **`verify_environment.ts`** - Verifica configuração e conectividade
2. **`import_user_data.ts`** - Importa todos os dados para o Supabase
3. **`QUICK_START.md`** - Guia rápido de migração
4. **`MIGRATION_GUIDE.md`** - Guia completo e detalhado

## 🚀 Como Usar

### Opção 1: Início Rápido (5 minutos)

```bash
# 1. Configurar credenciais
copy .env.example .env.local
# Editar .env.local com suas credenciais do Supabase

# 2. Instalar dependências
npm install

# 3. Executar migração completa (verifica + importa)
npm run migrate

# 4. Iniciar projeto
npm run dev
```

### Opção 2: Passo a Passo Detalhado

Consulte: **[QUICK_START.md](./QUICK_START.md)**

## 📚 Documentação Disponível

| Arquivo | Descrição |
|---------|-----------|
| **QUICK_START.md** | Guia rápido de migração (10-15 min) |
| **MIGRATION_GUIDE.md** | Guia completo e detalhado |
| **README.md** | Documentação geral do projeto |
| **SUPABASE_SETUP.md** | Como configurar o Supabase |
| **CHANGELOG.md** | Histórico de alterações |

## 🛠️ Scripts NPM Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run verify` | Verifica ambiente e conectividade |
| `npm run import` | Importa dados para o Supabase |
| `npm run migrate` | Executa verify + import |
| `npm run android` | Build para Android |

## 📊 Dados da Sabor Açaíteria

### Configurações
- **Nome:** Sabor Açaíteria
- **WhatsApp:** 5594991623576
- **Endereço:** Av. rio Branco, novo Horizonte, antigo Obba açaí
- **Logo:** https://raw.githubusercontent.com/saboracaiteria/SABOR-/main/175.jpg

### Horários de Funcionamento
- **Segunda a Sexta:** 19:15 às 22:00
- **Sábado e Domingo:** 15:30 às 21:45

### Produtos Importados

#### Açaí Tradicional (3 produtos)
1. **Copo 300ml** - R$ 14,00
2. **Copo 400ml** - R$ 17,00
3. **Copo 500ml** - R$ 20,00

#### Combos Especiais (16 produtos)
1. Diet Granola
2. Refrescante
3. Mega Especial
4. Preferido
5. Maltine +
6. Amendoimix
7. Megapower
8. Açaí Banana
9. Favorito Nutella
10. Sabores do Pará
11. Kids Especial
12. Namorados
13. Euforia
14. Ninho (A)
15. Bombom
16. Maracujá

### Ingredientes/Opções (34 itens)

#### Acompanhamentos (25 itens - até 3 gratuitos)
- Amendoim, Aveia, Banana, Coco Ralado
- Creme de Avelã, Creme de Cupuaçu, Creme de Leite Ninho
- Flocos, Granola Tradicional, Kiwi
- Leite em Pó, Manga, Morango, Mousse de Maracujá
- Paçoca, Sorvete, Tapioca, Uva
- Bis Picado, Chocopower, Confetes, Gotas de Chocolate
- M&M's, Ovomaltine, Sonho de Valsa

#### Caldas (6 itens - até 1 gratuita)
- Calda de Açaí, Calda de Caramelo, Calda de Chocolate
- Calda de Kiwi, Calda de Morango, Leite Condensado

## 🔐 Acessos Padrão

### Painel Administrativo
- **URL:** http://localhost:5173/setup
- **Senha Admin:** `1245`
- **Senha Funcionário:** `777`

> ⚠️ **IMPORTANTE:** Altere essas senhas em produção!

## 🎨 Funcionalidades do Sistema

### Para Clientes
- ✅ Carrinho de compras intuitivo
- ✅ Personalização de açaí com ingredientes
- ✅ Sistema de cupons de desconto
- ✅ Verificação automática de horário
- ✅ Envio de pedido via WhatsApp
- ✅ PWA (funciona como app no celular)

### Para Administradores
- ✅ Painel completo de administração
- ✅ Gerenciamento de produtos e preços
- ✅ Controle de categorias e ingredientes
- ✅ Sistema de cupons promocionais
- ✅ Relatórios financeiros e estatísticas
- ✅ Gerenciamento de pedidos
- ✅ Configuração de horários
- ✅ Controle de estoque (opcional)
- ✅ Impressão de pedidos

## 🔧 Tecnologias Utilizadas

- **Frontend:** React 19 + TypeScript
- **Build:** Vite 6
- **Banco de Dados:** Supabase (PostgreSQL)
- **Estilização:** TailwindCSS
- **Roteamento:** React Router
- **Ícones:** Lucide React
- **PWA:** Capacitor (Android)
- **Gráficos:** Recharts
- **Relatórios:** jsPDF

## 📱 Deploy e Produção

### Deploy na Vercel
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer deploy
vercel

# 3. Configurar variáveis de ambiente na Vercel
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

### Build para Android (APK)
```bash
# 1. Build do projeto
npm run build

# 2. Sincronizar com Android
npx cap sync android

# 3. Abrir no Android Studio
npx cap open android

# 4. Build → Build Bundle(s) / APK(s) → Build APK(s)
```

## 🐛 Solução de Problemas

### Problema: Credenciais não encontradas
**Solução:**
```bash
# Verifique se o .env.local existe
cat .env.local

# Se não existir, crie a partir do exemplo
copy .env.example .env.local
```

### Problema: Erro ao conectar com Supabase
**Solução:**
```bash
# Execute o script de verificação
npm run verify

# Ele indicará exatamente qual é o problema
```

### Problema: Tabelas não encontradas
**Solução:**
1. Acesse o Supabase SQL Editor
2. Execute os scripts SQL na ordem:
   - `supabase-schema.sql`
   - `supabase-storage.sql`
   - Os demais arquivos `.sql`

### Problema: Produtos não aparecem
**Solução:**
```bash
# Re-execute a importação
npm run import

# Ou verifique no Supabase Table Editor se há dados
```

## ⚡ Próximos Passos Após Migração

1. ✅ **Adicionar imagens** dos produtos
2. ✅ **Testar pedidos** via WhatsApp
3. ✅ **Configurar cupons** de desconto
4. ✅ **Ajustar horários** se necessário
5. ✅ **Personalizar cores** do tema
6. ✅ **Alterar senhas** de acesso
7. ✅ **Testar em dispositivos** mobile
8. ✅ **Fazer backup** do banco de dados

## 📞 Suporte

Consulte a documentação completa:
- **QUICK_START.md** - Para começar rapidamente
- **MIGRATION_GUIDE.md** - Para detalhes completos
- **README.md** - Para informações gerais do projeto

## 👨‍💻 Desenvolvedor

**@_nildoxz**

---

**Status:** ✅ Migração completa e pronta para uso  
**Última Atualização:** Dezembro 2025
