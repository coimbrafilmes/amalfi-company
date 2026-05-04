# Higgsfield Prompt Patterns

> Patterns testados de prompts para Higgsfield (Soul, Edit, DoP) que funcionam bem pra geração de imagens de produto Amazon. Owner usa Higgsfield ativamente.

---

## 🎨 Sobre Higgsfield

**Higgsfield** é uma plataforma de IA generativa especializada em conteúdo visual cinematográfico. Modelos relevantes:

- **Higgsfield Soul** — geração de imagem (text-to-image, image-to-image)
- **Higgsfield Edit** — edição de imagem existente
- **Higgsfield DoP** — controle cinematográfico de câmera (mais útil pra vídeo)

Para Amazon listing, **Higgsfield Soul** é o modelo principal — gera fotos de produto realistas com estética cinematográfica.

### Pontos fortes
- Fotorealismo cinematográfico
- Excelente em **lifestyle / ambiente**
- Lighting natural e dramático
- Aceita image-to-image (usa foto crua como base)

### Pontos fracos
- Não é forte em **texto sobreposto** (use Canva pra infográficos)
- Geração de mãos/dedos pode falhar (evitar pessoas tocando produto)
- Dimensões precisas em régua/medidas (use Canva)

---

## 📐 Configurações Padrão Amazon

