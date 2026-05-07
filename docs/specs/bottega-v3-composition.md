# Bottega V3 — Composition Layer (Technical Spec)

**Owner spec:** Aria (@architect)
**Implementador:** Dex (@dev)
**Branch sugerido:** `feat/bottega-v3-composition` (a partir de `main`)
**Pré-requisito lido:** `docs/specs/bottega-v3-blueprint-visual.md` (Marco)
**Status:** Ready for Dev

---

## 1. Contexto + decisões arquiteturais

### 1.1. Por quê uma composition layer

Marco demonstrou que imagens Amazon BR top-tier têm **overlays tipográficos, callouts, setas de cota, comparativos e badges** sobre uma base fotorealista. Tentar fazer Gemini Image gerar tudo end-to-end resulta em:

- Ortografia errada em pt-BR (acentos, ç)
- Tipografia inconsistente entre slots
- Callouts desalinhados
- Setas de cota sem precisão numérica
- Layout split desigual

**Solução arquitetural:** divisão clara de responsabilidades.

```
┌──────────────────────────────┐  ┌────────────────────────────────┐
│ CAMADA 1: Cena Fotorealista  │  │ CAMADA 2: Composition Layer    │
│ (Gemini 2.5 Flash Image)     │+ │ (Sharp + SVG inline + fontes)  │
│                              │  │                                │
│ - Produto fiel (3 fotos refs)│  │ - Headlines tipográficas       │
│ - Ambiente / lifestyle       │  │ - Callouts com ícones          │
│ - Lighting / mood            │  │ - Setas de cota numéricas      │
│ - Negative space planejado   │  │ - Splits comparativos          │
│ - Sem texto, sem callouts    │  │ - Validação visual (✓)         │
└──────────────────────────────┘  └────────────────────────────────┘
                          ↓
                   ┌─────────────┐
                   │ PNG final   │
                   │ Sharp comp  │
                   └─────────────┘
```

### 1.2. Decisões e trade-offs

| Decisão | Alternativas consideradas | Por quê |
|---------|--------------------------|---------|
| **Sharp + SVG inline** | Canvas (node-canvas), Skia, headless Puppeteer | Sharp já no projeto. SVG é declarativo, deterministic, sem deps nativas extra além do que já temos. Funciona limpo em Netlify Functions. |
| **`text-to-svg` (text → vector path)** | SVG `@font-face` com base64, Sharp `text` nativo (libpangocairo) | Vetorizar texto antes de compor evita 100% dos problemas de fonte em runtime. Acentos pt-BR ficam pixel-perfect. Cada texto vira `<path>` SVG. |
| **`@fontsource/...` packages** | Bundle TTFs manualmente, fontes CDN | npm package mantém versão fixa, fácil instalar, fácil bundle como `external_node_modules`. |
| **`lucide-static` ícones** | Heroicons, custom SVGs | Lucide tem ~1000 ícones, SVG paths simples, license MIT. ~30 ícones × ~500 bytes = 15KB. |
| **Composition após geração Gemini** | Composition pre-render + Gemini overlay | Gemini não consegue receber overlay como input mantendo fidelidade. Sequencial é o padrão. |
| **PNG output (não JPEG)** | JPEG 92% | Preserva alpha em SVG composto. Tamanho final ~1.5-2.5MB anúncio (ok pro Amazon — limite 10MB). |
| **Por-slot template (1 função TS por slot)** | Template engine genérico (handlebars), rules-based | 13 slots têm layouts muito distintos. Função TS dedicada é mais legível, debuggable. |

---

## 2. Stack técnico

### 2.1. Dependências novas

```json
{
  "dependencies": {
    "sharp": "^0.34.4",
    "text-to-svg": "^3.2.0",
    "@fontsource/dm-serif-display": "^5.2.5",
    "@fontsource/cormorant-garamond": "^5.2.5",
    "@fontsource/inter": "^5.2.5",
    "lucide-static": "^0.475.0"
  }
}
```

