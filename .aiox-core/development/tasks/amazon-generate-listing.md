# amazon-generate-listing

**Task ID:** amazon-generate-listing
**Version:** 1.0.0
**Created:** 2026-05-04
**Agent:** @amalfi-amazon (Marco)

---

## Purpose

Gerar anúncio Amazon BR 100% completo a partir de foto + nome do produto. Substitui o uso manual de ChatGPT pra criar listings, com expertise específica em regras Amazon BR, categoria Casa, e modelo de revenda sem marca própria.

**Output**: arquivo `outputs/{ASIN}/{date}-listing-v{N}.md` com título, bullets, descrição, backend keywords, briefings de imagem (Higgsfield + Canva) e A+ Content (futuro).

---

## Execution Modes

- **Auto**: gera tudo direto (default no contexto Amalfi, owner em modo Auto)
- **Interactive**: confirma cada seção antes de avançar (raramente usado)

---

## Inputs

```yaml
inputs:
  - name: product_name
    type: string
    required: true
    description: Nome livre do produto em pt-BR
    example: "Luminária Touch LED Dourada"
  
  - name: product_photo
    type: file (image)
    required: true
    description: Foto crua do produto (qualquer ângulo, qualquer luz)
    accepted_formats: [jpg, jpeg, png, webp]
  
  - name: asin
    type: string
    required: false
    description: ASIN se já existe; caso contrário tratar como SKU pré-publicação
    pattern: "^B0[A-Z0-9]{8}$"
  
  - name: skip_elicitation
    type: boolean
    required: false
    default: false
    description: Force pular elicitação inicial (perigoso — só use se cadastro existe)
```

---

## Outputs

```yaml
outputs:
  - name: listing_file
    type: file
    path: "agents/amalfi-amazon/outputs/{asin_or_slug}/{date}-listing-v{version}.md"
    persisted: true
  
  - name: catalog_entry
    type: file
    path: "agents/amalfi-amazon/catalog/{asin_or_slug}.md"
    persisted: true
    note: "Atualizado se SKU é novo ou houve update"
  
  - name: chat_summary
    type: text
    persisted: false
    description: Resumo executivo apresentado no chat
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Owner está no contexto do projeto amalfi-company
    blocker: true
  
  - [ ] Foto do produto foi anexada
    blocker: true
    error_message: "Nenhuma foto detectada. Anexe uma foto do produto e tente novamente."
  
  - [ ] Nome do produto fornecido (≥ 5 chars)
    blocker: true
    error_message: "Nome do produto muito curto ou ausente. Forneça nome descritivo."
  
  - [ ] Knowledge base do agente acessível (kb/amazon-br-rules.md, kb/category-casa-keywords.md)
    blocker: true
    error_message: "Knowledge base do agente não encontrada. Reconstruir agente."
  
  - [ ] Templates acessíveis (templates/listing-output.md.template)
    blocker: true
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Arquivo de output criado em path correto
    blocker: true
  
  - [ ] Catálogo atualizado (criado ou updated entry)
    blocker: true
  
  - [ ] Listing valida contra kb/amazon-br-rules.md (todos limites respeitados)
    blocker: true
    error_message: "Listing gerado viola regras Amazon BR. Não publicar sem revisão."
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Título gerado tem ≤ 200 caracteres
    blocker: true
  
  - [ ] Exatamente 5 bullets gerados
    blocker: true
  
  - [ ] Cada bullet ≤ 1000 chars (alvo 200-250)
    blocker: false
  
  - [ ] Descrição ≤ 2000 chars
    blocker: true
  
  - [ ] Backend keywords ≤ 250 bytes
    blocker: true
  
  - [ ] Sem palavras proibidas Amazon (consultar kb/amazon-br-rules.md)
    blocker: true
  
  - [ ] Briefings de imagem completos (7 imagens)
    blocker: false
  
  - [ ] Pelo menos 4 prompts Higgsfield gerados
    blocker: false
  
  - [ ] A+ Content gerado (mesmo marcado como "futuro")
    blocker: false
  
  - [ ] Output preenche template listing-output.md.template completamente
    blocker: true
```

---

## Process

### Step 1: Parse e Validação

```
1. Validar formato do ASIN (se fornecido): regex ^B0[A-Z0-9]{8}$
2. Validar foto: existe, é imagem válida, tamanho razoável (<10MB)
3. Validar nome: ≥ 5 chars
```

