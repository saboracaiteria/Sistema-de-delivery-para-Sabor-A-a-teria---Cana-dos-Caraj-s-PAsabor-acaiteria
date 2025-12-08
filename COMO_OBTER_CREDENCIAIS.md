# 🔐 Como Obter Credenciais do Supabase

## Passo 1: Acessar o Dashboard

Acesse: https://supabase.com/dashboard

## Passo 2: Selecionar/Criar Projeto

- Se já tem um projeto: Clique nele
- Se não tem: Clique em "New Project"
  - Nome: "Sabor Acaiteria" (ou qualquer nome)
  - Database Password: Crie uma senha forte
  - Region: Escolha a mais próxima (South America - São Paulo)
  - Clique em "Create new project"
  - Aguarde alguns minutos até o projeto ser criado

## Passo 3: Acessar as Configurações de API

1. No menu lateral do projeto, clique em **Settings** (ícone de engrenagem ⚙️)
2. Depois clique em **API**

## Passo 4: Copiar as Credenciais

Você verá uma página com várias informações. Precisa copiar:

### 1. Project URL
```
Configuration → Project URL
https://xxxxxxxxxxxxx.supabase.co
```
**👆 Copie este valor completo**

### 2. anon/public Key
```
Project API keys → anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...muito-longa...
```
**👆 Clique no ícone de "Copy" ao lado desta chave**

## Passo 5: Fornecer as Credenciais

Cole aqui no chat:

```
URL: https://seu-projeto.supabase.co
KEY: eyJhbGc...sua-chave-completa...
```

## ⚠️ IMPORTANTE

- **NÃO compartilhe** a chave `service_role` (ela é secreta!)
- Use apenas a chave **anon/public** (ela é segura para uso no frontend)
- Mantenha a chave **service_role** em segredo

## Após Fornecer as Credenciais

Eu vou:
1. ✅ Configurar o arquivo `.env.local`
2. ✅ Executar os scripts SQL no Supabase
3. ✅ Importar todos os dados (produtos, categorias, ingredientes)
4. ✅ Verificar se tudo funcionou

---

**Estou aguardando suas credenciais para continuar! 🚀**
