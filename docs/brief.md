# Project Brief: amalfi-company

> **Status:** Draft v1
> **Author:** @analyst (Atlas)
> **Date:** 2026-05-04
> **Source:** Discovery brainstorm session com o owner (coimbrafilmes)

---

## Executive Summary

A **Amalfi Company** é um seller na Amazon Brasil com estratégia de **catálogo curado de curva A** (~10 SKUs principalmente na categoria Casa). O projeto digital `amalfi-company` é uma **plataforma interna de IA para o seller** — um "co-piloto operacional" que substitui o uso ad-hoc de ChatGPT por um sistema integrado, dedicado e otimizado para o ecossistema Amazon BR.

**MVP**: módulo de **otimização de Amazon Ads (Sponsored Products)** — automação analítica que reduz ACoS, identifica desperdício de budget, faz keyword harvesting e recomenda (ou aplica) ações de bid/budget/negativas.

**Fase 2**: módulo de **geração completa de anúncios** — entrega listing 100% pronto (título, bullets, descrição, A+ Content, briefing/geração de imagens, backend keywords) a partir de fotos e ficha técnica do produto.

**Proposta de valor**: substituir trabalho manual + ChatGPT genérico por um sistema **especializado em Amazon, com dados reais de concorrência e operação contínua 24/7**.

---

## Problem Statement

### Estado atual e dores

O owner é seller Amazon BR operando sozinho, com catálogo enxuto (10 SKUs curva A). Os dois maiores gargalos operacionais são:

1. **Gestão de Amazon Ads (PPC) ineficiente**
   - Anúncios precisam de ajuste contínuo (bids, keywords, negativas, dayparting)
   - Sem ferramenta dedicada, decisões são reativas e baseadas em intuição
   - **ACoS provavelmente está acima do ideal**, queimando margem
   - Search Term Reports não são minerados sistematicamente
   - **Não há rotina diária de otimização** — owner acumula trabalho ou ignora

2. **Criação de listings (anúncios) é manual e dependente de ChatGPT genérico**
   - ChatGPT comum **não conhece** as regras específicas da Amazon BR (limites de char, formatação, requisitos de browse node)
   - Não usa **dados reais** de concorrência, BSR, ranking de keywords no marketplace
   - Não gera briefing visual (7 imagens, A+ Content)
   - Cada novo SKU consome **horas** de prompt engineering manual

### Impacto

- **Margem perdida** em Ads ineficientes (ACoS alto)
- **Ranking orgânico** comprometido por listings sub-otimizados
- **Custo de oportunidade**: cada hora gasta em copy/keywords manualmente é hora não gasta em sourcing, negociação ou expansão de catálogo

### Por que existirem soluções não resolve

- **Helium 10, Jungle Scout, DataDive**: cobertura BR é limitada e cara em USD; UI genérica para milhares de sellers; não personalizam para catálogo curado de curva A
- **Sellerise, Ad Badger, Perpetua**: focados em sellers de grande volume (centenas de SKUs); preço inviável para 10 SKUs
- **ChatGPT manual**: caixa de ferramentas geral, sem integração nem persistência; cada conversa começa do zero
- **Agências terceirizadas**: caras, lentas, e não conhecem o catálogo Amalfi

### Urgência

Amazon BR está em **fase de maturação acelerada** (CAGR ~30% a.a.). Seller que automatiza otimização agora ganha **share antes da concorrência se profissionalizar**.

---

## Proposed Solution

### Conceito

**Amalfi AI Seller Hub** — plataforma web interna, single-user, que orquestra dois módulos especializados em Amazon BR:

