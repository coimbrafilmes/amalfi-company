/**
 * Slot prompts V5 (Gumpinho-style) — gpt-image-1 desenha TUDO.
 *
 * Mudança vs V4 (Filosofia C):
 *   V4 pediu cena pura + composer SVG por cima → composer overlay batia
 *   no produto e nem sempre cobria todo branding.
 *
 *   V5 pede TUDO no prompt: layout exato + texto literal + cards + ícones.
 *   Composer SVG fica DESLIGADO (APPLY_COMPOSER=false). Modelo gpt-image-1
 *   acerta PT-BR em prompts estruturados (provado pelo padrão Gumpinho/
 *   ChatGPT — ex: "MULTIFUNCIONAL E COMPACTO" + "RESIDÊNCIAS" + "ESCRITÓRIOS"
 *   tudo perfeito numa chamada).
 *
 * Receita do prompt estrutural:
 *   1. LAYOUT em bullets explícitos (top/center/bottom % do frame)
 *   2. TEXTO LITERAL entre aspas duplas pro modelo copiar
 *   3. CORES hex específicas
 *   4. TIPOGRAFIA explícita (sans-bold, caixa-alta, etc)
 *   5. CARDS/CALLOUTS/ICONS descritos visualmente
 *   6. NEGATIVE: no extra text, no other languages, no logos
 */

import type {
  CriacaoForm,
  EstiloImagem,
  SlotKind,
} from '../../../src/types/anuncio';
import type { SlotParamsByKind } from './composer/types';

// ============================================================================
// ANCHORS
// ============================================================================

const PALETTE = `Brand palette: deep navy #1F2A3A (headlines), warm cream #F8F4EE (backgrounds), gold ocre #D4A876 (accents/badges), terracotta #C47855 (highlights). Photography: warm natural light, premium residential context.`;

const NO_BRAND = `Do NOT include logos of Amazon, Mercado Livre, Shopee, or any third-party brand. Do not write "Amazon" or any e-commerce platform name anywhere.`;

const TEXT_FIDELITY = `CRITICAL — TEXT FIDELITY: every text element marked between «quotes» MUST be rendered EXACTLY as written, character by character including all Portuguese accents (ç ã á é ê í ó ô ú). Do NOT translate. Do NOT paraphrase. Do NOT add extra words. If unsure of a character, copy it exactly. NO English text, NO other languages — Portuguese only as quoted.`;

const QUALITY = `Premium magazine-quality output. Sharp focus on product photography, crisp typography. Style: Brazilian Amazon BR top-seller infographic ad (think Gumpinho / Multilaser premium / Tramontina campaign).`;

// ============================================================================
// HELPERS
// ============================================================================

function tail(): string {
  return `\n\n${TEXT_FIDELITY}\n${NO_BRAND}\n${PALETTE}\n${QUALITY}`;
}

function productClause(form: CriacaoForm): string {
  const hasRefs = (form.fotosBase64?.length ?? 0) > 0;
  if (hasRefs) {
    return `USE THE PROVIDED REFERENCE PHOTOS to render the product faithfully — same shape, color, material, finish, proportions. Product reference: "${form.nomeProduto}".`;
  }
  return `Product: "${form.nomeProduto}".`;
}

// ============================================================================
// PROMPTS POR SLOT
// ============================================================================

type PromptCtx = {
  form: CriacaoForm;
  params: SlotParamsByKind[SlotKind];
  visualSpec?: string;
  estilo: EstiloImagem;
};

type PromptByStyle = Record<EstiloImagem, (ctx: PromptCtx) => string>;

// --- ANÚNCIO ---

const PROMPT_ANUNCIO_CAPA: PromptByStyle = {
  lifestyle: ({ form }) => `
SQUARE 1:1 Amazon BR main listing cover for «${form.nomeProduto}».

LAYOUT:
- Pure white background #FFFFFF
- Product perfectly centered, occupying ~78% of frame
- Soft three-point studio lighting, subtle ground shadow
- Slight 3/4 angle camera

NO TEXT, NO labels, NO callouts, NO badges, NO watermarks, NO props.
Compliant with Amazon main image rules (white background, product only).

${productClause(form)}${tail()}`.trim(),

  infografico: ({ form }) => `
SQUARE 1:1 Amazon BR main listing cover for «${form.nomeProduto}».

LAYOUT:
- Pure white background #FFFFFF
- Product perfectly centered, occupying ~80% of frame
- Soft studio lighting, minimal shadow
- Front-3/4 angle showing silhouette clearly

NO TEXT anywhere. NO props. Amazon main image compliant.

${productClause(form)}${tail()}`.trim(),

  misto: ({ form }) => `
SQUARE 1:1 Amazon BR main listing cover for «${form.nomeProduto}».

LAYOUT:
- Pure white background #FFFFFF
- Product centered ~78% of frame
- Soft three-point lighting with warm rim light
- 3/4 angle

NO TEXT. NO props. Amazon main image compliant.

${productClause(form)}${tail()}`.trim(),
};

