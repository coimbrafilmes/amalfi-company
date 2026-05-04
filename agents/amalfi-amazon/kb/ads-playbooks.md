# Playbooks — Sponsored Products Amazon BR

> Estratégias e regras pra otimização de campanhas Sponsored Products no contexto Amalfi (revendedor sem marca, ~10 SKUs curva A, categoria Casa).

---

## 🏗️ Estrutura de Campanhas Recomendada (por SKU)

Para cada SKU principal, criar **4 campanhas em paralelo**:

### 1. Auto Campaign (descoberta)
- **Tipo**: Sponsored Products — Auto Targeting
- **Bid**: low (R$ 0.30-0.50 inicialmente)
- **Budget**: R$ 20-30/dia
- **Objetivo**: descobrir keywords que Amazon match automaticamente
- **Análise**: rodar Search Term Report semanal e fazer **harvesting** (mover convertedoras pra Manual Exact)

### 2. Manual Broad (escala)
- **Tipo**: Sponsored Products — Manual, Broad Match
- **Keywords**: top 5-10 keywords primárias
- **Bid**: médio (R$ 0.50-1.00)
- **Budget**: R$ 30-50/dia
- **Objetivo**: capturar variações da intenção de busca
- **Atenção**: precisa de muitas negativas pra não desperdiçar

### 3. Manual Phrase (refinamento)
- **Tipo**: Sponsored Products — Manual, Phrase Match
- **Keywords**: keywords principais que já performaram em Broad ou Auto
- **Bid**: médio-alto
- **Budget**: R$ 40-60/dia
- **Objetivo**: matchar com mais precisão sem perder volume

### 4. Manual Exact (rentabilidade)
- **Tipo**: Sponsored Products — Manual, Exact Match
- **Keywords**: APENAS termos que provaram conversão (vindos de Auto/Broad/Phrase)
- **Bid**: alto (vence top of search)
- **Budget**: R$ 50-100/dia
- **Objetivo**: maximizar conversão nas keywords vencedoras

---

## 📐 Estágios de Vida da Campanha

### 🚀 Launch (primeiras 2 semanas)
- **Foco**: gerar dados, não rentabilidade
- **ACoS aceitável**: até 60-80% (você tá comprando aprendizado)
- **Bids**: agressivos pra ranquear top of search
- **Budget**: full daily (não cortar)
- **NÃO mexer em**: bids, negativas, pausas (deixar Amazon rodar 14 dias)

### 📈 Scaling (semanas 3-8)
- **Foco**: encontrar ponto de equilíbrio ROI
- **ACoS alvo**: 35-45%
- **Ações**: começar harvesting, adicionar negativas, ajustar bids
- **Budget**: realocar pra campanhas que convertem

### ✅ Mature (mês 3+)
- **Foco**: maximizar lucro
- **ACoS alvo**: <30% (idealmente <25%)
- **Ações**: refinar bids por hora/dia, dayparting, automatizar regras
- **Budget**: aumentar nas vencedoras, cortar nas medíocres

---

## ✂️ Regras Seguras de Otimização (aplicar sem medo)

### Pausar Keyword
**Trigger**: keyword com 50+ cliques E 0 conversões em 30 dias
**Ação**: pausar imediatamente
**Rationale**: estatisticamente significativo que não converte

### Pausar Keyword (versão menos rigorosa)
**Trigger**: 30+ cliques, 0 conversões, 14 dias
**Ação**: pausar (mas pode reativar depois com bid menor)
**Rationale**: dá um tempo, pode ser sazonal

### Adicionar como Negativa (Search Term)
**Trigger**: search term com 10+ cliques E 0 conversões
**Ação**: adicionar como **Negative Exact** na campanha
**Rationale**: economia imediata, sem risco de perder vendas

### Subir Bid
**Trigger**: keyword com **CR ≥ 8%** E **ACoS ≤ 25%** E **10+ cliques**
**Ação**: subir bid em 15-25%
**Rationale**: keyword vencedora — investir mais nela

### Baixar Bid
**Trigger**: keyword com **ACoS > 50%** E **CR < 5%** E **30+ cliques**
**Ação**: baixar bid em 20-30%
**Rationale**: tá pagando demais por essa intenção

### Harvesting (Search Term → Exact Keyword)
**Trigger**: search term com **2+ conversões** vindo de Auto ou Broad
**Ação**:
1. Adicionar essa search term como **Exact Keyword** numa campanha Manual Exact dedicada
2. Adicionar essa mesma search term como **Negative Exact** na campanha de origem (pra não competir com você mesmo)
**Rationale**: você captura conversão garantida no exato e evita canibalização