**Tamanho estimado de bundle Functions:**
- sharp (já): ~15MB binários
- text-to-svg: ~50KB
- @fontsource/* (3 fontes × 4 weights): ~600KB total TTFs
- lucide-static: ~6MB total mas pré-selecionamos ~30 ícones (~15KB)

**Configuração `netlify.toml`:**

```toml
[functions]
  external_node_modules = ["@google/genai", "@netlify/blobs", "sharp", "text-to-svg"]
  included_files = [
    "node_modules/sharp/**",
    "node_modules/@img/**",
    "node_modules/text-to-svg/**",
    "node_modules/@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.woff",
    "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff",
    "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff",
    "node_modules/@fontsource/inter/files/inter-latin-400-normal.woff",
    "node_modules/@fontsource/inter/files/inter-latin-500-normal.woff",
    "node_modules/@fontsource/inter/files/inter-latin-600-normal.woff"
  ]
```

⚠️ **IMPORTANTE:** `text-to-svg` lê arquivos TTF (não WOFF). Vamos precisar dos `.ttf` equivalentes. Cada `@fontsource` package tem `/files/` directory com vários formats — os TTFs ficam em `/dist/files/*.ttf` em algumas versões. Dex valida no install.

### 2.2. Topologia

```
src/types/anuncio.ts          ─── add SlotKind enum
src/lib/gemini/prompts.ts     ─── refactor: prompt por slot (não mais "briefings")
src/lib/gemini/schemas.ts     ─── refactor: schemas por slot

netlify/functions/_lib/
├── pipeline.ts               ─── orchestration (gera 13 cenas Gemini)
├── cropImage.ts              ─── (já existe, mantém)
├── composer/
│   ├── index.ts              ─── entry: composeForSlot(slotKind, baseImg, params) → Buffer
│   ├── constants.ts          ─── paleta cores Amalfi + sizes + fonts paths
│   ├── fonts.ts              ─── carrega TextToSVG instances pra cada fonte/peso
│   ├── icons.ts              ─── biblioteca curada de ~30 ícones lucide pré-importados
│   ├── primitives.ts         ─── helpers SVG: drawHeadline, drawBadge, drawArrow, drawBullet
│   └── slots/
│       ├── anuncio-1-capa.ts
│       ├── anuncio-2-dimensoes.ts
│       ├── anuncio-3-lifestyle-callouts.ts
│       ├── anuncio-4-comparativo.ts
│       ├── anuncio-5-aspiracional.ts
│       ├── anuncio-6-beneficios.ts
│       ├── anuncio-7-prova-final.ts
│       ├── aplus-1-header.ts
│       ├── aplus-2-antes-depois.ts
│       ├── aplus-3-specs.ts
│       ├── aplus-4-casos-uso.ts
│       ├── aplus-5-validacao.ts
│       └── aplus-6-cta.ts
```

---

## 3. Schema da composition layer

### 3.1. SlotKind enum (centraliza ID dos 13 slots)

```ts
// src/types/anuncio.ts
export type SlotKind =
  | 'anuncio-capa'
  | 'anuncio-dimensoes'
  | 'anuncio-lifestyle-callouts'
  | 'anuncio-comparativo'
  | 'anuncio-aspiracional'
  | 'anuncio-beneficios'
  | 'anuncio-prova-final'
  | 'aplus-header'
  | 'aplus-antes-depois'
  | 'aplus-specs'
  | 'aplus-casos-uso'
  | 'aplus-validacao'
  | 'aplus-cta';

export const SLOT_VARIANT: Record<SlotKind, 'anuncio' | 'aplus'> = {
  'anuncio-capa': 'anuncio',
  'anuncio-dimensoes': 'anuncio',
  'anuncio-lifestyle-callouts': 'anuncio',
  'anuncio-comparativo': 'anuncio',
  'anuncio-aspiracional': 'anuncio',
  'anuncio-beneficios': 'anuncio',
  'anuncio-prova-final': 'anuncio',
  'aplus-header': 'aplus',
  'aplus-antes-depois': 'aplus',
  'aplus-specs': 'aplus',
  'aplus-casos-uso': 'aplus',
  'aplus-validacao': 'aplus',
  'aplus-cta': 'aplus',
};

export const SLOT_DIMENSIONS: Record<SlotKind, { w: number; h: number }> = {
  'anuncio-capa': { w: 1024, h: 1024 },
  'anuncio-dimensoes': { w: 1024, h: 1024 },
  'anuncio-lifestyle-callouts': { w: 1024, h: 1024 },
  'anuncio-comparativo': { w: 1024, h: 1024 },
  'anuncio-aspiracional': { w: 1024, h: 1024 },
  'anuncio-beneficios': { w: 1024, h: 1024 },
  'anuncio-prova-final': { w: 1024, h: 1024 },
  'aplus-header': { w: 970, h: 600 },
  'aplus-antes-depois': { w: 970, h: 600 },
  'aplus-specs': { w: 970, h: 600 },
  'aplus-casos-uso': { w: 970, h: 600 },
  'aplus-validacao': { w: 970, h: 600 },
  'aplus-cta': { w: 970, h: 600 },
};
```

### 3.2. Params por slot (input pro composer)

Cada slot tem seu shape de params. O orchestrator extrai os campos corretos da `CriacaoForm` + `CriacaoResults` e passa pro composer.

```ts
// netlify/functions/_lib/composer/types.ts

export interface SlotParamsCapa {
  // Sem overlay; passa-through. Apenas validação de fundo branco.
}

export interface SlotParamsDimensoes {
  /** Cotas extraídas de detalhesTecnicos. */
  cotas: Array<{ axis: 'largura' | 'altura' | 'profundidade'; value: string; /* "16 cm" */ }>;
  /** Label rodapé. ex: "Dispenser de Sabonete · 240ml" */
  footerLabel: string;
}