```
┌─────────────────────────────────────────────────────────┐
│              AMALFI AI SELLER HUB                        │
├──────────────────────┬──────────────────────────────────┤
│  Módulo 1: Listings  │  Módulo 2: Ads Optimizer         │
│  (Fase 2)            │  (MVP)                           │
│                      │                                  │
│  Input: foto + ficha │  Input: Amazon Ads API / CSV     │
│  Output: anúncio     │  Output: recomendações + ações   │
│  100% pronto         │  automáticas (com aprovação)     │
└──────────────────────┴──────────────────────────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
        ┌────────────────────────┐
        │  Claude API + Supabase │
        │  Amazon Ads API + LWA  │
        │  Keepa/H10 (opcional)  │
        └────────────────────────┘
```

### Diferenciadores

1. **Especializado em Amazon BR** — regras de char, browse nodes, dayparting calibrado para fuso BR, palavras em português, regras fiscais
2. **Dados reais** — integra com Amazon Ads API oficial e (futuramente) com Helium10/Keepa para concorrência
3. **Operação contínua** — bot diário, não sessão pontual de chat
4. **Curado para curva A** — UI e lógica otimizadas para 10-30 SKUs, não 1000+
5. **Owner-controlled** — todas ações destrutivas exigem aprovação; bot sugere, owner decide (com modo full-auto opcional para regras seguras)
6. **Persistência** — histórico de listings, versões A/B, decisões anteriores ficam salvos (oposto do ChatGPT que esquece tudo)

---

## Target Users

### Primary User Segment: Seller Amazon BR Owner-Operator (curva A)

- **Perfil**: empreendedor solo ou casal/família, opera 5-30 SKUs na Amazon BR, faturamento R$ 30k-500k/mês na plataforma
- **Comportamento atual**: usa Seller Central direto, ChatGPT manual para copy, planilhas Excel para acompanhar performance, sem ferramentas pagas dedicadas
- **Dores**:
  - Tempo gasto em tarefas repetitivas (copy, keyword research, ajuste de bids)
  - ACoS alto sem entender por quê
  - Anúncios "cansam" e perdem ranking sem saber agir rápido
- **Objetivos**:
  - Liberar tempo do operacional para focar em sourcing/produto
  - Reduzir ACoS, aumentar TACoS healthy
  - Escalar SKUs com qualidade sem proporcional aumento de tempo

**MVP é para esse segmento exclusivamente** — o owner do projeto (coimbrafilmes) é o único usuário inicial.

### Secondary Segment (futuro pós-validação)

Outros sellers Amazon BR no mesmo perfil (curva A, 5-30 SKUs). **Out of scope do MVP**, mas a plataforma é desenhada para potencialmente virar SaaS multi-tenant no futuro.

---

## Goals & Success Metrics

### Business Objectives

- **Reduzir ACoS médio dos top 3 SKUs em ≥25% nos primeiros 60 dias de uso**
- **Substituir 100% do uso de ChatGPT manual** para tarefas de Amazon (Listing + Ads) até final do MVP+Fase 2
- **Liberar ≥5 horas/semana** do owner em tarefas operacionais até fim da Fase 2
- **Atingir TACoS saudável** (referencial: <12% para categoria Casa)

### User Success Metrics

- **Tempo médio para criar anúncio completo**: hoje ~3-5 horas → meta Fase 2: <30 minutos com ferramenta
- **Frequência de checagem/otimização de Ads**: hoje semanal/quinzenal → meta MVP: diária automatizada
- **Confiança nas decisões de Ads**: hoje "intuição" → meta MVP: dados + recomendações com rationale

### Key Performance Indicators (KPIs)

- **ACoS médio (top 3 SKUs)**: baseline a coletar → meta -25% em 60d → -40% em 120d
- **TACoS**: baseline → meta <12%
- **Search Term Impression Share**: baseline → meta +30%
- **Wasted Ad Spend** (cliques sem conversão >30 dias): baseline → meta <10% do budget
- **Tempo de criação de listing**: baseline 3-5h → meta <30min (Fase 2)
- **Adoção da ferramenta**: ≥80% das decisões de Ads passando pela ferramenta após 30 dias

---

## MVP Scope

### Core Features (Must Have) — Módulo 2: Ads Optimizer