const PROMPT_ANUNCIO_DIMENSOES: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-dimensoes'];
    const cotaLines = p.cotas.length > 0
      ? p.cotas.map((c) => `«${c.axis === 'altura' ? 'Altura' : c.axis === 'largura' ? 'Largura' : 'Profundidade'}: ${c.value}»`).join(', ')
      : `«Material: ${p.material ?? 'Premium'}»${p.cor ? `, «Cor: ${p.cor}»` : ''}${p.capacidade ? `, «Capacidade: ${p.capacidade}»` : ''}`;
    const rulerVal = p.cotas.find(c => c.axis === 'altura')?.value ?? p.capacidade ?? p.cotas[0]?.value ?? '';
    return `
SQUARE 1:1 Amazon BR spec-sheet infographic for «${form.nomeProduto}».

LAYOUT:
- Background: cream gradient #F8F4EE → #EFE8DD
- TOP BAND (12%): bold sans-serif uppercase headline, navy #1F2A3A, centered: «ESPECIFICAÇÕES TÉCNICAS»
- CENTER (70%): the product photographed isolated, ~50% of width, slightly left of center
- LEFT side: thin navy lines pointing from product to text labels in sans-serif navy: ${cotaLines}
- RIGHT side: thin vertical ruler (navy outline rectangle with tick marks and arrows top/bottom), label «${rulerVal}» in middle
- BOTTOM BAND (8%): centered sans-serif navy: «${p.footerLabel}»

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-dimensoes'];
    const cotaLines = p.cotas.length > 0
      ? p.cotas.map((c) => `«${c.axis === 'altura' ? 'Altura' : c.axis === 'largura' ? 'Largura' : 'Profundidade'}: ${c.value}»`).join(', ')
      : `«Material: ${p.material ?? 'Premium'}»${p.cor ? `, «Cor: ${p.cor}»` : ''}${p.capacidade ? `, «Capacidade: ${p.capacidade}»` : ''}`;
    const rulerVal = p.cotas.find(c => c.axis === 'altura')?.value ?? p.capacidade ?? p.cotas[0]?.value ?? '';
    return `
SQUARE 1:1 Amazon BR spec-sheet for «${form.nomeProduto}».

LAYOUT:
- Background: solid cream #F8F4EE
- TOP (12%): bold sans-serif uppercase, navy #1F2A3A, centered: «ESPECIFICAÇÕES TÉCNICAS»
- CENTER: product centered isolated on cream, ~50% width
- LEFT: 2-3 callouts with thin navy line + label sans-serif navy: ${cotaLines}
- RIGHT: vertical ruler outline navy with «${rulerVal}» label centered
- BOTTOM (8%): footer sans-serif navy centered: «${p.footerLabel}»

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-dimensoes'];
    const cotaLines = p.cotas.length > 0
      ? p.cotas.map((c) => `«${c.axis === 'altura' ? 'Altura' : c.axis === 'largura' ? 'Largura' : 'Profundidade'}: ${c.value}»`).join(', ')
      : `«Material: ${p.material ?? 'Premium'}»${p.cor ? `, «Cor: ${p.cor}»` : ''}${p.capacidade ? `, «Capacidade: ${p.capacidade}»` : ''}`;
    const rulerVal = p.cotas.find(c => c.axis === 'altura')?.value ?? p.capacidade ?? p.cotas[0]?.value ?? '';
    return `
SQUARE 1:1 Amazon BR spec-sheet for «${form.nomeProduto}».

LAYOUT:
- Background: warm cream gradient #F8F4EE → #EFE8DD
- TOP (12%): bold sans-serif UPPERCASE, navy #1F2A3A, centered: «ESPECIFICAÇÕES TÉCNICAS»
- CENTER: product photographed isolated with subtle warm rim light, ~50% width
- LEFT callouts (sans-serif navy): ${cotaLines}
- RIGHT vertical ruler navy outline with «${rulerVal}»
- BOTTOM (8%): «${p.footerLabel}» sans navy centered

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_ANUNCIO_LIFESTYLE_CALLOUTS: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-lifestyle-callouts'];
    const pillsList = p.callouts.slice(0, 3).map((c) => `«${c.label.toUpperCase()}»`).join(' · ');
    void pillsList;
    return `
