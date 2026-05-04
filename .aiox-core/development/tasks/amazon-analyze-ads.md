# amazon-analyze-ads

**Task ID:** amazon-analyze-ads
**Version:** 1.0.0
**Created:** 2026-05-04
**Agent:** @amalfi-amazon (Marco)

---

## Purpose

Analisar CSV exportado do Seller Central (Search Term Report ou Campaign Performance Report) e gerar recomendações acionáveis: pausar/subir bid/adicionar negativas/harvesting.

**Output**: arquivo `ads-analyses/{date}-{report-type}.md` com tabelas prontas pro owner aplicar no Seller Central.

---

## Inputs

```yaml
inputs:
  - name: csv_path
    type: string
    required: true
    description: Path local do arquivo CSV exportado
    example: "./reports/search-term-2026-05-04.csv"
  
  - name: report_type
    type: enum
    required: false
    default: auto-detect
    options: [search-term, campaign-performance, placement, keyword]
    description: Tipo do relatório (auto-detect se ausente)
  
  - name: period_label
    type: string
    required: false
    description: Label opcional do período (ex: "últimos 30 dias")
```

---

## Outputs

```yaml
outputs:
  - name: analysis_file
    type: file
    path: "agents/amalfi-amazon/ads-analyses/{date}-{report-type}.md"
    persisted: true
  
  - name: chat_summary
    type: text
    persisted: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] CSV file existe no path fornecido
    blocker: true
    error_message: "CSV não encontrado em {path}. Verifique o caminho."
  
  - [ ] CSV tem encoding válido (UTF-8 ou Latin-1)
    blocker: true
  
  - [ ] kb/ads-playbooks.md acessível
    blocker: true
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Arquivo de análise criado
    blocker: true
  
  - [ ] Pelo menos 1 ação recomendada OU declaração "tudo ok"
    blocker: true
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] CSV parseado com sucesso
    blocker: true
  
  - [ ] Métricas agregadas calculadas (ACoS, TACoS, CTR, CR, wasted spend)
    blocker: true
  
  - [ ] Tabelas geradas: pause, negativas, bid up, bid down, harvest
    blocker: true
  
  - [ ] Estimativas de impacto financeiro (R$/mês)
    blocker: false
  
  - [ ] Output preenche template ads-analysis-output.md.template
    blocker: true
```

---

## Process

### Step 1: Detectar Tipo de Relatório

```
Se report_type não fornecido, detectar via colunas do CSV:

Search Term Report:
  - Tem coluna "Customer Search Term"
  - Tem coluna "Targeting" ou "Keyword"
  - Tem ACoS por search term

Campaign Performance Report:
  - Tem coluna "Campaign Name"
  - Métricas agregadas por campanha

Keyword Report:
  - Tem coluna "Keyword"
  - Match Type
  - Sem search term

Placement Report:
  - Top of Search vs Rest of Search vs Product Pages
```

### Step 2: Parse e Limpeza

```
1. Ler CSV com encoding apropriado
2. Normalizar headers (Amazon BR pode vir em pt-BR ou en-US)
3. Converter tipos:
   - Cliques → int
   - Spend → float (atenção a "R$ 1.234,56" → 1234.56)
   - ACoS → float (remover "%")
   - Conversões → int
   - Sales → float
4. Filtrar linhas com dados completos
5. Identificar período (datas first/last se disponível)
```

### Step 3: Calcular Métricas Agregadas

```
Total spend = sum(spend)
Total sales = sum(sales)
ACoS médio = total_spend / total_sales × 100
TACoS estimado = ad_spend / total_revenue × 100  (se total_revenue não no CSV, marcar "N/A")
CTR médio = sum(clicks) / sum(impressions) × 100
CR médio = sum(orders) / sum(clicks) × 100
Wasted spend = sum(spend onde orders=0)
Wasted % = wasted_spend / total_spend × 100
```