export interface SlotParamsLifestyleCallouts {
  headline: string;        // "Pump Suave e Preciso"
  callouts: Array<{ icon: IconKey; label: string }>; // exato 3
}

export interface SlotParamsComparativo {
  eyebrow: string;         // "Acabamento Dourado de Alta Durabilidade"
  headline: string;        // "Qualidade e Confiança"
  bullets: string[];       // 3 bullets curtos
  comparisonLabel: string; // "Falta de Qualidade" (no canto inferior direito)
}

export interface SlotParamsAspiracional {
  headline: string;        // "Transforme seu Banheiro em um Spa"
  subBullets: string[];    // 3 bullets curtos
}

export interface SlotParamsBeneficios {
  headline: string;        // "Organização e Praticidade"
  bullets: string[];       // 3 bullets
}

export interface SlotParamsProvaFinal {
  tags: Array<{ icon: IconKey; label: string }>; // exato 2
}

export interface SlotParamsAplusHeader {
  headline: string;
  sub: string;
  badges: Array<{ icon: IconKey; label: string }>; // 2
}

export interface SlotParamsAplusAntesDepois {
  features: string[];      // 4 features (lado "depois") com checkmarks
}

export interface SlotParamsAplusSpecs {
  altura: string;          // "16cm"
  callouts: Array<{ icon: IconKey; titulo: string; spec: string }>; // 4-5
}

export interface SlotParamsAplusCasosUso {
  usos: Array<{ icon: IconKey; label: string }>; // exato 4
}

export interface SlotParamsAplusValidacao {
  callouts: string[];      // 3 mini-callouts em pills
}

export interface SlotParamsAplusCta {
  headline: string;        // "Eleve seu Ambiente"
  subCta: string;          // "Compre Agora" (texto, sem botão)
  miniFeatures: string[];  // 3 pequenas tags
}

export type IconKey =
  | 'drop' | 'sparkle' | 'clock' | 'check' | 'crown' | 'diamond'
  | 'gem' | 'leaf' | 'soap' | 'brush' | 'tube' | 'palette'
  | 'ruler' | 'scale' | 'recycle' | 'shield' | 'star' | 'circle-check';
```

---

## 4. Pipeline V3 (orchestration)

### 4.1. Fluxo de geração

```
1. Recebe CriacaoForm + (até 3) fotosBase64
2. (paralelo)
   ├─ analise (Gemini text)
   └─ visualSpec (Gemini Vision com fotos)
3. (paralelo)
   ├─ keywords
   ├─ titulos
   └─ descricao  (plain text — tag check no schema)
4. (sequencial — nada de briefings genéricos agora)
   13 chamadas Gemini Image em paralelo:
   - 7 anúncio (1024×1024)
   - 6 A+ (4:3 nativo, será cropado pra 970×600)
   Cada chamada recebe:
     • Prompt específico do SLOT (montado no server, não veio do Gemini)
     • As 3 fotos como inlineData refs
     • visualSpec como contexto
5. (paralelo)
   13 composições Sharp + SVG:
   - Cada uma recebe baseImage Buffer + slot params
   - Aplica overlay específico (capa = passa-through)
   - Retorna PNG final