### Step 2: Lookup no Catálogo

```
1. Calcular hash da foto (perceptual hash pra detectar duplicatas)
2. Se ASIN fornecido: ler agents/amalfi-amazon/catalog/{ASIN}.md
3. Se não, buscar por hash da foto em todos os arquivos catalog/
4. Determinar: SKU EXISTENTE ou SKU NOVO
```

### Step 3: Branch — SKU Novo vs Existente

#### Se SKU NOVO:

```
Apresentar AO OWNER (em uma única mensagem):

📦 SKU novo detectado. Pra cadastrar no catálogo (uma vez só), preciso de 8 infos.
   Cola TUDO em UMA resposta:

   1. Voltagem (bivolt / 110V / 220V / só USB)
   2. Autonomia bateria (se elétrico, em horas)
   3. Material principal
   4. Dimensões (AxLxP cm)
   5. Peso (kg)
   6. Conteúdo da caixa
   7. Categoria Amazon (sugestão: {auto-suggested}; confirme ou corrija)
   8. Faixa de preço alvo (R$ X-Y)

   Exemplo: "Bivolt / 8h / Metal / 30x12x12 / 0.6 / 1 abajur+cabo+manual / Iluminação>Abajures / 80-120"

AGUARDAR resposta. Parsear. Salvar em catalog/{ASIN_or_slug}.md.
```

#### Se SKU EXISTENTE:

```
SKIP elicitação. Carregar dados de catalog/{ASIN}.md.
Contar versões existentes em outputs/{ASIN}/ → próxima versão = N+1
```

### Step 4: Análise Visual da Foto

```
Usar capacidade multimodal do Claude para extrair da foto:
- Cor predominante
- Material aparente (visualmente)
- Estado do produto (novo/montado)
- Contexto da foto (ambiente, iluminação)
- Ângulo (frontal, 3/4, lateral)
- Features visíveis (botões, ports, texturas)

Anotar GAPS (o que a foto NÃO mostra mas é crítico pro listing).
```

### Step 5: Keyword Research

```
1. Carregar kb/category-casa-keywords.md
2. Identificar subcategoria do produto (luminária, vaso, etc.)
3. Extrair keywords primárias da subcategoria
4. Adicionar variações semânticas (luminária ↔ abajur ↔ candeeiro)
5. Adicionar modificadores (recarregável, bivolt, touch, etc.)
6. Adicionar casos de uso (cabeceira, escritório, etc.)
7. Compilar tail keywords (cauda longa)
8. Identificar negativas comuns (palavras que atraem cliques sem conversão)
```

### Step 6: Geração de Copy

```
Para cada elemento, gerar respeitando limites de kb/amazon-br-rules.md:

A. TÍTULO (≤ 200 chars)
   - Formato: [Categoria] + [Modelo/Diferencial] + [Material/Cor] + [Casos de uso]
   - Keyword principal nos primeiros 80 chars (mobile-first)
   - Sem palavras proibidas
   - Sem caracteres problemáticos
   - Validar char count

B. 5 BULLETS (cada ≤ 250 chars recomendado)
   - HEADLINE EM CAPS: descrição com benefício
   - Ordem: feature mais vendedora → ... → garantia/serviço
   - Sem repetir título literal
   - Cada um cobre um ângulo: feature técnica, benefício de uso, qualidade,
     versatilidade, garantia/marca

C. DESCRIÇÃO (≤ 2000 chars)
   - HTML básico: <br> e <b> permitidos
   - Estrutura: intro com problema/oportunidade → benefícios expandidos →
     casos de uso detalhados → CTA implícito ("perfeito para...")
   - Tom: pt-BR fluente, sem traduções literais

D. BACKEND KEYWORDS (≤ 250 bytes)
   - Sem repetir título
   - Variações semânticas, erros de digitação, sinônimos
   - Tudo minúsculo, separado por espaço, sem vírgulas
   - Validar byte count (atenção a caracteres acentuados = 2 bytes)
```

### Step 7: Briefings de Imagem (7 imagens)