### Step 4: Aplicar Playbooks (kb/ads-playbooks.md)

#### 🛑 Pausar Keywords
```
Critério A (rigoroso): clicks ≥ 50 AND orders = 0 (período ≥ 30 dias)
Critério B (menos rigoroso): clicks ≥ 30 AND orders = 0 (período ≥ 14 dias)

Para cada keyword que passa:
  - Adicionar à tabela de pause
  - Calcular spend total dela = potencial economia
```

#### ➕ Adicionar Negativas
```
Critério: search_term com clicks ≥ 10 AND orders = 0

Para cada search term:
  - Sugerir match type (Exact se único, Phrase se ambíguo)
  - Calcular spend dela = economia
```

#### 📈 Subir Bid (vencedoras)
```
Critério: clicks ≥ 10 AND CR ≥ 8% AND ACoS ≤ 25%

Para cada keyword:
  - Sugerir bid +15-25%
  - Estimar lift de vendas (atual sales × 1.2)
```

#### 📉 Baixar Bid (pesadas)
```
Critério: clicks ≥ 30 AND ACoS > 50% AND CR < 5%

Para cada keyword:
  - Sugerir bid -20-30%
  - Estimar economia
```

#### 🌾 Harvesting
```
Critério: search_term com orders ≥ 2 (vindo de Auto/Broad/Phrase)

Para cada search term:
  - Sugerir criar Exact Match em campanha dedicada
  - Sugerir adicionar como Negative Exact na origem (evitar canibalização)
  - Estimar lift de conversão no exact match
```

### Step 5: Análise Adicional

```
- Distribuição de spend (top performers vs bottom vs wasted)
- Análise por campanha (top 5 por gasto)
- Análise por SKU/ASIN (top 5)
- Insights "quentes" (padrões interessantes detectados)
```

### Step 6: Estimativas Financeiras

```
Economia mensal estimada = sum(spend de keywords pausadas) +
                            sum(spend evitado por negativas) +
                            sum(redução por bids baixados)

Lift de vendas estimado = (lift% médio nas vencedoras) × current_sales
```

### Step 7: Plano de Aplicação

```
Estruturar em passos sequenciais que owner pode executar no Seller Central:

Passo 1: Negativas (mais rápido, baixo risco)
Passo 2: Pausar keywords ruins
Passo 3: Ajustar bids
Passo 4: Criar harvesting

Estimar tempo total de aplicação.
```

### Step 8: Comparação com Análise Anterior (se existir)

```
Procurar análise anterior em ads-analyses/ (mais recente antes desta).
Se existir:
  - Comparar métricas (ACoS antes vs agora)
  - Identificar progresso (melhorou? piorou?)
  - Notar ações aplicadas que tiveram efeito
```

### Step 9: Persistência

```
1. Carregar template ads-analysis-output.md.template
2. Preencher placeholders
3. Salvar em ads-analyses/{date}-{report-type}.md
4. Apresentar resumo no chat
```

---

## Error Handling

```yaml
errors:
  - error: CSV path não existe
    fallback: avisar e abortar
  
  - error: CSV está vazio (0 linhas)
    fallback: avisar owner ("relatório vazio — talvez período sem dados?")
  
  - error: encoding inválido
    fallback: tentar Latin-1, depois CP1252, depois falhar
  
  - error: colunas críticas ausentes
    fallback: avisar quais colunas estão faltando, sugerir re-export
```

---

## Performance

```yaml
expected_duration: 1-3 minutos (depende do tamanho do CSV)
expected_cost: ~R$ 0.10-0.30 por análise
```

---

## Notes for Implementation

- **CSV pode ser grande**: usar streaming se >10MB
- **Privacidade**: search terms podem conter PII (buscadores Amazon) — não enviar pra fora
- **Períodos**: idealmente análise sobre janela ≥ 14 dias (estatística mais válida)

---

_Task v1.0.0 — criada por @aiox-master pra @amalfi-amazon._