- **Conexão com Amazon Ads API (Login with Amazon + refresh tokens)**: autenticação OAuth e renovação automática de tokens
- **Coleta diária de dados**: Sponsored Products reports (campaign, search term, placement, keyword performance) salvos no Supabase
- **Dashboard de performance**: visão consolidada de ACoS, TACoS, CTR, CR, gasto vs. vendas atribuídas, por SKU/campanha/keyword
- **Engine de recomendações com IA (Claude)**:
  - Identificar keywords vencedoras (alto CR, baixo ACoS) → sugerir aumento de bid
  - Identificar keywords queimando dinheiro (cliques >X sem conversão) → sugerir negativas
  - Keyword harvesting (search terms convertedoras → criar keywords exatas em campanhas dedicadas)
  - Detecção de canibalização entre campanhas
  - Detecção de bleeding budget
- **Sistema de aprovação**: cada recomendação vem com rationale; owner aprova/rejeita/edita
- **Modo automático seguro**: regras conservadoras pré-aprovadas rodam sem confirmação (ex: pausar keyword com 0 conversão em 50+ cliques)
- **Histórico de ações**: log completo de mudanças aplicadas, com possibilidade de rollback
- **Modo fallback CSV**: enquanto API não está credenciada, owner sobe CSV manual (Search Term Report) e ferramenta processa

### Out of Scope for MVP

- Módulo 1 (Listing Generator) — fase 2
- Multi-tenancy (suporte a outros sellers) — fase 3+
- Sponsored Brands / Sponsored Display (foco MVP é Sponsored Products)
- DSP / Amazon Ads avançado
- Integração com Helium 10 / DataDive / Keepa (manter MVP enxuto)
- Análise de concorrência ativa (BSR tracking de competidores)
- Integração com ERP / sistema fiscal / NF-e
- Mobile app nativo (responsive web é suficiente)
- App público / SaaS (interno apenas)

### MVP Success Criteria

MVP é considerado bem-sucedido quando:
1. Conexão com Amazon Ads API funcionando (ou fallback CSV operacional enquanto API não sai)
2. Owner consegue ver, em <60s, o estado de saúde de todas as campanhas
3. Engine gera ≥10 recomendações úteis/semana (úteis = owner aplicaria)
4. **ACoS médio dos top 3 SKUs reduz ≥10% nos primeiros 30 dias** (sinal forte de tração)
5. Owner declara: "deixei de usar ChatGPT para questões de Ads"

---

## Post-MVP Vision

### Phase 2 Features (3-6 meses pós-MVP)

- **Módulo 1 — Listing Generator completo**: foto + ficha → anúncio 100% pronto (título, 5 bullets, descrição, A+ Content, briefing visual, backend keywords, browse node correto)
- **Geração de imagens com IA** (Flux/Midjourney via API + edição automática)
- **Análise de concorrência** (top 10 BSR por subcategoria)
- **A/B testing de listings** com tracking automático de impacto

### Long-term Vision (1-2 anos)

- **Multi-marketplace**: estender para Mercado Livre, Magalu, Shopee
- **Multi-seller (SaaS)**: produto vendável para outros sellers Amazon BR no perfil curva A
- **Forecasting de demanda** com IA (reposição, sazonalidade)
- **Auto-pilot completo** com confiança calibrada (mais decisões automatizadas conforme histórico de acertos cresce)
- **Conteúdo audiovisual integrado** (alavancando expertise do owner em coimbrafilmes — vídeos de produto, A+ rich media)

### Expansion Opportunities

- Marketplace de templates de listing (sellers compartilham templates premium)
- Comunidade/curso pago para sellers Amazon BR
- White-label para agências de e-commerce

---

## Technical Considerations

### Platform Requirements

- **Target Platforms**: Web app responsivo (desktop-first, mobile-friendly)
- **Browser/OS Support**: Chrome/Safari/Edge atualizados (sem IE/legacy)
- **Performance Requirements**:
  - Dashboard carrega em <2s
  - Sync diário Amazon Ads API <10min para 10 SKUs
  - Geração de recomendação via Claude API <30s