```
Para cada imagem, decidir tool (Higgsfield ou Canva) e gerar briefing.

Imagem #1 — HERO
   - SEMPRE briefing de tratamento da foto real (não IA generativa)
   - Instruções: remover fundo, branco puro, centralizar, exportar 2000x2000

Imagem #2 — Lifestyle 1 (Higgsfield)
   - Selecionar pattern apropriado de kb/higgsfield-prompt-patterns.md
   - Adaptar com features do produto e cenário de uso #1 do owner

Imagem #3 — Infográfico Features (Canva)
   - Selecionar layout apropriado de kb/canva-templates-amazon.md
   - Definir 4 features principais
   - Texto exato + ícones sugeridos + paleta

Imagem #4 — Comparativo (Higgsfield ou Canva, depende do produto)
   - Se produto tem variação visual marcante (3 tons de luz, 3 cores) → Higgsfield + Canva
   - Senão → outra coisa (close-up de feature, etc.)

Imagem #5 — Dimensões (Canva)
   - Briefing detalhado com medidas exatas do catálogo

Imagem #6 — Lifestyle 2 (Higgsfield)
   - Cenário de uso diferente do #2

Imagem #7 — Conteúdo da caixa (Higgsfield ou Canva)
   - Flat lay com items da caixa do catálogo
```

### Step 8: A+ Content (mesmo sem Brand Registry)

```
Gerar 7 módulos de A+ Content marcados como "FUTURO/OPCIONAL — requer Brand Registry".

Conteúdo enriquecido pra caso owner adote Brand Registry no futuro. Não usar
agora, mas economiza esforço futuro.
```

### Step 9: Sugestão de Precificação e Variações

```
1. Pricing: usar faixa do catálogo + análise rápida de concorrência (se possível)
2. Variações: identificar oportunidades (cor, tamanho, voltagem) baseado em
   features do produto e padrões da categoria
3. Browse Node: validar com kb/amazon-br-rules.md (estrutura categorias)
```

### Step 10: Persistência e Output

```
1. Carregar template listing-output.md.template
2. Substituir todos placeholders {{xxx}} com valores gerados
3. Validar contra acceptance criteria (char counts, byte counts, etc.)
4. Salvar em agents/amalfi-amazon/outputs/{ASIN_or_slug}/{date}-listing-v{N}.md
5. Atualizar catalog/{ASIN_or_slug}.md (incrementar versão, atualizar timestamp)
6. Atualizar catalog/README.md (índice)
```

### Step 11: Apresentação ao Owner

```
Mostrar no chat (formato conciso):

📦 Listing gerado e salvo!
   Path: agents/amalfi-amazon/outputs/{ASIN}/{date}-listing-v{N}.md

   📊 Resumo:
   - Título: {N}/200 chars ✅
   - 5 bullets prontos
   - Descrição: {N}/2000 chars ✅
   - Backend keywords: {N}/250 bytes ✅
   - 4 prompts Higgsfield + 3 briefings Canva

   ✅ Próximos passos:
   1. Tratar foto hero (instruções no documento)
   2. Gerar imagens lifestyle no Higgsfield
   3. Montar imagens técnicas no Canva
   4. Colar copy no Seller Central
   5. Após go-live, agendar *audit-listing em 7 dias

Permitir owner abrir o documento completo se quiser.
```

---

## Error Handling

```yaml
errors:
  - error: foto inválida ou ausente
    fallback: pedir foto explicitamente, abortar se não fornecer
  
  - error: nome muito curto ou ambíguo
    fallback: pedir nome mais descritivo, abortar se não fornecer
  
  - error: ASIN inválido (não bate B0XXXXXXXX)
    fallback: tratar como SKU sem ASIN, usar slug do nome
  
  - error: knowledge base não encontrada
    fallback: tentar caminho alternativo; se não, abortar com instrução de reconstruir agente
  
  - error: limite de char excedido após geração
    fallback: regenerar com prompt mais restritivo; max 3 tentativas
  
  - error: palavra proibida detectada no output
    fallback: regenerar substituindo termo; max 2 tentativas
```

---

## Performance

```yaml
expected_duration: 2-4 minutos (geração total)
expected_token_usage: ~10-15K tokens (com prompt caching pode reduzir)
expected_cost: ~R$ 0.30-0.80 por geração (com caching)
```

---

## Notes for Implementation

- **Prompt caching agressivo**: kb/* arquivos são candidatos óbvios pra cache (1h TTL)
- **Validação após geração**: SEMPRE rodar checklist de pre-publicação antes de salvar
- **Rollback se erro**: se falhar no meio, NÃO deixar arquivo parcial — limpar
- **Versioning automático**: detectar v1, v2, v3... no diretório outputs/{ASIN}/

---

_Task definition v1.0.0 — criada por @aiox-master pra @amalfi-amazon._