6. Salva resultado
```

### 4.2. Mudanças nos prompts

**Eliminado:** o conceito de "briefings" genéricos onde Gemini decidia layout. Agora **o server tem o prompt FIXO de cada slot** (texto pré-escrito, baseado no Marco). Os 13 prompts ficam em `src/lib/gemini/prompts.ts` como funções `promptScene{SlotKind}(form, analise, visualSpec)`.

Exemplo:

```ts
export function promptSceneAnuncioCapa(form: CriacaoForm, visualSpec?: string): string {
  const fidelity = visualSpec
    ? `\n\nProduct fidelity (must match exactly):\n${visualSpec}`
    : '';
  return `
Professional product photography on pure white background (#FFFFFF).
Soft three-point lighting, no harsh shadows.
Product centered, occupying ~80% of the 1024×1024 frame.
No people, no text, no overlays, no watermarks.
E-commerce catalog style, clean minimal.
Subject: ${form.nomeProduto}.${fidelity}
`.trim();
}
```

E assim por diante pros outros 12 slots — cada um direcionando Gemini a **deixar negative space pra overlay**.

### 4.3. Schema dos retornos Gemini

Como **o server controla os prompts dos slots**, NÃO precisamos validar com Zod o "briefing". O retorno do Gemini Image é direto: `inlineData.data` (PNG base64). Sem JSON parsing.

Isso simplifica o schema:

```ts
// src/lib/gemini/schemas.ts — REMOVE briefingsSchema, briefingsAPlusSchema
// Mantém analiseSchema, keywordsSchema, titulosSchema, descricaoSchema
```

Tipos `BriefingImagem` e `BriefingAPlus` em `types/anuncio.ts` viram **internal-only**, populados pelo orchestrator com prompts pre-definidos:

```ts
// Pseudo
const slots: SlotKind[] = ['anuncio-capa', 'anuncio-dimensoes', /* ... */ ];
const briefings = slots.map((slot) => ({
  slot,
  prompt: promptForSlot[slot](form, analise, visualSpec),
  params: extractSlotParams(slot, form, analise, descricao),
}));
```

---

## 5. Composition layer — implementation

### 5.1. Entry point

```ts
// netlify/functions/_lib/composer/index.ts

import sharp from 'sharp';
import type { SlotKind } from '../../../../src/types/anuncio';
import { compose as composeAnuncioCapa } from './slots/anuncio-1-capa';
import { compose as composeAnuncioDimensoes } from './slots/anuncio-2-dimensoes';
// ... 11 mais imports
import type { SlotParamsByKind } from './types';

export async function composeForSlot<K extends SlotKind>(
  slotKind: K,
  baseImage: Buffer,
  params: SlotParamsByKind[K],
): Promise<Buffer> {
  switch (slotKind) {
    case 'anuncio-capa':
      return composeAnuncioCapa(baseImage, params as SlotParamsCapa);
    case 'anuncio-dimensoes':
      return composeAnuncioDimensoes(baseImage, params as SlotParamsDimensoes);
    // ... 11 mais cases
    default:
      throw new Error(`Unknown slot kind: ${slotKind}`);
  }
}
```

### 5.2. Primitives reutilizáveis

```ts
// netlify/functions/_lib/composer/primitives.ts

import { getFontTextSvg } from './fonts';
import { getIcon } from './icons';

export function drawHeadline(opts: {
  text: string;
  font: 'serif' | 'italic' | 'sans';
  weight?: 400 | 500 | 600;
  size: number;        // pt → px (1pt ≈ 1.333px)
  fill: string;        // hex
  x: number;
  y: number;
  anchor?: 'start' | 'middle' | 'end';
}): string {
  // Retorna fragmento <g>...</g> SVG com texto vetorizado via text-to-svg
}

export function drawBadge(opts: {
  cx: number;
  cy: number;
  radius: number;
  iconKey: IconKey;
  label: string;
  bgFill: string;       // ex: #D4A876 com 12% opacity
  borderStroke: string;
}): string;

export function drawArrow(opts: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  stroke: string;
  strokeWidth: number;
  dashed?: boolean;
}): string;

export function drawBullet(opts: {
  text: string;
  x: number;
  y: number;
  font: 'serif' | 'italic' | 'sans';
  size: number;
  fill: string;
  bulletStyle: 'arrow' | 'dot' | 'check';
}): string;