### Technology Preferences

- **Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind, shadcn/ui
- **Backend**: Next.js API routes para MVP (simples); migrar para serviço separado se escalar
- **Database**: Supabase (Postgres + Auth + RLS + Storage para imagens futuras)
- **Hosting/Infrastructure**: Vercel (frontend + serverless) + Supabase (gerenciado), região priorizando latência BR (gru1 ou similar)
- **IA/LLM**: Claude API — Sonnet 4.6 (geração principal, raciocínio) + Haiku 4.5 (tarefas rápidas/baratas) com prompt caching agressivo

### Architecture Considerations

- **Repository Structure**: monorepo (este repo `amalfi-company`)
- **Service Architecture**: monolito Next.js no MVP; jobs assíncronos via Supabase Edge Functions ou Vercel Cron para sync diário Amazon Ads
- **Integration Requirements**:
  - **Amazon Advertising API** (Sponsored Products v3): OAuth via Login with Amazon, refresh tokens criptografados
  - **Claude API** (Anthropic): API key em env, prompt caching para economia
  - **(Fase 2)** Helium 10 / Keepa para dados de concorrência
- **Security/Compliance**:
  - **LGPD** — embora single-user no MVP, planejar para multi-user (consentimento, opt-out, export, delete)
  - Refresh tokens Amazon: criptografados em rest, nunca logados
  - Supabase RLS habilitado desde dia 1 (mesmo single-user, prepara para multi-tenant)
  - Secrets em variáveis de ambiente Vercel + .env.local nunca commitado

---

## Constraints & Assumptions

### Constraints

- **Budget**: zero/baixo — owner solo, sem capital externo. Stack precisa ser barata em escala 10 SKUs (Vercel Hobby + Supabase Free no início; Claude API é o maior custo variável)
- **Timeline**: indicação preliminar — MVP utilizável em **8-12 semanas**; sujeito a ajuste após PRD do PM
- **Resources**: 1 dev (você + IA), tempo parcial. Sem designer dedicado — UI virá de shadcn/ui templates
- **Technical**:
  - Amazon Ads API requer credenciamento (5-15 dias úteis, gratuito) — bloqueio inicial mitigado por fallback CSV
  - Amazon BR tem menos APIs e dados disponíveis vs US (sem Brand Analytics avançado, sem alguns reports)

### Key Assumptions

- Owner tem CNPJ ativo e conta seller "Pro" (necessário para Amazon Ads API)
- Owner tem acesso/disposição para fazer credenciamento da Amazon Ads API
- Volume de 10 SKUs é estável; mudança para 100+ SKUs revisaria o design
- Claude API permanece o LLM de escolha (custo/qualidade superior); migração para outro LLM é feasible mas não prioritária
- Owner aceita modelo "sugerir + aprovar" no MVP, com modo automático conservador
- Margem de erro tolerável em decisões automáticas: zero para regras destrutivas (pausar/excluir), pequena para regras incrementais (ajustar bid ±10%)

---

## Risks & Open Questions

### Key Risks

- **Credenciamento Amazon Ads API atrasa ou é negado**: impacto MÉDIO — mitigação via fallback CSV (owner exporta manualmente até liberação)
- **Custo da Claude API escala mal**: impacto MÉDIO — mitigação: prompt caching agressivo, Haiku para tarefas leves, batching, rate limit interno
- **Modelo de "sugerir + aprovar" cria fricção excessiva**: impacto BAIXO-MÉDIO — mitigação: modo automático para regras seguras desde o MVP
- **Dados Amazon BR são insuficientes para análise robusta**: impacto MÉDIO — mitigação: aceitar fase de "calibração" inicial onde owner valida decisões; sistema aprende
- **LGPD e segurança de tokens Amazon**: impacto ALTO se vazar — mitigação: criptografia em rest, RLS, auditoria, secrets management rigoroso
- **Owner muda foco para outras frentes (vida acontece)**: impacto BAIXO — projeto é interno, sem stakeholder externo

