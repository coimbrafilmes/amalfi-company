# amazon-audit-listing

**Task ID:** amazon-audit-listing
**Version:** 1.0.0
**Created:** 2026-05-04
**Agent:** @amalfi-amazon (Marco)

---

## Purpose

Auditar listing Amazon BR existente via ASIN público. Identifica problemas (P0/P1/P2), atribui score 0-100, gera plano de ação priorizado.

**Output**: arquivo `outputs/{ASIN}/{date}-audit.md` + resumo no chat.

---

## Inputs

```yaml
inputs:
  - name: asin
    type: string
    required: true
    pattern: "^B0[A-Z0-9]{8}$"
    description: ASIN do produto na Amazon BR
  
  - name: deep_analysis
    type: boolean
    required: false
    default: true
    description: Se true, faz WebFetch e análise comparativa de concorrentes
```

---

## Outputs

```yaml
outputs:
  - name: audit_file
    type: file
    path: "agents/amalfi-amazon/outputs/{asin}/{date}-audit.md"
    persisted: true
  
  - name: chat_summary
    type: text
    persisted: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] ASIN fornecido e válido
    blocker: true
  
  - [ ] WebFetch tool disponível
    blocker: true
  
  - [ ] kb/amazon-br-rules.md acessível
    blocker: true
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Arquivo de auditoria criado
    blocker: true
  
  - [ ] Score 0-100 atribuído com rationale
    blocker: true
  
  - [ ] Pelo menos 1 issue P0/P1/P2 identificado OU declaração explícita "tudo ok"
    blocker: true
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] WebFetch retornou conteúdo da página Amazon (mesmo que parcial)
    blocker: true
  
  - [ ] Score por dimensão (10 dimensões) preenchido
    blocker: true
  
  - [ ] Plano de ação com prioridades (P0/P1/P2)
    blocker: true
  
  - [ ] Estimativa de impacto pelo menos qualitativa
    blocker: false
  
  - [ ] Output preenche template audit-output.md.template
    blocker: true
```

---

## Process

### Step 1: Validação e Setup

```
1. Validar formato ASIN
2. Construir URL: https://www.amazon.com.br/dp/{ASIN}
3. Verificar se ASIN existe no catálogo Amalfi (caso contrário, é concorrente)
```

### Step 2: WebFetch da Página Pública

```
WebFetch(url, prompt="Extrair: título, marca, preço, categoria/breadcrumb,
BSR, número de imagens, 5 bullets completos, descrição, A+ Content,
nota/reviews, variações, especificações, vendido por, FBA/FBM, badges,
cupons. Estruturar em markdown. Marcar 'NÃO PRESENTE' o que não conseguir.")

NOTA: Amazon bloqueia parte do scraping (especialmente bullets/descrição/A+).
Trabalhar com o que vier + meta tags.
```

### Step 3: Análise por Dimensão (10 dimensões, score 0-10 cada)

```
1. TÍTULO
   - Char count vs limite 200
   - Keyword principal nos primeiros 80 chars
   - Caracteres proibidos
   - Estrutura ([Categoria]+[Modelo]+[Material]+[Uso])
   - Score: 0-10

2. BULLETS
   - 5 bullets presentes
   - Cada com headline EM CAPS
   - Char counts adequados
   - Cobertura de ângulos (feature, benefício, uso, qualidade, garantia)
   - Score: 0-10

3. DESCRIÇÃO
   - Char count vs limite 2000
   - Estrutura narrativa
   - HTML usado adequadamente
   - Diferencial vs bullets
   - Score: 0-10

4. BACKEND KEYWORDS
   - Não acessível diretamente — estimar baseado em title/bullets
   - Score: NULL ou estimativa qualitativa

5. IMAGENS
   - Quantidade (alvo 7+)
   - Hero é foto real fundo branco?
   - Lifestyle presente?
   - Infográfico presente?
   - Dimensões visível?
   - Alt text vazio? (penalizar)
   - Score: 0-10

6. A+ CONTENT
   - Presente ou não
   - Se presente: módulos usados, qualidade
   - Se ausente: marca como "Genérico" justifica
   - Score: 0-10 (peso menor se sem Brand Registry)

7. CATEGORIA / BROWSE NODE
   - Categoria correta?
   - Sub-categoria adequada?
   - Score: 0-10

8. REVIEWS
   - Nota média
   - Quantidade
   - Tendência últimos 30 dias
   - Padrões em negativos
   - Score: 0-10

9. PREÇO
   - Comparado a concorrência (se possível via WebFetch de page de busca)
   - Margem viável?
   - Score: 0-10

10. VARIAÇÕES
    - Existem? Adequadas?
    - Score: 0-10
```

### Step 4: Identificar Issues por Prioridade

```
P0 (Crítico — corrigir imediatamente):
- Violação de política Amazon (palavras proibidas, image policy violada)
- Char limit excedido
- Ausência de elemento obrigatório (ex: 0 imagens, 0 bullets)
- Risco de suspensão

P1 (Alto — corrigir em até 7 dias):
- Listing tecnicamente correto mas sub-otimizado
- Keywords mal posicionadas
- Bullets sem benefícios claros
- Imagens insuficientes ou de baixa qualidade
- Categoria errada

P2 (Médio — quando tiver tempo):
- Refinamentos de copy
- A/B test opportunities
- Otimizações marginais
```

### Step 5: Estimativas de Impacto

```
Pra cada issue P0/P1, estimar impacto:
- Em ACoS (% de redução)
- Em CR (% de aumento)
- Em ranking orgânico (qualitativo)
- Em vendas absolutas (R$/mês — se houver dados)

Marcar claramente como "estimativa baseada em benchmarks" (não promessa).
```

### Step 6: Plano de Ação

```
Ordenar P0 + P1 + P2 em ordem cronológica de execução:
- "Esta semana" (P0 + P1 mais quick wins)
- "Próximas 2 semanas" (resto P1)
- "Mês seguinte" (P2)
```

### Step 7: Persistência e Output

```
1. Carregar template audit-output.md.template
2. Preencher todos placeholders
3. Salvar em outputs/{ASIN}/{date}-audit.md
4. Atualizar catalog/{ASIN}.md (adicionar nota da última auditoria)
5. Apresentar resumo no chat
```

---

## Error Handling

```yaml
errors:
  - error: WebFetch retorna 404 (ASIN inválido ou produto removido)
    fallback: avisar owner e abortar
  
  - error: WebFetch retorna conteúdo mínimo (Amazon bloqueou)
    fallback: trabalhar com meta tags + alertar limitação no relatório
  
  - error: ASIN não está no catálogo Amalfi (é concorrente)
    fallback: continuar mas marcar relatório como "auditoria de concorrente"
```

---

## Performance

```yaml
expected_duration: 1-3 minutos
expected_cost: ~R$ 0.10-0.30 por auditoria
```

---

_Task v1.0.0 — criada por @aiox-master pra @amalfi-amazon._