export function drawDimensionLabel(opts: {
  /** Cota de comprimento entre 2 pontos. */
  from: { x: number; y: number };
  to: { x: number; y: number };
  text: string;          // "16 cm"
  position: 'above' | 'below' | 'left' | 'right';
}): string;

export function drawSplitDivider(opts: {
  width: number;
  height: number;
  axis: 'vertical' | 'horizontal';
  position: number;      // 0-1
  stroke: string;
}): string;

export function drawTag(opts: {
  x: number;
  y: number;
  width?: number;
  iconKey?: IconKey;
  label: string;
  bgFill: string;
  textFill: string;
}): string;
```

### 5.3. Exemplo de slot — `anuncio-2-dimensoes.ts`

```ts
// netlify/functions/_lib/composer/slots/anuncio-2-dimensoes.ts

import sharp from 'sharp';
import type { SlotParamsDimensoes } from '../types';
import { drawDimensionLabel, drawHeadline } from '../primitives';
import { COLOR } from '../constants';

export async function compose(
  baseImage: Buffer,
  params: SlotParamsDimensoes,
): Promise<Buffer> {
  const { cotas, footerLabel } = params;

  // 1. Constrói SVG de overlay (1024×1024 transparente com cotas + footer)
  const cotasSvg = cotas
    .map((c) => {
      // Posiciona cotas baseado em axis (largura: top arrow horizontal, etc)
      // ...lógica de coordenadas calculadas
      return drawDimensionLabel({ /* ... */ });
    })
    .join('\n');

  const footerSvg = drawHeadline({
    text: footerLabel,
    font: 'sans',
    weight: 500,
    size: 22,
    fill: COLOR.tinta,
    x: 512, // center
    y: 980, // near bottom
    anchor: 'middle',
  });

  const fullSvg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      ${cotasSvg}
      ${footerSvg}
    </svg>
  `;

  // 2. Compose: base + svg overlay
  return sharp(baseImage)
    .composite([{ input: Buffer.from(fullSvg), top: 0, left: 0 }])
    .png({ quality: 90 })
    .toBuffer();
}
```

### 5.4. Fontes (fonts.ts)

```ts
// netlify/functions/_lib/composer/fonts.ts

import TextToSVG from 'text-to-svg';
import path from 'node:path';

const FONT_PATHS = {
  'serif-400': path.resolve('node_modules/@fontsource/dm-serif-display/files/dm-serif-display-latin-400-normal.ttf'),
  'italic-400': path.resolve('node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.ttf'),
  'italic-500': path.resolve('node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.ttf'),
  'sans-400': path.resolve('node_modules/@fontsource/inter/files/inter-latin-400-normal.ttf'),
  'sans-500': path.resolve('node_modules/@fontsource/inter/files/inter-latin-500-normal.ttf'),
  'sans-600': path.resolve('node_modules/@fontsource/inter/files/inter-latin-600-normal.ttf'),
};

const cache: Record<string, TextToSVG> = {};

export function getFontTextSvg(key: keyof typeof FONT_PATHS): TextToSVG {
  if (!cache[key]) {
    cache[key] = TextToSVG.loadSync(FONT_PATHS[key]);
  }
  return cache[key];
}

/** Converte texto em SVG `<path>` vetorizado. */
export function textToPath(opts: {
  text: string;
  fontKey: keyof typeof FONT_PATHS;
  fontSize: number;
  fill: string;
  x: number;
  y: number;
  anchor?: 'left' | 'center' | 'right';
}): string {
  const tts = getFontTextSvg(opts.fontKey);
  const path = tts.getD(opts.text, {
    fontSize: opts.fontSize,
    anchor: `${opts.anchor ?? 'left'} top`,
    x: opts.x,
    y: opts.y,
  });
  return `<path d="${path}" fill="${opts.fill}" />`;
}
```

⚠️ **Validação de TTFs no install:** o `@fontsource` package pode trazer só `.woff/.woff2`. Se `.ttf` não estiver presente, Dex precisa baixar diretamente do [Google Fonts](https://fonts.google.com) e checar in. Plan B: usar `@fontsource/dm-serif-display/files/*-100.woff` se existir, mas `text-to-svg` é estrito sobre TTF — talvez precise `font-converter` no build.

### 5.5. Ícones (icons.ts)

```ts
// netlify/functions/_lib/composer/icons.ts

// Pre-importa só os ~30 ícones que usamos.
// lucide-static exporta cada ícone como SVG string em arquivo individual.
import dropSvg from 'lucide-static/icons/droplet.svg';
import checkSvg from 'lucide-static/icons/check.svg';
// ... 28 mais

const ICON_LIBRARY: Record<IconKey, string> = {
  drop: dropSvg,
  check: checkSvg,
  // ...
};

/** Retorna SVG inline pronto pra embed. Aplica fill custom. */
export function getIcon(key: IconKey, fill = 'currentColor', size = 24): string {
  let svg = ICON_LIBRARY[key];
  // lucide-static SVGs vêm com stroke="currentColor"; substituímos
  svg = svg.replace('stroke="currentColor"', `stroke="${fill}"`);
  // Force size
  svg = svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
  return svg;
}
```

⚠️ Se importar SVG como string falhar (Vite não trata `.svg` como string em Node), Dex pode usar `fs.readFileSync(path)` no module load (cached).

---

## 6. Mudanças no pipeline server-side

### 6.1. `pipeline.ts` refatorado

```ts
// netlify/functions/_lib/pipeline.ts

import { composeForSlot } from './composer';
import { extractSlotParams } from './slot-params';
import { promptForSlot } from './slot-prompts';
import { SlotKind, SLOT_VARIANT, SLOT_DIMENSIONS } from '../../../src/types/anuncio';

const SLOT_ORDER: SlotKind[] = [
  'anuncio-capa',
  'anuncio-dimensoes',
  'anuncio-lifestyle-callouts',
  'anuncio-comparativo',
  'anuncio-aspiracional',
  'anuncio-beneficios',
  'anuncio-prova-final',
  'aplus-header',
  'aplus-antes-depois',
  'aplus-specs',
  'aplus-casos-uso',
  'aplus-validacao',
  'aplus-cta',
];

export async function runAnuncioPipeline(form: CriacaoForm, opts: PipelineOpts): Promise<CriacaoResults> {
  // ... análise + paralelo (keywords|titulos|descricao) + visualSpec idem V2
  
  // Substitui briefings: server constrói prompts/params dos 13 slots
  await opts.onStep('Compondo as 13 cenas…');
  const briefings = SLOT_ORDER.map((slot) => ({
    slot,
    prompt: promptForSlot(slot, form, analise, descricao, visualSpec),
    params: extractSlotParams(slot, form, analise, descricao),
  }));
  
  // Renderiza 13 imagens em paralelo: Gemini → Sharp composition
  await opts.onStep('Renderizando imagens…', { current: 0, total: 13 });
  let completed = 0;
  
  const imagens = await Promise.all(briefings.map(async ({ slot, prompt, params }) => {
    const variante = SLOT_VARIANT[slot];
    const dim = SLOT_DIMENSIONS[slot];
    
    // 1. Gemini gera cena base
    const baseB64 = await generateImageBase(prompt, fotos, variante);
    if (!baseB64) {
      // Fail isolado — retorna placeholder
      completed += 1;
      await opts.onStep('Renderizando imagens…', { current: completed, total: 13 });
      return makeFailedImage(slot, dim);
    }
    
    let baseBuffer = Buffer.from(baseB64, 'base64');
    
    // 2. Pra A+: crop 4:3 → 970×600 antes da composition
    if (variante === 'aplus') {
      const cropped = await cropToSize(baseB64, dim.w, dim.h);
      baseBuffer = Buffer.from(cropped.base64, 'base64');
    }
    
    // 3. Composition layer aplica overlay
    let finalBuffer = baseBuffer;
    try {
      finalBuffer = await composeForSlot(slot, baseBuffer, params);
    } catch (err) {
      console.error(`[pipeline] composition slot ${slot} falhou:`, err);
      // Graceful: usa imagem base sem overlay
    }
    
    completed += 1;
    await opts.onStep('Renderizando imagens…', { current: completed, total: 13 });
    
    return {
      slotKind: slot,
      variante,
      base64: `data:image/png;base64,${finalBuffer.toString('base64')}`,
      largura: dim.w,
      altura: dim.h,
      modelUsado: IMAGE_MODEL,
    };
  }));
  
  return { /* ...resultados */ };
}
```

### 6.2. Slot params extractor

```ts
// netlify/functions/_lib/slot-params.ts

import type { SlotKind } from '../../../src/types/anuncio';

export function extractSlotParams(
  slot: SlotKind,
  form: CriacaoForm,
  analise: AnaliseDeMercado,
  descricao: DescricaoResult,
): unknown {
  switch (slot) {
    case 'anuncio-capa':
      return {};
    case 'anuncio-dimensoes': {
      const cotas = parseCotasFromDetalhes(form.detalhesTecnicos);
      return { cotas, footerLabel: form.nomeProduto };
    }
    case 'anuncio-lifestyle-callouts': {
      const headline = pickHeadline('lifestyle-callouts', analise.persona.label);
      const callouts = analise.motivacoes.slice(0, 3).map((m) => ({
        icon: inferIconFromLabel(m),
        label: m,
      }));
      return { headline, callouts };
    }
    // ... outros 11 slots
  }
}

function parseCotasFromDetalhes(text: string): Cota[] {
  // Regex aproximado: "16cm altura", "7cm largura", "240ml"
  const cotas: Cota[] = [];
  const cmMatches = text.matchAll(/(\d+(?:[.,]\d+)?)\s*cm/gi);
  // ... heurística pra mapear pra largura/altura/profundidade
  return cotas;
}
```

### 6.3. Slot prompts builder

```ts
// netlify/functions/_lib/slot-prompts.ts

export function promptForSlot(
  slot: SlotKind,
  form: CriacaoForm,
  analise: AnaliseDeMercado,
  descricao: DescricaoResult,
  visualSpec?: string,
): string {
  switch (slot) {
    case 'anuncio-capa':
      return promptAnuncioCapa(form, visualSpec);
    case 'anuncio-dimensoes':
      return promptAnuncioDimensoes(form, visualSpec);
    // ... outros 11
  }
}
```

Os 13 builders ficam em `src/lib/gemini/prompts.ts` (mantém parity com V1/V2 onde prompts moram). Isso facilita Sarah/dev ajustarem prompts sem mexer em pipeline.

---

## 7. Performance

### 7.1. Estimativas

| Etapa | Tempo |
|-------|-------|
| Análise Gemini text | 3-5s |
| Vision (1 call paralelo c/ análise) | 4-8s (depende do tamanho das fotos) |
| Keywords + Titulos + Descricao (paralelo) | 8-15s |
| Geração 13 cenas Gemini Image (paralelo) | 15-30s (limited by model rate) |
| Composition layer 13 slots (CPU paralelo) | 1-3s |
| **Total V3** | **~45-90s** |

### 7.2. Custos

- Gemini Flash Image: $0.039 × 13 = **$0.51 por anúncio**
- Gemini Flash text (4 chamadas): ~$0.005
- Composition layer: $0 (CPU)
- **Total: ~$0.52/anúncio** (vs $0.50 V2)

### 7.3. Bundle size impacto

- Functions zip atual: ~16MB
- + text-to-svg + 6 TTFs (~600KB) + 30 ícones (~15KB) = ~16.6MB
- Netlify limit: 250MB → confortável

---

## 8. Files novos (Dex)

```
+ packages/bottega/netlify/functions/_lib/composer/index.ts
+ packages/bottega/netlify/functions/_lib/composer/constants.ts
+ packages/bottega/netlify/functions/_lib/composer/fonts.ts
+ packages/bottega/netlify/functions/_lib/composer/icons.ts
+ packages/bottega/netlify/functions/_lib/composer/primitives.ts
+ packages/bottega/netlify/functions/_lib/composer/types.ts
+ packages/bottega/netlify/functions/_lib/composer/slots/[13 arquivos]
+ packages/bottega/netlify/functions/_lib/slot-prompts.ts
+ packages/bottega/netlify/functions/_lib/slot-params.ts
```

## 9. Files modificados

```
M packages/bottega/package.json (+ text-to-svg, @fontsource/*, lucide-static)
M packages/bottega/netlify.toml (external_node_modules + included_files fonts)
M packages/bottega/netlify/functions/_lib/pipeline.ts (refatora flow)
M packages/bottega/netlify/functions/regen-image.ts (aceita slotKind + params, aplica composition)
M packages/bottega/src/types/anuncio.ts (+ SlotKind, SLOT_VARIANT, SLOT_DIMENSIONS, ImagemGerada.slotKind)
M packages/bottega/src/lib/gemini/prompts.ts (13 builders fixos por slot, deleta promptBriefings genérico)
M packages/bottega/src/lib/gemini/schemas.ts (remove briefingsSchema/briefingsAPlusSchema)
M packages/bottega/src/lib/mocks/index.ts (mock de 13 imagens com SlotKind)
M packages/bottega/src/store/anunciosStore.ts (migration v4 → v5, adiciona slotKind nas imagens antigas)
M packages/bottega/src/store/criacaoStore.ts (regenerate passa slotKind)
M packages/bottega/src/components/molecules/BriefingTile.tsx (renderiza com aspecto correto pelo slotKind)
M packages/bottega/src/components/organisms/ResultsTabs.tsx (sub-abas filtram por SLOT_VARIANT)
```

---

## 10. Acceptance criteria técnicos

Aria valida quando Dex entregar:

- [ ] **AC-T1:** `npm run build` limpo
- [ ] **AC-T2:** `npm run lint` zero erros
- [ ] **AC-T3:** 5 Functions compilam via esbuild test
- [ ] **AC-T4:** `text-to-svg` carrega TTFs sem erro em runtime (smoke test do composer)
- [ ] **AC-T5:** Composition de 1 slot localmente (script test) gera PNG válido
- [ ] **AC-T6:** Bundle Netlify Functions < 50MB
- [ ] **AC-T7:** Migration v4→v5 do anunciosStore não crasha em anúncios antigos
- [ ] **AC-T8:** End-to-end em produção: 13 imagens renderizadas com overlay em < 90s

E os 13 ACs visuais do Marco (`bottega-v3-blueprint-visual.md` seção "Acceptance Criteria").

---

## 11. Riscos / atenção

| Risco | Mitigação |
|-------|-----------|
| `@fontsource/*` não tem TTFs | Plan B: baixar Google Fonts manualmente, checkin em `assets/fonts/` |
| `lucide-static` não permite `import 'X.svg'` | Plan B: `fs.readFileSync` do path absoluto no module load |
| Sharp + SVG composition lenta em Functions | Composer roda paralelo (Promise.all) — não bloqueia |
| Gemini Image deixa pouco negative space | Prompts detalham regiões pra deixar limpas; se 1 slot ficar ruim, regenerate disponível |
| Fontsizes "sextos" (Inter Medium etc) faltarem | Spec reduz pra 6 weights essenciais (já listados) |
| Bundle > limite Netlify | Limit é 250MB, projetamos 16.6MB. Confortável. |

---

## 12. Pra Dex executar

1. **Cria branch:** `feat/bottega-v3-composition` from `main`
2. **Lê:** este spec + `bottega-v3-blueprint-visual.md` (Marco) inteiros
3. **Implementa em ordem:**
   1. `package.json` + `netlify.toml` (deps + included_files)
   2. `composer/constants.ts` + `composer/types.ts` + `composer/fonts.ts`
   3. `composer/icons.ts` + `composer/primitives.ts`
   4. `composer/slots/anuncio-1-capa.ts` (caso simples — pass-through)
   5. `composer/slots/anuncio-2-dimensoes.ts` (primeiro caso real com overlay)
   6. **Smoke test:** rodar localmente via script `scripts/test-composer.mjs` com imagem fake → ver PNG saindo
   7. Outros 11 slots
   8. `slot-prompts.ts` (13 prompt builders)
   9. `slot-params.ts` (extractors)
   10. Refator `pipeline.ts`
   11. Atualiza `regen-image.ts`
   12. Atualiza `types/anuncio.ts` + schemas + stores + UI
   13. `npm run build && npm run lint`
   14. Smoke test E2E local com `netlify dev` (preview deploy se possível)
4. **Commit em chunks** temáticos:
   - "chore(deps): adiciona text-to-svg + fontsource + lucide-static"
   - "feat(composer): primitives + fontes + ícones"
   - "feat(composer): 13 slots de composição"
   - "refactor(pipeline): orchestration por slot kind"
   - "feat(types): SlotKind + migration v5"
   - "fix(ui): aspect ratio dinâmico por slotKind"
5. **Hand off pro Gage** quando build+lint passarem

---

— Aria, arquitetando o futuro 🏗️