### Aspect Ratios
- **Hero (#1)**: 1:1 (quadrado) — obrigatório Amazon
- **Lifestyle**: 1:1 ou 4:5 vertical
- **Detalhes**: 1:1

### Resolução
- Higgsfield gera nativo em alta — exportar em 2048×2048 mínimo

### Seed
- Salvar seed das imagens que ficaram boas (pra gerar variações coerentes)

---

## 🖼️ Pattern Library (por tipo de imagem)

### Pattern #1 — Hero Shot (foto principal, fundo branco)

**Quando usar**: imagem #1 da listagem (mas hero ideal é foto real do produto + edição leve)

**⚠️ Aviso**: Amazon prefere foto real pro hero. Use Higgsfield aqui SOMENTE se for image-to-image refinando uma foto crua que você já tem.

#### Prompt template
```
Professional product photography of {PRODUCT_DESCRIPTION},
isolated on pure white background #FFFFFF,
soft studio lighting from top-front,
no shadows, no reflections,
85mm lens, f/8, sharp focus on entire product,
commercial product photo, ecommerce ready,
center composition, product fills 85% of frame,
ultra high detail, photorealistic, 8k quality
```

#### Negative prompt
```
text, watermark, logo, signature, low quality, blurry, distorted, deformed,
multiple objects, background elements, hands, fingers, person,
shadow on background, color cast, oversaturated, cartoon, illustration
```

#### Settings
- Aspect ratio: 1:1
- Reference image strength: 0.7-0.8 (preserva fidelidade do produto)
- Variations: 3 (gerar 3 e escolher melhor)

---

### Pattern #2 — Lifestyle "Cabeceira" (quarto/cama)

**Quando usar**: imagem #2 ou #6, mostrando produto em uso real no ambiente quarto

#### Prompt template
```
{PRODUCT} on a wooden bedside table next to a comfortable bed,
warm soft evening lighting, golden hour through window,
cozy bedroom interior, neutral tones, scandinavian aesthetic,
shallow depth of field, bokeh background,
lifestyle product photography, premium aesthetic,
85mm lens, cinematic composition, magazine quality
```

#### Negative prompt
```
text, watermark, logo, distorted, low quality, cluttered, messy,
person face visible, harsh lighting, oversaturated, cartoon
```

#### Variações por estilo
- **Romântico**: adicionar "candles, rose petals, romantic atmosphere"
- **Minimalista**: adicionar "minimalist style, white sheets, single object"
- **Aconchegante**: adicionar "blanket, books, cup of tea"

---

### Pattern #3 — Lifestyle "Escritório / Home Office"

**Quando usar**: produto com uso profissional (luminária mesa de trabalho, organizador, etc.)

#### Prompt template
```
{PRODUCT} on a modern home office desk,
laptop slightly out of focus in background,
natural daylight from window, productivity vibes,
plants, notebook, minimalist desk setup,
shallow depth of field, professional photography,
85mm lens, neutral colors, clean composition,
lifestyle product shot, premium aesthetic
```

#### Negative prompt
```
text, watermark, logo, distorted, person face, cluttered desk,
gaming setup, RGB lighting, dark theme
```

---

### Pattern #4 — Comparativo (3 estados / 3 tons de luz)

**Quando usar**: mostrar variação do produto (3 cores, 3 intensidades, 3 modos)

#### Prompt template (split-screen)
```
Triptych composition split into 3 vertical panels,
same {PRODUCT} in each panel,
panel 1 (left): {STATE_1},
panel 2 (center): {STATE_2},
panel 3 (right): {STATE_3},
clean white background between panels,
professional product photography,
consistent angle and framing across all 3 panels,
labels at bottom (will be added in Canva later)
```

**⚠️ Higgsfield às vezes falha em split-screen perfeito** — alternativa:
1. Gerar 3 imagens separadas com Higgsfield (mesmo seed, variando só o estado)
2. Compor as 3 no Canva manualmente

---

### Pattern #5 — Detail Shot (close-up de feature)

**Quando usar**: destacar característica específica (botão touch, port USB, textura material)

#### Prompt template
```
Extreme close-up of {SPECIFIC_FEATURE} on {PRODUCT},
macro photography, ultra sharp detail,
soft directional lighting highlighting texture,
f/2.8 shallow depth of field,
neutral background, premium aesthetic,
commercial product photography
```

---

### Pattern #6 — Lifestyle "Mesa de Jantar / Sala"

**Quando usar**: produto decorativo, ambientes sociais

#### Prompt template
```
{PRODUCT} as a centerpiece on a dinner table,
warm ambient evening lighting, soft candles,
elegant table setting, family dinner atmosphere,
blurred wine glasses and plates in background,
shallow depth of field, premium aesthetic,
85mm lens, magazine-quality lifestyle shot
```

---

### Pattern #7 — Conteúdo da Caixa (flat lay)

**Quando usar**: imagem #7, mostrando o que vem na embalagem

#### Prompt template
```
Top-down flat lay composition of {PRODUCT} unboxed,
all components arranged neatly on white surface,
{LIST_OF_ITEMS} (e.g., main product, USB cable, manual, charger),
even soft lighting, no shadows,
organized symmetrical layout,
ecommerce product photography, clean composition,
1:1 aspect ratio
```

> **Alternativa**: foto real do unboxing + edição no Canva é geralmente melhor que IA puro pra essa imagem.

---

## 🔧 Image-to-Image (com foto crua do owner)

Quando o owner fornece foto crua do produto (celular, mal iluminada), usar **Higgsfield image-to-image** pra refinar:

### Configurações recomendadas
- **Reference strength**: 0.6-0.75 (preserva o produto, melhora ambiente/luz)
- **Prompt**: descrever apenas o ambiente desejado, NÃO redescrever o produto
- **Negative**: incluir "different product, distorted product"

### Exemplo
```
Foto crua: abajur dourado mal iluminado em cima de mesa bagunçada

Prompt para Higgsfield img2img:
"On a clean wooden bedside table, warm evening lighting,
cozy bedroom atmosphere, scandinavian aesthetic, premium
lifestyle photography, magazine quality"

Reference strength: 0.7
```

Resultado: o abajur do owner aparece mantido, mas em ambiente cinematográfico.

---

## 🎨 Estilos Estéticos (modificadores que funcionam)

### Premium / Aspirational
- "premium aesthetic, magazine quality"
- "lifestyle editorial photography"
- "high-end commercial shoot"
- "luxury product photography"

### Minimalist
- "minimalist composition, negative space"
- "clean aesthetic, scandinavian style"
- "muted palette, neutral tones"

### Warm / Cozy
- "warm golden hour lighting"
- "cozy atmosphere, soft fabrics"
- "candlelit ambient lighting"

### Modern / Contemporary
- "contemporary interior design"
- "mid-century modern aesthetic"
- "industrial chic style"

---

## ⚠️ Pitfalls Comuns

### Pitfall #1 — Pedir texto na imagem
❌ NUNCA pedir Higgsfield pra escrever texto ("with label saying 'PROMOTION'") — falha 90% das vezes
✅ Use Canva depois pra adicionar texto

### Pitfall #2 — Pessoas tocando o produto
❌ "person holding the lamp" — mãos saem deformadas
✅ "lamp on a surface, no person visible"

### Pitfall #3 — Cores muito específicas
❌ "exact pantone 7549C gold" — IA não obedece
✅ "warm gold tone, similar to brass" + image reference

### Pitfall #4 — Múltiplos produtos
❌ "3 versions of the lamp side by side" — geralmente sai 1 produto e 2 deformados
✅ Gerar 3 imagens separadas + compor manualmente

### Pitfall #5 — Hero com fundo branco perfeito
⚠️ Higgsfield às vezes deixa cinza claro ou texturas sutis — Amazon exige #FFFFFF puro
✅ Refazer no Photopea/Canva o ajuste final do fundo

---

## 📋 Checklist Antes de Subir Imagem na Amazon

Após gerar no Higgsfield:

- [ ] Resolução ≥ 2.000×2.000 (Higgsfield gera, mas confirmar export)
- [ ] Aspect ratio correto (1:1 pro hero, lifestyle pode ser 4:5)
- [ ] Sem texto/watermark da Higgsfield (verificar canto)
- [ ] Cores consistentes com produto real
- [ ] Sem deformação visível
- [ ] Hero: fundo realmente #FFFFFF puro (não cinza claro)
- [ ] Formato JPG ou PNG (PNG preferido se preservou transparência)

---

## 🔄 Manutenção

**Atualizar este arquivo quando:**
- Higgsfield lançar novo modelo (Soul v2, etc.)
- Owner descobrir prompt que funciona excepcionalmente bem
- Identificar pitfall novo

**Como medir qualidade dos prompts:**
- Variation success rate (quantas das 3 variações são utilizáveis)
- Tempo até output aceitável
- Necessidade de retoque externo

---

_Mantido por @amalfi-amazon (Marco). Owner: Amalfi Company (coimbrafilmes)._