### Pausar Campaign Inteira
**Trigger**: campanha gastou >R$ 100 sem 1 venda atribuída
**Ação**: pausar e diagnosticar listing antes de retomar
**Rationale**: provavelmente o problema não é Ads — é conversão (listing)

---

## 🎯 Negativas Pré-Definidas (Categoria Casa)

Adicionar essas negativas em **TODAS** as campanhas Sponsored Products de SKUs Casa Amalfi:

### Negativas Universais (qualquer categoria)
- usado
- usada
- segunda mão
- defeito
- consertar
- reparar
- manual
- instruções
- gratis
- grátis
- free
- baixar

### Negativas específicas Casa
- atacado
- revenda
- fabrica
- fábrica
- importadora

### Negativas pra evitar canibalização entre campanhas
- (depende — adicionar quando harvesting cria conflitos)

---

## 📊 KPIs por Linha de Ação

| Ação | KPI primário | KPI secundário | Meta inicial |
|---|---|---|---|
| Pausar keywords ruins | Wasted spend ↓ | ACoS ↓ | -10% gasto em 7 dias |
| Negativas | CTR ↑ | CR ↑ | +0.2% CTR |
| Subir bid em vencedoras | Vendas atribuídas ↑ | Posição ↑ | +20% vendas em 14 dias |
| Harvesting | ACoS no exato ↓ | CR ↑ | ACoS exato <20% |
| Dayparting | Orçamento utilizado em hora certa | ROAS ↑ | -15% ACoS |

---

## ⏰ Dayparting (Brasil)

### Padrões observados em Casa BR
- **Pico de conversão**: 19h-23h (horário de Brasília)
- **Pico de cliques sem conversão**: 8h-12h (browsing morning)
- **Madrugada (00h-6h)**: baixo volume, baixo CR

### Estratégia
- Boost bid +20% das 19h-23h
- Reduzir bid -30% das 8h-12h
- Pausar das 00h-6h se budget apertado

> **Importante**: Amazon Ads nativo não permite dayparting fácil. Owner aplica manualmente OU usa scripts. Pra Amalfi (10 SKUs), aplicação manual semanal já basta.

---

## 🔁 Cadência de Otimização

### Semanal (toda segunda-feira — 1h)
- Exportar Search Term Report dos últimos 7 dias
- Rodar `*analyze-ads {csv}` no Marco
- Aplicar recomendações no Seller Central
- Anotar ações no histórico

### Quinzenal (a cada 2 semanas — 30 min)
- Revisar bid adjustments por keyword vencedora
- Identificar campanhas pra escalar budget
- Identificar campanhas pra cortar

### Mensal (1 vez por mês — 2h)
- Análise estratégica: TACoS, market share, novos SKUs ascendendo
- Decidir se mantém estrutura de campanhas ou muda
- Possível auditoria de listings com `*audit-listing`

---

## 🚨 Sinais de Alerta (escalar atenção)

- **TACoS subindo mês a mês** → listing comprometido OU concorrência aumentando
- **Buy Box <85%** → preço alto OU estoque baixo OU conta com problemas
- **CTR caindo abruptamente** → algoritmo Amazon mexeu OU competidor melhorou listing
- **Conversão caindo** → review ruim novo OU mudança de preço OU listing alterado

---

## 💸 Orçamento Inicial Recomendado

Para SKU novo entrando em Casa Amazon BR:

| Item | Valor inicial |
|---|---|
| Auto Campaign | R$ 20/dia × 14 dias = R$ 280 |
| Manual Broad | R$ 30/dia × 14 dias = R$ 420 |
| Manual Phrase | R$ 30/dia × 14 dias = R$ 420 |
| Manual Exact | R$ 0 (criar só após semana 2) |
| **Total launch (14 dias)** | **R$ 1.120** |

Após 14 dias, realocar baseado em performance.

---

## 🎓 Princípios Centrais

1. **Não mexa nas primeiras 2 semanas** — dados estatisticamente válidos precisam de janela
2. **Negativa é seu melhor amigo** — economia silenciosa contínua
3. **Harvesting é quase mágica** — search term que converteu MERECE virar exact
4. **Listing > Ads** — ACoS resistente a cair = problema de conversão (listing)
5. **Mobile-first** — 80% do tráfego BR é mobile; otimize bids pra placement mobile
6. **Brand defense não se aplica** (sem marca) — foque 100% em Sponsored Products

---

_Playbooks mantidos por @amalfi-amazon (Marco). Atualizar conforme aprendizado real do Amalfi._
