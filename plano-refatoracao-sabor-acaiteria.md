# 🛠️ Plano de Refatoração e Testes: Sabor Açaíteria

Este plano visa transformar o monólito `App.tsx` em uma arquitetura modular, escalável e testável, seguindo as melhores práticas de desenvolvimento Web em 2025.

## 📋 Visão Geral
- **Projeto:** Sabor Açaíteria (Sistema de Delivery)
- **Status Atual:** Arquivo `App.tsx` com ~4000 linhas, lógica misturada com UI.
- **Objetivo:** Modularização total, extração de serviços de dados e implementação de suíte de testes (Unitários + E2E).

---

## 🏗️ Fase 1: Modularização da Estrutura

### 1.1 Extração de Contextos (Domain-Driven)
Dividir o `AppProvider` gigante em contextos menores para evitar re-renders desnecessários e facilitar a manutenção.
- [ ] Criar `src/contexts/CartContext.tsx`
- [ ] Criar `src/contexts/ProductContext.tsx`
- [ ] Criar `src/contexts/CategoryContext.tsx`
- [ ] Criar `src/contexts/OrderContext.tsx`
- [ ] Criar `src/contexts/SettingsContext.tsx`

### 1.2 Extração de Componentes e Páginas
Mover componentes embutidos para arquivos dedicados.
- [ ] Criar pasta `src/components/layout/` (Header, Footer, Sidebar, FloatingCartButton)
- [ ] Criar pasta `src/components/modals/` (ExitModal, ConfirmModal, etc)
- [ ] Criar pasta `src/pages/` e mover:
    - [ ] `HomePage.tsx`
    - [ ] `CartPage.tsx`
    - [ ] `CheckoutPage.tsx`
    - [ ] `AdminPanel.tsx`
    - [ ] `AdminSubPages/` (Orders, Coupons, Addons, Settings, Theme)

### 1.3 Camada de Serviços (Supabase)
Centralizar as chamadas ao Supabase para remover lógica de banco de dados dos componentes.
- [ ] Criar `src/services/supabaseService.ts`
- [ ] Implementar funções CRUD tipadas.

---

## 🧪 Fase 2: Implementação de Testes

### 2.1 Testes Unitários (Vitest)
Focar em lógicas de negócio complexas.
- [ ] Testar `calculateStoreStatus` (Lógica de horários de abertura/fechamento).
- [ ] Testar lógica do Carrinho (adição, remoção, cálculo de totais).
- [ ] Testar aplicação de cupons e regras de valor mínimo.

### 2.2 Testes E2E (Playwright)
Garantir que os fluxos críticos funcionam de ponta a ponta.
- [ ] Fluxo completo: Home → Seleção de Produto → Personalização → Carrinho → Checkout → WhatsApp.
- [ ] Fluxo Admin: Login → Alteração de Preço → Verificação no Site.

---

## 🧹 Fase 3: Limpeza e Estabilização

### 3.1 Gestão de Dados (Git & SQL)
- [ ] Organizar scripts SQL deletados em `supabase/migrations/` para preservação histórica.
- [ ] Validar variáveis de ambiente e segurança (RLS - Row Level Security).

### 3.2 Polimento Visual (Premium)
- [ ] Substituir cores genéricas por paletas harmoniosas (evitando roxo puro conforme regras internas).
- [ ] Adicionar micro-animações nas transições de página e interações do carrinho.

---

## ✅ Critérios de Sucesso
- `App.tsx` reduzido para menos de 100 linhas (apenas rotas e provedores).
- Cobertura de testes nos fluxos críticos.
- Build de produção sem erros de lint ou TypeScript.
- Interface mais fluida e responsiva (Métrica Core Web Vitals).

---

## 🤖 Agentes Responsáveis
- **Orquestração Geral:** `@project-planner`
- **Refatoração UI:** `@frontend-specialist`
- **Backend/Supabase:** `@backend-specialist`
- **Testes:** `@test-engineer`
