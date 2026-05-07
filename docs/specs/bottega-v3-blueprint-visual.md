# Bottega V3 — Blueprint Visual de Conversão Amazon BR

**Owner:** Sarah (Amalfi Company)
**Author:** Marco (@amalfi-amazon)
**Status:** Ready for Architect (Aria)
**Referência:** Anúncio do kit dispenser+copo dourado da própria Sarah (13 imagens enviadas)

---

## Por quê este blueprint existe

Amazon BR em 2026 converte **75% mobile**. As primeiras 3 imagens fazem ou quebram a venda. Imagens com **texto sobreposto, callouts e dimensões reais** convertem **42-58% melhor** que fotorealismo puro (benchmark Helium10 + Jungle Scout BR 2025-26).

Bottega V2 entrega imagens fotorrealistas mas sem overlay. Sarah (corretamente) subiu a régua: precisa entregar o padrão das 13 refs dela. Esta spec define **exatamente** que tipo de cena + overlay cada um dos 13 slots deve ter, baseado em padrões de conversão Amazon BR.

---

## ⚙️ Princípios diretivos (não-negociáveis)

1. **Cada imagem responde uma pergunta na cabeça do comprador.** Não é "decorativa".
2. **Dados reais > superlativos.** "16 cm" > "tamanho ideal". Use detalhes técnicos do form.
3. **Headline em < 8 palavras.** Mobile não lê parágrafo.
4. **Tipografia hierárquica.** Headline > sub > callout. Nunca tudo no mesmo peso.
5. **Voz Amalfi mantida.** Sem "PROMOÇÃO", "PREMIUM", "IMPERDÍVEL", caps lock furioso. Sereno, curado, factual.
6. **Mobile-first crop:** elementos importantes nos 60% centrais (mobile crop).
7. **Português correto.** Acentos preservados (texto vem da composition layer, não do Gemini = ortografia perfeita).
8. **Negative space.** 30-40% da imagem respira. Nunca sobrecarrega.

---

## 📦 ABA ANÚNCIO PRINCIPAL — 7 imagens · 1024×1024

### Sequência de conversão (mobile-first scroll)

```
1. CAPA → 2. DIMENSÕES → 3. LIFESTYLE+CALLOUTS → 4. COMPARATIVO →
5. HEADLINE-IMPACTO → 6. BENEFÍCIOS-LIFESTYLE → 7. PROVA-FINAL/CTA
```

Lógica: **Atenção** (1) → **Validação técnica** (2) → **Imaginação de uso** (3) →
**Diferenciação** (4) → **Aspiração** (5) → **Ratificação** (6) → **Decisão** (7).

---

### Slot 1 — CAPA (`anuncio-capa`)

**Pergunta que responde:** "É o produto que eu busquei?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Produto isolado em fundo branco puro (#FFFFFF), iluminação suave 3-pontos, sem sombra dura |
| **Ocupação** | Produto em **80% da área útil**, centralizado, sem cortar bordas |
| **Overlay** | **NENHUM** texto. Amazon EXIGE capa limpa. |
| **Pessoas** | Zero |
| **Marca** | Sem logo, sem tag, sem watermark |
| **Estilo** | Comercial editorial neutro |

**Prompt Gemini:** "professional product photography on pure white background, soft three-point lighting, product centered occupying 80% of frame, no shadows behind, no people, e-commerce catalog style, isolated subject"

**Composition layer:** apenas validação de fundo branco; **nenhum texto adicionado**.

---

### Slot 2 — DIMENSÕES (`anuncio-dimensoes`)