### Open Questions

- Qual o **ACoS médio atual** dos top 3 SKUs? (baseline para medir sucesso)
- Qual o **budget mensal de Amazon Ads** atualmente?
- Já existe alguma **integração Amazon** configurada (token, app)?
- O owner aceita compartilhar **CSVs reais de Search Term Report** para calibração inicial do sistema?
- Existem **regras manuais que owner já aplica** que podem virar regras automáticas? (ex: "sempre pauso keyword com X cliques sem venda")
- Qual o **prazo realista** que owner pode dedicar por semana ao projeto? (calibra cronograma)

### Areas Needing Further Research

- **Amazon Advertising API BR**: rate limits, escopos disponíveis, diferenças vs US (research técnico do @architect)
- **Categoria Casa Amazon BR**: benchmarks de ACoS, TACoS, CTR, CR para calibrar metas (research do @analyst em fase de baseline)
- **Modelos de IA para keyword research em pt-BR**: comparar Claude com alternativas para extração semântica em português
- **LGPD para SaaS multi-tenant futuro**: estrutura de consentimento, DPO, contratos quando virar produto

---

## Appendices

### A. Research Summary

Discovery brainstorm (sessão 2026-05-04) com Atlas, ranqueamento de hipóteses e convergência para o escopo atual via diálogo iterativo. Pistas iniciais (nome "Amalfi" + perfil coimbrafilmes audiovisual) levaram a 5 territórios divergentes; owner convergiu para "seller Amazon BR" → "ferramenta interna de Ads + Listing".

### B. Stakeholder Input

- **Owner (coimbrafilmes)**: cliente único e operador. Validou MVP focado em Ads Optimizer; concordou com fase 2 para Listing Generator.

### C. References

- Repositório: https://github.com/coimbrafilmes/amalfi-company
- Amazon Advertising API docs: https://advertising.amazon.com/API/docs
- Amazon Sponsored Products v3 spec: https://advertising.amazon.com/API/docs/en-us/sponsored-products/3-0/openapi
- Anthropic Claude API: https://docs.claude.com/

---

## Next Steps

### Immediate Actions

1. Owner coleta **baseline de métricas** (ACoS, TACoS, budget mensal) dos top 3 SKUs — preencher Open Questions
2. Owner inicia **processo de credenciamento Amazon Ads API** (developer.amazon.com) em paralelo ao desenvolvimento — aprovação leva 5-15 dias
3. Handoff para **@pm (Morgan)** criar o PRD detalhado a partir deste brief
4. **@architect (Aria)** posteriormente valida stack e desenha arquitetura técnica
5. **@data-engineer (Dara)** modelará schema Supabase para reports Amazon Ads
6. Após PRD aprovado: **@sm (River)** quebra em stories, **@dev (Dex)** implementa

### PM Handoff

Este Project Brief fornece o contexto completo para `amalfi-company` — uma plataforma interna de IA para seller Amazon Brasil, focada em otimização de Sponsored Products como MVP e geração de listings como fase 2.

**@pm** — por favor, comece em **PRD Generation Mode**, revise este brief detalhadamente e trabalhe com o owner para criar o PRD seção por seção, conforme o template indica. Pontos de atenção:

1. Aprofundar **regras de automação seguras** vs **que precisam aprovação manual**
2. Detalhar **fluxos do dashboard** (jornada do owner: login → vê alertas → revisa recomendações → aprova/rejeita)
3. Especificar **modelo de aprendizado da engine** (calibração inicial, feedback loop)
4. Confirmar **MVP vs Out-of-Scope** com owner em cada feature
5. Definir critérios objetivos para **dispar Fase 2 (Listing Generator)** — ex: "se ACoS dos top 3 não cair 25% em 60 dias, listing é gargalo"

---

_Brief gerado por @analyst (Atlas) — sessão de discovery 2026-05-04._