SQUARE 1:1 Amazon BR lifestyle infographic for «${form.nomeProduto}», cinematic Architectural Digest style.

LAYOUT:
- TOP BAND (15%, white #FFFFFF or cream #F8F4EE): bold sans-serif headline navy #1F2A3A centered, max 2 lines: «${p.headline}»
- CENTER (65%): cinematic editorial photo of the product in luxury Brazilian residential setting (marble counter, warm golden hour, walnut, brass, eucalyptus blur). Product is the visual hero.
- TOP RIGHT CORNER: small octagonal gold #D4A876 seal badge with 2-line uppercase serif text inside it: line 1 «CURADO», line 2 «AMALFI»
- BOTTOM BAND (20%, white #FFFFFF or cream #F8F4EE): 3 horizontal pill-shaped buttons evenly spaced, each pill has white background with thin navy border, small line-icon on left + bold sans-serif uppercase label in navy. Pills left-to-right:
  Pill 1: icon + «${p.callouts[0]?.label ?? ''}»
  Pill 2: icon + «${p.callouts[1]?.label ?? ''}»
  Pill 3: icon + «${p.callouts[2]?.label ?? ''}»

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-lifestyle-callouts'];
    return `
SQUARE 1:1 Amazon BR feature infographic for «${form.nomeProduto}».

LAYOUT:
- TOP BAND (15%, cream #F8F4EE): bold sans-serif headline navy centered: «${p.headline}»
- CENTER (65%): product on minimalist neutral residential surface, soft warm light
- TOP RIGHT: gold #D4A876 octagonal badge with «CURADO» / «AMALFI» (2 lines uppercase)
- BOTTOM BAND (20%, cream): 3 horizontal pills (white bg, navy border, icon+label):
  «${p.callouts[0]?.label ?? ''}»
  «${p.callouts[1]?.label ?? ''}»
  «${p.callouts[2]?.label ?? ''}»

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-lifestyle-callouts'];
    return `
SQUARE 1:1 Amazon BR lifestyle+feature infographic for «${form.nomeProduto}».

LAYOUT:
- TOP BAND (15%, cream #F8F4EE): bold sans-serif headline navy centered: «${p.headline}»
- CENTER (65%): editorial product photo in warm residential context (marble, linen, brass, soft warm light, shallow depth)
- TOP RIGHT octagonal gold #D4A876 seal: «CURADO» / «AMALFI» (2 lines uppercase)
- BOTTOM BAND (20%, cream): 3 horizontal pills white bg navy border, icon+label:
  «${p.callouts[0]?.label ?? ''}»
  «${p.callouts[1]?.label ?? ''}»
  «${p.callouts[2]?.label ?? ''}»

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_ANUNCIO_COMPARATIVO: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-comparativo'];
    const bulletsLeft = ['Qualidade comum', 'Sem destaque', 'Sem curadoria'].map(b => `«${b}»`).join(', ');
    const bulletsRight = p.bullets.slice(0, 3).map(b => `«${b}»`).join(', ');
    return `
SQUARE 1:1 Amazon BR comparison infographic for «${form.nomeProduto}».

LAYOUT — vertical split 50/50:
- TOP BAND (8%, cream #F8F4EE): bold sans-serif uppercase headline navy centered: «O INVESTIMENTO CERTO»
- LEFT 50% (sand cream background #E8DFD2):
  - Top-center: navy #1F2A3A pill capsule with bold uppercase sans label inside: «COMUM»
  - Center: abstract grey silhouette outline of generic product (no real product)
  - Below silhouette: 3 lines, each starts with red ✗ icon + sans-serif navy text: ${bulletsLeft}
- RIGHT 50%: hero shot of «${form.nomeProduto}» on premium marble/walnut, warm cinematic light, shallow depth
  - Top-center over photo: gold #D4A876 pill capsule with bold uppercase sans label: «CURADORIA AMALFI»
  - Below pill, over photo: 3 lines, each starts with green ✓ check icon + sans-serif navy text: ${bulletsRight}

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-comparativo'];
    const bulletsLeft = ['Qualidade comum', 'Sem destaque', 'Sem curadoria'].map(b => `«${b}»`).join(', ');
    const bulletsRight = p.bullets.slice(0, 3).map(b => `«${b}»`).join(', ');
    return `
SQUARE 1:1 Amazon BR comparison infographic for «${form.nomeProduto}».

LAYOUT — split 50/50:
- TOP (8%): bold sans uppercase navy centered: «O INVESTIMENTO CERTO»
- LEFT (sand #E8DFD2): navy pill «COMUM» on top + grey silhouette + ✗ list: ${bulletsLeft}
- RIGHT (cream #F8F4EE): clean shot of product + gold pill «CURADORIA AMALFI» + ✓ list: ${bulletsRight}

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-comparativo'];
    const bulletsLeft = ['Qualidade comum', 'Sem destaque', 'Sem curadoria'].map(b => `«${b}»`).join(', ');
    const bulletsRight = p.bullets.slice(0, 3).map(b => `«${b}»`).join(', ');
    return `
SQUARE 1:1 Amazon BR comparison infographic for «${form.nomeProduto}».

LAYOUT — split 50/50:
- TOP BAND (8%, cream): bold sans-serif UPPERCASE navy centered: «O INVESTIMENTO CERTO»
- LEFT 50% (sand cream #E8DFD2): navy pill «COMUM» top, grey silhouette of generic product, 3 ✗ lines: ${bulletsLeft}
- RIGHT 50%: hero «${form.nomeProduto}» on warm marble/walnut, gold pill «CURADORIA AMALFI» top, 3 ✓ lines: ${bulletsRight}

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_ANUNCIO_ASPIRACIONAL: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-aspiracional'];
    const bullets = p.subBullets.slice(0, 3).map(b => `«${b}»`).join(', ');
    return `
SQUARE 1:1 Amazon BR aspirational lifestyle ad for «${form.nomeProduto}».

LAYOUT:
- TOP-LEFT (28% width × 50% height): bold serif italic headline navy #1F2A3A in 2-3 lines: «${p.headline}»
  Below headline, smaller sans-serif navy 3 bullets each prefixed with • dot:
  ${bullets}
- RIGHT 70%: cinematic aspirational scene featuring the product in luxury Brazilian residential moment (Mediterranean villa terrace, boutique hotel spa, designer's home interior). Marble surfaces, lit beeswax candles, brass holders, folded linen, eucalyptus, warm golden hour, very shallow depth of field. Product as cinematic hero with rim light.

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-aspiracional'];
    const bullets = p.subBullets.slice(0, 3).map(b => `«${b}»`).join(', ');
    return `
SQUARE 1:1 Amazon BR product moment for «${form.nomeProduto}».

LAYOUT:
- TOP-LEFT (28%): bold serif italic navy headline in 2-3 lines: «${p.headline}»
  + sans-serif navy bullets with • dot prefix: ${bullets}
- RIGHT 70%: clean residential context, warm side light, product clearly visible

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-aspiracional'];
    const bullets = p.subBullets.slice(0, 3).map(b => `«${b}»`).join(', ');
    return `
SQUARE 1:1 Amazon BR aspirational ad for «${form.nomeProduto}».

LAYOUT:
- TOP-LEFT 28%: bold serif italic navy #1F2A3A headline 2-3 lines: «${p.headline}»
  Below: sans-serif navy bullets with • prefix: ${bullets}
- RIGHT 70%: cinematic luxury residential scene (marble, candles, brass, linen, golden hour). Product hero with rim light.

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_ANUNCIO_BENEFICIOS: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-beneficios'];
    const bullets = p.bullets.slice(0, 3).map(b => `«${b}»`).join(', ');
    return `
SQUARE 1:1 Amazon BR benefits infographic for «${form.nomeProduto}».

LAYOUT — horizontal split 50/50:
- TOP 50%: bold sans-serif UPPERCASE headline navy #1F2A3A in 2 lines centered: «${p.headline.toUpperCase()}»
  Below in same area: 3 bullets, each prefixed with bold navy • dot, sans-serif navy:
  ${bullets}
- BOTTOM 50%: hero shot of «${form.nomeProduto}» on warm residential surface (marble or walnut), warm rim light, shallow depth of field

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-beneficios'];
    const bullets = p.bullets.slice(0, 3).map(b => `«${b}»`).join(', ');
    return `
SQUARE 1:1 Amazon BR benefits for «${form.nomeProduto}».

LAYOUT — split 50/50:
- TOP: bold sans UPPERCASE navy 2 lines centered: «${p.headline.toUpperCase()}»
  + 3 navy • bullets: ${bullets}
- BOTTOM: clean product shot on cream backdrop with warm light

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-beneficios'];
    const bullets = p.bullets.slice(0, 3).map(b => `«${b}»`).join(', ');
    return `
SQUARE 1:1 Amazon BR benefits for «${form.nomeProduto}».

LAYOUT — split 50/50:
- TOP 50%: bold sans-serif UPPERCASE navy #1F2A3A 2 lines centered: «${p.headline.toUpperCase()}»
  + sans navy bullets with • dot: ${bullets}
- BOTTOM 50%: hero product on premium surface, warm rim light, shallow depth

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_ANUNCIO_PROVA_FINAL: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-prova-final'];
    const tags = p.tags.slice(0, 2).map(t => `«${t.label}»`).join(' · ');
    return `
SQUARE 1:1 Amazon BR magazine-cover hero for «${form.nomeProduto}».

LAYOUT:
- TOP RIGHT CORNER: gold #D4A876 octagonal badge with 2-line UPPERCASE serif: line 1 «CURADO», line 2 «AMALFI»
- TOP LEFT (12% height): 2 small horizontal pill capsules side-by-side, white background navy border, sans-serif navy uppercase labels: ${tags}
- CENTER (75%): dramatic editorial close-up of the product as fashion-magazine cover. Slight low-angle, very shallow depth of field, premium materials around (marble, brass, velvet) blurred. Cinematic warm rim light.

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-prova-final'];
    const tags = p.tags.slice(0, 2).map(t => `«${t.label}»`).join(' · ');
    return `
SQUARE 1:1 Amazon BR hero for «${form.nomeProduto}».

LAYOUT:
- TOP RIGHT: gold octagonal badge «CURADO» / «AMALFI»
- TOP LEFT: 2 small white pills navy border, sans navy uppercase: ${tags}
- CENTER: clean premium close-up of product on cream gradient with warm rim light

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['anuncio-prova-final'];
    const tags = p.tags.slice(0, 2).map(t => `«${t.label}»`).join(' · ');
    return `
SQUARE 1:1 Amazon BR magazine-cover hero for «${form.nomeProduto}».

LAYOUT:
- TOP RIGHT: gold #D4A876 octagonal badge «CURADO» / «AMALFI» (2 lines uppercase)
- TOP LEFT: 2 small white-background pills navy border, sans-serif navy uppercase labels: ${tags}
- CENTER 75%: dramatic editorial close-up, slight low-angle, shallow depth, premium materials blurred (marble, brass), warm rim light

${productClause(form)}${tail()}`.trim();
  },
};

// --- A+ CONTENT ---

const PROMPT_APLUS_HEADER: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-header'];
    const badges = p.badges.slice(0, 2).map(b => `«${b.label}»`).join(' · ');
    return `
WIDE LANDSCAPE 3:2 (970×600 target) Amazon A+ Content opening hero for «${form.nomeProduto}».

LAYOUT:
- LEFT 45% (cream #F8F4EE bg, no photo): bold sans-serif UPPERCASE headline navy #1F2A3A in 2-3 lines: «${p.headline.toUpperCase()}»
  Below: serif italic navy sub-headline 1-2 lines: «${p.sub}»
  Below: 2 small horizontal navy pill capsules with bold sans uppercase white labels: ${badges}
- RIGHT 55%: cinematic editorial photo of the product in luxury Brazilian residential setting (marble, linen, candles, brass, golden hour, shallow depth)

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-header'];
    const badges = p.badges.slice(0, 2).map(b => `«${b.label}»`).join(' · ');
    return `
WIDE LANDSCAPE 3:2 Amazon A+ hero for «${form.nomeProduto}».

LAYOUT:
- LEFT 45% (cream): bold sans UPPERCASE navy headline 2-3 lines: «${p.headline.toUpperCase()}»
  + serif italic navy sub: «${p.sub}»
  + 2 navy pills uppercase white: ${badges}
- RIGHT 55%: clean studio shot of product on cream backdrop, premium warm light

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-header'];
    const badges = p.badges.slice(0, 2).map(b => `«${b.label}»`).join(' · ');
    return `
WIDE LANDSCAPE 3:2 Amazon A+ hero for «${form.nomeProduto}».

LAYOUT:
- LEFT 45% (cream #F8F4EE): bold sans UPPERCASE navy 2-3 lines: «${p.headline.toUpperCase()}»
  + serif italic navy: «${p.sub}»
  + 2 navy uppercase white pills: ${badges}
- RIGHT 55%: editorial photo of product in warm residential scene (marble, linen, brass)

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_APLUS_ANTES_DEPOIS: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-antes-depois'];
    const features = p.features.slice(0, 4).map(f => `«${f}»`).join(', ');
    return `
WIDE LANDSCAPE 3:2 split-comparison for «${form.nomeProduto}».

LAYOUT — vertical 50/50:
- TOP THIN BAND (10%, cream #F8F4EE): 2 sans-serif UPPERCASE labels centered above each side, navy color: left side «ANTES», right side «DEPOIS»
- LEFT 50% (cool muted greyscale residential scene): grey silhouette/outline of generic product, no real product, desaturated palette
- RIGHT 50% (warm cream cinematic): featured «${form.nomeProduto}» with golden warm rim light. To the side: 4 lines stacked, each starts with green ✓ check icon + sans-serif navy text: ${features}

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-antes-depois'];
    const features = p.features.slice(0, 4).map(f => `«${f}»`).join(', ');
    return `
WIDE LANDSCAPE 3:2 split for «${form.nomeProduto}».

LAYOUT — vertical 50/50:
- TOP (10%): «ANTES» (left) and «DEPOIS» (right), sans uppercase navy
- LEFT (cool cream #E8E2D8): grey silhouette placeholder
- RIGHT (warm cream): clean product shot with 4 ✓ lines: ${features}

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-antes-depois'];
    const features = p.features.slice(0, 4).map(f => `«${f}»`).join(', ');
    return `
WIDE LANDSCAPE 3:2 split-comparison for «${form.nomeProduto}».

LAYOUT — 50/50:
- TOP BAND (10%, cream): «ANTES» left, «DEPOIS» right, sans UPPERCASE navy
- LEFT 50% cool muted, grey silhouette of generic product
- RIGHT 50% warm cinematic, hero «${form.nomeProduto}» + 4 ✓ lines: ${features}

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_APLUS_SPECS: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-specs'];
    const callouts = p.callouts.slice(0, 4).map(c => `«${c.titulo}: ${c.spec}»`).join(', ');
    return `
WIDE LANDSCAPE 3:2 spec reference for «${form.nomeProduto}».

LAYOUT:
- Background: warm cream gradient #F8F4EE → #EFE8DD
- TOP-CENTER: bold sans UPPERCASE navy headline: «ESPECIFICAÇÕES»
- CENTER: product photographed isolated, ~40% width, centered
- AROUND product: 4 callouts with thin navy line + small icon + sans-serif navy label: ${callouts}
- TOP-RIGHT corner: vertical ruler outline navy with «${p.altura}» label

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-specs'];
    const callouts = p.callouts.slice(0, 4).map(c => `«${c.titulo}: ${c.spec}»`).join(', ');
    return `
WIDE LANDSCAPE 3:2 specs for «${form.nomeProduto}».

LAYOUT:
- Cream backdrop, product centered
- TOP: bold sans UPPERCASE navy: «ESPECIFICAÇÕES»
- 4 callouts navy with icons: ${callouts}
- TOP-RIGHT: vertical ruler «${p.altura}»

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-specs'];
    const callouts = p.callouts.slice(0, 4).map(c => `«${c.titulo}: ${c.spec}»`).join(', ');
    return `
WIDE LANDSCAPE 3:2 specs for «${form.nomeProduto}».

LAYOUT:
- Warm cream gradient, product centered ~40% width
- TOP: bold sans UPPERCASE navy: «ESPECIFICAÇÕES»
- 4 callouts (thin navy line + icon + sans navy label): ${callouts}
- TOP-RIGHT: navy vertical ruler outline with «${p.altura}»

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_APLUS_CASOS_USO: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-casos-uso'];
    const usos = p.usos.slice(0, 4).map(u => `«${u.label.toUpperCase()}»`).join(' · ');
    return `
WIDE LANDSCAPE 3:2 use-cases for «${form.nomeProduto}».

LAYOUT:
- TOP BAND (15%, cream #F8F4EE): bold sans UPPERCASE navy headline centered: «IDEAL PARA»
- CENTER (70%): real residential moment featuring product naturally integrated (kitchen, dining, bath, living room — pick natural for category)
- BOTTOM BAND (15%, cream): 4 small circular gold #D4A876 icon badges (each with line-icon inside) lined up evenly, with bold sans UPPERCASE navy labels below each: ${usos}

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-casos-uso'];
    const usos = p.usos.slice(0, 4).map(u => `«${u.label.toUpperCase()}»`).join(' · ');
    return `
WIDE LANDSCAPE 3:2 use-cases for «${form.nomeProduto}».

LAYOUT:
- TOP (15%, cream): «IDEAL PARA» bold sans UPPERCASE navy
- CENTER (70%): clean product on cream/linen surface
- BOTTOM (15%, cream): 4 gold circular icon badges + uppercase navy labels: ${usos}

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-casos-uso'];
    const usos = p.usos.slice(0, 4).map(u => `«${u.label.toUpperCase()}»`).join(' · ');
    return `
WIDE LANDSCAPE 3:2 use-cases for «${form.nomeProduto}».

LAYOUT:
- TOP BAND (15%, cream): «IDEAL PARA» bold sans UPPERCASE navy centered
- CENTER (70%): residential moment with product integrated, warm light
- BOTTOM BAND (15%, cream): 4 gold #D4A876 circular icon badges with sans UPPERCASE navy labels below: ${usos}

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_APLUS_VALIDACAO: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-validacao'];
    const items = p.callouts.slice(0, 3).map(c => `«${c}»`).join(', ');
    return `
WIDE LANDSCAPE 3:2 trust/validation hero for «${form.nomeProduto}».

LAYOUT:
- LEFT 50%: hero shot of product on premium surface, warm rim light, shallow depth
- RIGHT 50% (cream #F8F4EE bg): bold sans UPPERCASE navy centered headline: «POR QUE CONFIAR»
  Below: 3 lines stacked, each with green ✓ check icon + sans navy text: ${items}
  Top-right corner of right side: gold #D4A876 octagonal badge «CURADO» / «AMALFI»

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-validacao'];
    const items = p.callouts.slice(0, 3).map(c => `«${c}»`).join(', ');
    return `
WIDE LANDSCAPE 3:2 validation for «${form.nomeProduto}».

LAYOUT:
- LEFT 50%: clean product shot
- RIGHT 50% (cream): «POR QUE CONFIAR» bold sans UPPERCASE navy + 3 ✓ lines: ${items}
  + gold octagonal seal «CURADO/AMALFI» top-right

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-validacao'];
    const items = p.callouts.slice(0, 3).map(c => `«${c}»`).join(', ');
    return `
WIDE LANDSCAPE 3:2 validation for «${form.nomeProduto}».

LAYOUT:
- LEFT 50%: hero product shot, warm rim light, shallow depth
- RIGHT 50% (cream #F8F4EE): bold sans UPPERCASE navy centered: «POR QUE CONFIAR»
  + 3 ✓ navy lines: ${items}
  + gold #D4A876 octagonal seal «CURADO» / «AMALFI» top-right corner

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_APLUS_CTA: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-cta'];
    const features = p.miniFeatures.slice(0, 3).map(f => `«${f}»`).join(' · ');
    return `
WIDE LANDSCAPE 3:2 closing CTA for «${form.nomeProduto}».

LAYOUT:
- LEFT 50%: closing-shot vibe of luxury hotel commercial (marble, brass, candle, linen, golden hour, very shallow depth) with product hero
- RIGHT 50% (cream #F8F4EE bg): bold sans UPPERCASE navy headline 2-3 lines centered: «${p.headline.toUpperCase()}»
  Below: serif italic navy sub-cta: «${p.subCta}»
  Below: 3 small horizontal navy pill capsules with bold sans uppercase white labels: ${features}

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-cta'];
    const features = p.miniFeatures.slice(0, 3).map(f => `«${f}»`).join(' · ');
    return `
WIDE LANDSCAPE 3:2 CTA for «${form.nomeProduto}».

LAYOUT:
- LEFT 50%: clean closing shot
- RIGHT 50% (cream): «${p.headline.toUpperCase()}» bold sans UPPERCASE navy 2-3 lines + serif italic navy sub: «${p.subCta}» + 3 navy pills uppercase white: ${features}

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-cta'];
    const features = p.miniFeatures.slice(0, 3).map(f => `«${f}»`).join(' · ');
    return `
WIDE LANDSCAPE 3:2 CTA closing for «${form.nomeProduto}».

LAYOUT:
- LEFT 50%: cinematic closing shot (marble, brass, candle, golden hour) with product hero
- RIGHT 50% (cream): bold sans UPPERCASE navy 2-3 lines: «${p.headline.toUpperCase()}»
  + serif italic navy sub: «${p.subCta}»
  + 3 navy uppercase white pills: ${features}

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_APLUS_PREMIUM: PromptByStyle = {
  lifestyle: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-premium'];
    const badges = p.badges.slice(0, 3).map(b => `«${b.label}»`).join(' · ');
    return `
ULTRA-WIDE LANDSCAPE ~2.4:1 (1464×600) magazine-spread for «${form.nomeProduto}».

LAYOUT:
- LEFT 35%: cinematic close-up of «${form.nomeProduto}» with cinematic warm rim light, shallow depth
- RIGHT 65% (cream #F8F4EE bg): bold sans UPPERCASE navy headline in 2 large lines: «${p.headline.toUpperCase()}»
  Below: serif italic navy sub-headline 1-2 lines: «${p.sub}»
  Below: 3 horizontal navy pill capsules side-by-side, bold sans UPPERCASE white labels: ${badges}

${productClause(form)}${tail()}`.trim();
  },
  infografico: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-premium'];
    const badges = p.badges.slice(0, 3).map(b => `«${b.label}»`).join(' · ');
    return `
ULTRA-WIDE LANDSCAPE ~2.4:1 hero for «${form.nomeProduto}».

LAYOUT:
- LEFT 35%: clean product on cream
- RIGHT 65% (cream): «${p.headline.toUpperCase()}» bold sans UPPERCASE navy + serif italic navy sub: «${p.sub}» + 3 navy pills white labels: ${badges}

${productClause(form)}${tail()}`.trim();
  },
  misto: ({ form, params }) => {
    const p = params as SlotParamsByKind['aplus-premium'];
    const badges = p.badges.slice(0, 3).map(b => `«${b.label}»`).join(' · ');
    return `
ULTRA-WIDE LANDSCAPE ~2.4:1 magazine spread for «${form.nomeProduto}».

LAYOUT:
- LEFT 35%: cinematic close-up product, warm rim light, shallow depth
- RIGHT 65% (cream #F8F4EE): bold sans UPPERCASE navy 2 lines: «${p.headline.toUpperCase()}»
  + serif italic navy sub 1-2 lines: «${p.sub}»
  + 3 horizontal navy pill capsules sans UPPERCASE white: ${badges}

${productClause(form)}${tail()}`.trim();
  },
};

const PROMPT_APLUS_COMPARISON: PromptByStyle = {
  lifestyle: ({ form }) => `
TINY SQUARE 1:1 (220×220) Amazon Comparison Chart thumbnail for «${form.nomeProduto}».

LAYOUT:
- Smooth neutral cream backdrop #F8F4EE
- Product perfectly centered, ~85% of frame
- Clean studio lighting, subtle warm tone

NO TEXT anywhere. Optimized to read clearly at small size.

${productClause(form)}${tail()}`.trim(),
  infografico: ({ form }) => `
TINY SQUARE 1:1 (220×220) thumbnail for «${form.nomeProduto}».

LAYOUT:
- Cream backdrop #F8F4EE
- Product centered ~85% of frame
- Clean studio lighting

NO TEXT.

${productClause(form)}${tail()}`.trim(),
  misto: ({ form }) => `
TINY SQUARE 1:1 (220×220) thumbnail for «${form.nomeProduto}».

LAYOUT:
- Cream backdrop, product centered ~85%, soft premium light

NO TEXT.

${productClause(form)}${tail()}`.trim(),
};

// ============================================================================
// MAPEAMENTO PRINCIPAL
// ============================================================================

const PROMPTS_BY_SLOT: Record<SlotKind, PromptByStyle> = {
  'anuncio-capa': PROMPT_ANUNCIO_CAPA,
  'anuncio-dimensoes': PROMPT_ANUNCIO_DIMENSOES,
  'anuncio-lifestyle-callouts': PROMPT_ANUNCIO_LIFESTYLE_CALLOUTS,
  'anuncio-comparativo': PROMPT_ANUNCIO_COMPARATIVO,
  'anuncio-aspiracional': PROMPT_ANUNCIO_ASPIRACIONAL,
  'anuncio-beneficios': PROMPT_ANUNCIO_BENEFICIOS,
  'anuncio-prova-final': PROMPT_ANUNCIO_PROVA_FINAL,
  'aplus-header': PROMPT_APLUS_HEADER,
  'aplus-antes-depois': PROMPT_APLUS_ANTES_DEPOIS,
  'aplus-specs': PROMPT_APLUS_SPECS,
  'aplus-casos-uso': PROMPT_APLUS_CASOS_USO,
  'aplus-validacao': PROMPT_APLUS_VALIDACAO,
  'aplus-cta': PROMPT_APLUS_CTA,
  'aplus-premium': PROMPT_APLUS_PREMIUM,
  'aplus-comparison': PROMPT_APLUS_COMPARISON,
};

/**
 * API pública: prompt OpenAI pra slot+estilo+contexto.
 * V5 (Gumpinho-style): gpt-image-1 desenha layout + texto + tudo no pixel.
 */
export function promptForSlotOpenAI(
  slot: SlotKind,
  form: CriacaoForm,
  params: SlotParamsByKind[SlotKind],
  estilo: EstiloImagem = 'misto',
  visualSpec?: string,
): string {
  const builder = PROMPTS_BY_SLOT[slot];
  const styleBuilder = builder[estilo] ?? builder['misto'];
  return styleBuilder({ form, params, visualSpec, estilo });
}