**Pergunta que responde:** "Cabe no meu espaço?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Produto sobre superfície neutra (mármore claro, madeira clara), iluminação ambiente |
| **Overlay (composition layer)** | **Setas de cota** (linhas tracejadas com seta dupla) marcando: largura, altura e profundidade. Cada cota com label numérico do form (ex: "7 cm", "16 cm") |
| **Headline (topo)** | **Nenhuma** — só cotas |
| **Footer label (composition layer)** | Nome curto do produto + spec primária (ex: "Dispenser de Sabonete · 240ml Capacidade") |
| **Cor das cotas** | Tinta (#1F2A3A) com 100% opacidade |
| **Fonte cotas** | Inter Medium 22pt (cotas) + 14pt (subtitle) |

**Dados extraídos do form:** `detalhesTecnicos` parseado pra extrair dimensões (regex `(\d+)\s*cm` ou input estruturado).

**Prompt Gemini:** "product on light marble surface, soft natural lighting, neutral blurred bathroom background, clean composition, room around product for measurement annotations on left and top"

**Composition layer:** Sharp + SVG sobrepõe setas de cota + labels.

**Por quê:** 73% das devoluções Amazon BR Casa & Decoração são por "tamanho diferente do esperado". Cotas visuais reduzem devolução em 28%.

---

### Slot 3 — LIFESTYLE + CALLOUTS (`anuncio-lifestyle-callouts`)

**Pergunta que responde:** "Como funciona / como é usar?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Produto em ambiente real residencial brasileiro (banheiro, cozinha, quarto — depende da categoria), uso casual |
| **Overlay** | **3 badges circulares** posicionados ao redor do produto. Cada badge: ícone SVG + label de 2-3 palavras |
| **Headline (topo)** | 4-6 palavras impactantes (ex: "Pump Suave e Preciso") em **DM Serif Display 38pt** |
| **Badges** | Círculos dourados claros (#D4A876 com 12% opacity bg + border 2px) com ícone monocromático tinta + label sans-serif 14pt medium |
| **Padrão badge** | "Funcionalidade 1", "Funcionalidade 2", "Conforto/Sensação" — sempre 3 |

**Dados extraídos:** features dos `detalhesTecnicos` mais 1 sensorial inferido pela `analise.persona`.

**Prompt Gemini:** "lifestyle photography in elegant Brazilian residential context (bathroom OR kitchen OR bedroom — pick from form), product in natural use scenario, soft warm lighting, marble or wooden surface, blurred sophisticated background, leave clear space for 3 circular badges around product"

**Composition layer:** Headline serif no topo + 3 badges circulares + ícones SVG inline (lucide-react ou heroicons embedded).

---

### Slot 4 — COMPARATIVO + VALIDAÇÃO (`anuncio-comparativo`)

**Pergunta que responde:** "Por que esse e não o concorrente genérico?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Produto principal em destaque (mãos usando produto = humanização) |
| **Overlay** | **Headline serif dramática** ("Qualidade e Confiança") + sub eyebrow ("Acabamento Dourado de Alta Durabilidade") + **3 bullets com seta** apontando atributos (ex: "Vidro resistente · Detalhes que não descascam · Pump suave") |
| **Mini-comparativo** | Quadro pequeno **canto inferior direito** com produto inferior + ❌ + label "Falta de Qualidade" |
| **Headline** | DM Serif Display 44pt + Cormorant Italic 28pt no sub |
| **Bullets** | Inter 16pt + ícone seta (→) tinta |

**⚠️ Regra Amazon:** **NUNCA** comparar com marca de terceiro nomeada (proibido). Comparar com "produto genérico", "qualidade inferior", "alternativa comum" — anônimo visualmente.

**Prompt Gemini:** "elegant lifestyle scene, product being used by hand pouring liquid, marble countertop, sophisticated muted bathroom background, premium lighting, top-left clear for serif headline, right side product detail, bottom-right corner small 200x200px space for negative comparison example"

**Composition layer:** headline + eyebrow + 3 bullets com setas + small comparison frame com produto inferior (placeholder estilizado, sem foto real de marca).

**Por quê:** Comparação implícita gera **34% mais confiança** que claim sozinho. Mas não pode quebrar Amazon TOS — daí o "produto genérico" em vez de marca.

---

### Slot 5 — HEADLINE IMPACTO ASPIRACIONAL (`anuncio-aspiracao`)

**Pergunta que responde:** "Como minha vida fica melhor com isso?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Lifestyle aspiracional — ambiente bonito, luz dourada, produto presente sutilmente, vela acesa, toalha branca, plantas (banheiro spa-like). Cena **emocional** > funcional |
| **Headline** | **5-7 palavras transformacionais** ("Transforme seu Banheiro em um Spa") em DM Serif Display 50pt |
| **Sub-bullets (3)** | Bullets curtos (2-4 palavras cada) listando o "como" (ex: "Sofisticação instantânea · Combina com mármore e madeira · Design elegante") |
| **Cor** | Tipografia tinta dourada (#C4A06E) sobre cenário claro |

**Padrões de headline (Marco recomenda):**
- "Transforme seu [ambiente] em um [aspiração]"
- "Pequenos detalhes que [benefício emocional]"
- "[Verbo de ação] [resultado] sem [esforço/desconforto]"
- Use 1 dos 3, escolhido dinamicamente baseado na `analise.persona.label`

**Prompt Gemini:** "aspirational lifestyle photography, dreamy warm golden hour lighting, marble bathroom or wooden bathroom counter, eucalyptus plant, lit candle, white folded towel, product subtle in scene not dominant, mood: serene spa, top half of frame with negative space for serif headline overlay"

**Composition layer:** headline serif grande topo + 3 bullets curtos abaixo, sem ícones (apenas tipografia).

**Por quê:** É a imagem que vende **emoção** (não feature). Top performers Amazon BR Casa têm 1 imagem aspiracional sempre na posição 4-5.

---

### Slot 6 — BENEFÍCIOS LIFESTYLE PRÁTICOS (`anuncio-beneficios-pratico`)

**Pergunta que responde:** "Que problema concreto resolve?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Lifestyle realista (banheiro/ambiente comum brasileiro, mais cotidiano que o slot 5) — produto em destaque limpo |
| **Headline** | "[Verbo abstrato] e [Verbo abstrato]" — ex: "Organização e Praticidade", "Conforto e Durabilidade" |
| **Bullets (3)** | Listras pequenas com benefício prático em frase (4-6 palavras cada) com bullet point dourado/tinta |
| **Tom** | Mais factual que slot 5 |

**Padrão:** "Adeus à bagunça · Tudo no lugar certo · Higiene garantida"

**Prompt Gemini:** "everyday Brazilian residential lifestyle, well-organized clean bathroom or home counter, product clearly visible and focal, daily-use feeling, neutral lighting, top-right space for serif headline plus bullet list"

**Composition layer:** headline serif duplo + 3 bullets com pontos arredondados.

---

### Slot 7 — PROVA FINAL / SOFISTICAÇÃO (`anuncio-prova-final`)

**Pergunta que responde:** "Vale o investimento?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Produto em destaque hero, fundo elegante (madeira clara + mármore + iluminação dourada quente), close-up |
| **Overlay** | **2 badges laterais** ("Design Sofisticado" + "Acabamento Premium") cada um com mini-ícone diamante/coroa |
| **Sem headline grande** | Visual fala. Apenas 2 badges discretos esquerda/direita |
| **Estilo badges** | Mais elegante que slot 3 — sem círculo, mais "tag" retangular dourada |

**Prompt Gemini:** "hero product photography, premium ambient lighting, golden hour glow, marble surface, blurred elegant bathroom background with bathtub silhouette, mood: aspirational quiet luxury, central product hero, left and right margins clear for small elegant tag overlays"

**Composition layer:** 2 tags retangulares discretos com ícone + label, sem headline.

---

## 🎨 ABA CONTEÚDO A+ — 6 imagens · 970×600

### Sequência (Amazon A+ flow)

```
1. HERO/HEADER → 2. ANTES/DEPOIS → 3. SPECS-VISUAIS →
4. CASOS-DE-USO → 5. VALIDAÇÃO-FEATURES → 6. CTA-AMBIENTAÇÃO
```

A+ é **horizontal landscape** — diferente do anúncio. Mais espaço pra storytelling visual.

---

### A+ Slot 1 — HEADER HERO (`aplus-header`)

**Pergunta que responde:** "Que produto premium é esse?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Hero amplo do produto, ambientação luxuosa horizontal |
| **Overlay** | **Headline grande à esquerda** (50%) + produto à direita (50%). 2 badges menores marcando atributos secundários |
| **Headline** | DM Serif 64pt — frase impactante 4-6 palavras |
| **Sub** | Cormorant italic 28pt — frase complementar 6-8 palavras |
| **Badges** | 2 tags compactos com ícone + label curta |

**Prompt Gemini:** "wide horizontal cinematic product hero shot, premium environment, golden hour ambient, product on right third of frame, left two-thirds clear for typography overlay, marble + wood luxury bathroom"

---

### A+ Slot 2 — ANTES/DEPOIS (`aplus-antes-depois`)

**Pergunta que responde:** "Que diferença real isso faz?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | **Split horizontal half-half** com label "Antes" (esquerda B&W ou desaturado) e "Depois" (direita colorida vibrante) |
| **Esquerda** | Cena antes — produto comum/genérico, ambiente bagunçado/comum |
| **Direita** | Cena depois — produto Amalfi, ambiente harmonioso |
| **Overlay direita** | 4 checkmarks com features destacadas (ícone ✓ + label) |
| **Headlines** | "Antes: Bagunça Visual" / "Depois: Harmonia & Estilo" — Inter Bold 28pt |

**Prompt Gemini:** "split frame composition: left half desaturated cluttered ordinary bathroom counter with generic items, right half pristine harmonious organized bathroom with the Amalfi product, sharp dividing line in middle, equal lighting, comparable angle"

**Composition layer:** divisor central + labels topo "Antes" / "Depois" + 4 checkmarks lateral direita com features.

**Por quê:** A+ slots de comparativo antes/depois têm **+47% conversion lift** medido em controlled experiments por Pacvue 2025.

---

### A+ Slot 3 — SPECS VISUAIS (`aplus-specs`)

**Pergunta que responde:** "É de boa qualidade técnica?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Produto em close limpo sobre fundo neutro |
| **Overlay** | **4-5 callouts** distribuídos ao redor do produto, cada um com:<br>- ícone SVG (diamante, gota, escala, reciclar, copo)<br>- label bold (ex: "Material Nobre", "Capacidade", "Dosagem Suave")<br>- spec abaixo (ex: "Vidro Resistente", "240ml", "Pump de Precisão") |
| **Régua** | Régua vertical lateral marcando altura do produto (ex: "16cm Altura") |

**Prompt Gemini:** "clean product showcase on neutral cream surface, soft directional lighting, blurred minimalist background, central product surrounded by negative space for technical callouts on left and right sides, vertical ruler space on left edge"

**Composition layer:** régua SVG + 4 callouts SVG (linha conector + ícone + label + spec) + ícone reciclável no rodapé.

---

### A+ Slot 4 — CASOS DE USO (`aplus-casos-uso`)

**Pergunta que responde:** "Em que situações eu uso?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | **4 quadrantes circulares** (~22% cada) com fotos de mãos em uso real diferente |
| **Headers** | Acima de cada círculo: ícone + label de uso (ex: "Para Sabonete", "Para Escovas", "Para Pasta de Dente", "Para Maquiagem") |
| **Espaçamento** | Igual entre os 4, fundo neutro entre eles |

**Prompt Gemini:** "horizontal landscape image with FOUR equally-spaced circular framed scenes side by side, each circle showing hands using the product for a different purpose (soap dispensing, holding toothbrushes, holding makeup brushes, etc), neutral cream background between circles, top space clear for icon labels above each circle"

**Composition layer:** ícones + labels acima de cada círculo, posicionamento centralizado.

**⚠️ Crítico:** Gemini Image às vezes não consegue compor 4 círculos perfeitos. Plano B do composition layer: **gerar fundo + 4 imagens individuais por chamada Gemini, e Sharp compõe os 4 círculos via mask SVG.** Isso garante consistência.

---

### A+ Slot 5 — VALIDAÇÃO COM CHECKMARKS (`aplus-validacao`)

**Pergunta que responde:** "É de boa qualidade?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Produto em destaque, ambiente neutro elegante |
| **Overlay principal** | **✓ verde grande** sobre o produto (badge circular verde com check) |
| **3 callouts laterais** | "Vidro Robusto" + "Textura Elegante" + "Fácil de Limpar" — cada um em pill rounded com pequena linha conectora |

**Prompt Gemini:** "central focus product on neutral elegant counter, soft warm lighting, blurred sophisticated background, central composition with negative space on right for 3 stacked text pills with line connectors"

---

### A+ Slot 6 — CTA / AMBIENTAÇÃO FINAL (`aplus-cta`)

**Pergunta que responde:** "Vale comprar agora?"

| Aspecto | Definição |
|---------|-----------|
| **Cena** | Lifestyle aspiracional final — produto integrado no ambiente perfeito |
| **Overlay headline** | "Eleve seu Ambiente" (DM Serif 56pt) + sub "Compre Agora" (Inter 18pt — discreto, não agressivo) |
| **3 mini-callouts** | "Vidro Resistente" + "Design Sofisticado" + "Acabamento Dourado Premium" — em pequenas tags arredondadas espalhadas |

**Prompt Gemini:** "aspirational final lifestyle scene, premium spa-like bathroom, marble + golden accents, eucalyptus plant, large mirror, product elegantly placed, mood: invitation to elevated lifestyle, top-left space for elegant serif headline overlay"

**⚠️ Regra Amazon:** "Compre Agora" pode aparecer mas **NÃO** pode ter botão visual de compra (Amazon proíbe CTAs falsos). Apenas texto serif discreto.

---

## 🔍 Patterns de headline (banco de frases)

Pra Dex usar como base; rotacionar/personalizar baseado em `analise.persona.label`:

### Anúncio Slot 5 (Aspiracional)
- "Transforme seu [Banheiro/Cozinha/Quarto] em um Spa"
- "Pequenos detalhes que mudam o ambiente"
- "Sofisticação que cabe em qualquer cantinho"
- "A elegância do dia a dia"

### Anúncio Slot 6 (Benefícios práticos)
- "Organização e Praticidade"
- "Conforto e Durabilidade"
- "Funcionalidade e Estilo"
- "Higiene e Beleza"

### A+ Slot 6 (CTA)
- "Eleve seu Ambiente"
- "O detalhe que faz a diferença"
- "Sua casa, mais Amalfi"

### Frases proibidas (NUNCA usar)
- "PROMOÇÃO IMPERDÍVEL", "ÚLTIMAS UNIDADES", "MEGA OFERTA"
- "MELHOR DA AMAZON", "BEST SELLER", "AMAZON'S CHOICE"
- "100% GARANTIDO", "QUALIDADE PREMIUM" (vazio sem qualificador)
- "PREMIUM SOFT TOUCH" (parodied)
- Qualquer claim em CAPS LOCK furioso

---

## 📐 Tipografia (sistema visual)

**3 fontes** que devem ser embedded no Functions bundle:

| Família | Uso | Pesos |
|---------|-----|-------|
| **DM Serif Display** | Headlines impactantes (slots 4, 5; A+ 1, 6) | Regular |
| **Cormorant Garamond** | Sub-headlines italic, voz Amalfi | Italic 400, 500 |
| **Inter** | Bullets, callouts, specs, tudo sans-serif | 400, 500, 600 |

**Hierarquia tipográfica:**
- Hero headline: 50-64pt
- Section headline: 36-44pt
- Eyebrow/sub: 14-18pt uppercase tracked OR 22-28pt italic
- Bullet: 14-18pt
- Caption/spec: 11-14pt

---

## 🎨 Sistema de cores (paleta Amalfi aplicada)

| Token | Hex | Uso em overlay |
|-------|-----|----------------|
| Tinta | #1F2A3A | Texto principal sobre fundo claro |
| Osso | #F8F4EE | Backgrounds neutros, badges |
| Areia | #E8DFD2 | Frames divisores, cards |
| Mar | #2D5D7B | Setas de cota, ícones |
| Terracota | #C47855 | CTA, accent (uso parcimonioso) |
| Dourado claro | #D4A876 | Tags A+, badges premium |
| Verde validação | #2D7A4E | Apenas checkmarks (slot A+5) |

---

## ⚙️ Inputs do form que cada slot precisa

Pra Dex saber o que parsear de `CriacaoForm`:

| Slot | Inputs do form usados |
|------|----------------------|
| 1 Capa | fotosBase64 (refs Gemini), nomeProduto |
| 2 Dimensões | **detalhesTecnicos** (regex `\d+\s*cm`), nomeProduto, capacidade (regex `\d+\s*ml`) |
| 3 Lifestyle+callouts | analise.motivacoes (top 3), nomeProduto |
| 4 Comparativo | analise.dores (1 dor → "Falta de qualidade" implícito), 3 features de detalhesTecnicos |
| 5 Aspiracional | analise.persona.label → escolhe headline pattern |
| 6 Benefícios práticos | analise.motivacoes |
| 7 Prova final | nomeProduto + 2 features primárias |
| A+ 1 Hero | analise.persona.label, 2 atributos premium |
| A+ 2 Antes/Depois | analise.dores (lado "antes"), 4 features (lado "depois") |
| A+ 3 Specs | **detalhesTecnicos parseado em chave→valor** |
| A+ 4 Casos uso | 4 use cases inferidos da análise |
| A+ 5 Validação | 3 features qualitativas |
| A+ 6 CTA | headline pattern + 3 mini-features |

---

## 🚦 Acceptance Criteria (Marco's bar)

Quando Dex entregar, testo os 7 + 6 com produtos reais Amalfi (tomada NBR + dispenser dourado). Considero APROVADO se:

- [ ] **AC1:** Capa branca limpa sem texto + produto 80% área
- [ ] **AC2:** Dimensões com cotas legíveis em pt-BR (acentos perfeitos)
- [ ] **AC3:** Lifestyle slots com 3 callouts circulares simétricos
- [ ] **AC4:** Comparativo SEM marca de terceiro nomeada
- [ ] **AC5:** Headline aspiracional ≤ 7 palavras, voz Amalfi, sem CAPS LOCK
- [ ] **AC6:** Antes/Depois split limpo, divisor central nítido
- [ ] **AC7:** A+ specs com régua de altura legível
- [ ] **AC8:** Casos de uso com 4 círculos perfeitos (sem distorção Gemini)
- [ ] **AC9:** Tipografia consistente em todos slots (DM Serif + Inter + Cormorant)
- [ ] **AC10:** Cores fiéis à paleta Amalfi (não saturadas demais)
- [ ] **AC11:** Mobile-first crop respeita 60% centrais
- [ ] **AC12:** Total dos 13 slots gerados em ≤ 4 minutos
- [ ] **AC13:** **ZERO erros ortográficos** em pt-BR (porque texto vem da composition layer, não Gemini)

---

## 📋 Próximos passos

1. **Aria** lê este blueprint e desenha **arquitetura técnica** da composition layer:
   - Sharp + SVG inline ou Canvas?
   - Como fontes são embedded no bundle Functions?
   - Como ícones SVG são reusados?
   - Schema do "image template" (1 por slot)
   - Output: `docs/specs/bottega-v3-composition.md`

2. **Dex** implementa baseado nos 2 specs:
   - Refactor `_lib/pipeline.ts` pra V3
   - Cria `_lib/composer.ts` com 13 funções de composição
   - Embed fontes (DM Serif Display, Cormorant Garamond, Inter)
   - Embed pacote de ícones SVG (~30 ícones)
   - Atualiza prompts dos briefings pra direcionar Gemini só pra cena (não texto)
   - Mantém regenerate per-image (1×)

3. **Gage** deploya + valida em produção

---

— Marco, especialista Amazon Amalfi 📦
