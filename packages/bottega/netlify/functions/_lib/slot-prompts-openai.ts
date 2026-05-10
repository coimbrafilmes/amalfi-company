/**
 * Slot prompts V4 (Filosofia C) — gpt-image-1 entrega CENA PURA, sem texto.
 *
 * Mudança vs V3 (Bloco L):
 *   V3 pedia: cena + texto + layout no prompt (gpt-image-1 desenhava texto
 *             diretamente, mas alucinava palavras em PT-BR e o composer SVG
 *             acabava sobrepondo texto duplicado).
 *
 *   V4 pede: cena fotográfica/cinematográfica PURA, com áreas estratégicas
 *            preservadas pra composer SVG pintar texto/pills/selo depois.
 *            ZERO TEXTO no prompt → ZERO ALUCINAÇÃO de português.
 *
 * Cada slot tem 3 versões de prompt (lifestyle / infografico / misto).
 * Pipeline V4 escolhe a versão baseada em estiloAnuncio/estiloAplus do form.
 *
 * Composer SVG (composer/slots/*.ts) então aplica overlays perfeitos:
 * headlines, pills, labels, selo CURADO AMALFI — texto sempre correto e
 * tipografia consistente.
 */

import type {
  CriacaoForm,
  EstiloImagem,
  SlotKind,
} from '../../../src/types/anuncio';
import type { SlotParamsByKind } from './composer/types';

// ============================================================================
// ANCHORS — instrução compartilhada por todos os prompts
// ============================================================================

const PALETTE_ANCHOR = `Color palette: warm cream osso #F8F4EE, deep navy #1F2A3A, gold ocre #D4A876, terracotta accent #C47855. Avoid cool/blue tones unless explicitly part of the product itself.`;

const LIGHTING_ANCHOR = `Lighting: cinematic warm golden-hour ambient, soft three-point studio for product clarity, shallow depth of field on backgrounds, gentle natural shadows.`;

const QUALITY_ANCHOR = `Premium magazine-quality output. Sharp focus on product, photographic realism. Mood: serene, sophisticated, Architectural Digest / Conde Nast Traveler / Aman Resort visual reference.`;

const NO_BRAND_ANCHOR = `Do NOT include any brand logos, store names, third-party product brands, or words like "Amazon", "Mercado Livre", "Shopee" anywhere.`;

/**
 * ⚠️ ANTI-TEXT é a regra MAIS IMPORTANTE da V4. gpt-image-1 alucina texto
 * em PT-BR (vira "Viclra" ao invés de "Vidro", "Britho" ao invés de "Brilho",
 * "Capsoidaçe" ao invés de "Capacidade"). Composer SVG renderiza tudo de
 * texto depois, com tipografia perfeita. Modelo NÃO pode escrever nada.
 */
const ANTI_TEXT_ANCHOR = `STRICT RULE — NO TEXT IN THE IMAGE: do not draw, render, embed, write, paint, etch, or include ANY text, letters, words, numbers, captions, labels, headlines, sub-headlines, pills, badges with text, watermarks, logos with text, signage with text, book titles, product packaging text, or any typographic element of any kind. The image must be PURELY VISUAL. Typography is added separately in post-production. If you would normally include text or labels, leave that area blank or use abstract visual elements instead (icons without text, shapes, patterns, geometric elements).`;

// ============================================================================
// HELPERS
// ============================================================================

/** Anchor block que vai no fim de TODO prompt. */
function tailAnchors(): string {
  return `

${ANTI_TEXT_ANCHOR}
${NO_BRAND_ANCHOR}
${PALETTE_ANCHOR}
${LIGHTING_ANCHOR}
${QUALITY_ANCHOR}`;
}

/** Descrição do produto pra prompt. */
function productClause(form: CriacaoForm, visualSpec?: string): string {
  const hasRefs = (form.fotosBase64?.length ?? 0) > 0;
  const refClause = hasRefs
    ? `USE THE PROVIDED REFERENCE PHOTOS to render the product faithfully — same shape, color, material, finish, proportions.`
    : `Product to render: "${form.nomeProduto}".`;
  const specPart = visualSpec
    ? `\n\nProduct visual fidelity (must match exactly):\n${visualSpec}`
    : '';
  return `${refClause}${specPart}`;
}

// ============================================================================
// PROMPTS POR SLOT × ESTILO (3 versões cada)
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
  lifestyle: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) Amazon BR main listing cover image for "${form.nomeProduto}".

Setting: Pure white background (#FFFFFF), product perfectly centered occupying about 75-80% of the frame, soft three-point studio lighting, subtle ground shadow only. Slight 3/4 camera angle showing depth without distortion. NO props besides the product. NO scene elements.

This is the Amazon main listing image (REQUIRED to comply with Amazon's main image rules: pure white background, product only).

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) Amazon BR main listing cover image for "${form.nomeProduto}".

Setting: Pure white background (#FFFFFF), product perfectly centered occupying about 80% of the frame, soft three-point studio lighting, subtle ground shadow. Camera: 3/4 view that maximizes product silhouette legibility. NO props.

Compliant with Amazon main image rules.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) Amazon BR main listing cover image for "${form.nomeProduto}".

Setting: Pure white background (#FFFFFF), product perfectly centered occupying about 78% of the frame, three-point studio lighting with subtle warm rim light for premium feel. Slight 3/4 camera angle. NO props besides the product.

Compliant with Amazon main image rules.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_ANUNCIO_DIMENSOES: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) editorial product photograph of "${form.nomeProduto}" for an Amazon BR specifications display.

Setting: cream studio backdrop (#F8F4EE) with smooth gradient. Product centered, isolated, occupying ~60% of the frame, photographed from a clean 3/4 angle. Soft diffused omnidirectional lighting, gentle ground shadow. Generous empty cream space on top, right, and bottom (these areas will receive specs callouts in post-production — leave them VISUALLY CLEAN, no objects, no text, no distractions).

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) technical product photograph of "${form.nomeProduto}" for an Amazon BR spec sheet.

Setting: smooth neutral cream gradient backdrop (#F8F4EE → #EFE8DD), product perfectly centered occupying ~55-60% of the frame, photographed from a clean front-3/4 angle that shows scale clearly. Soft omnidirectional studio lighting, minimal subtle ground shadow. The image MUST have generous empty cream space on the top 12%, right 30%, left 25%, and bottom 10% — these areas will receive measurement rulers, callout lines, and labels in post-production. Keep these areas VISUALLY EMPTY (just clean cream gradient, no objects, no text, no shadows, no distractions).

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) editorial-technical photograph of "${form.nomeProduto}" for an Amazon BR specs display.

Setting: cream gradient backdrop (#F8F4EE → #EFE8DD), product centered occupying ~58% of the frame, clean 3/4 angle. Soft warm studio lighting with gentle rim light, subtle ground shadow. Generous empty cream space on all sides (top 12%, right 28%, left 22%, bottom 10%) — these areas receive callouts in post-production. Keep them VISUALLY EMPTY.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_ANUNCIO_LIFESTYLE_CALLOUTS: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) cinematic editorial lifestyle photograph for "${form.nomeProduto}".

Setting: luxury Brazilian residential interior — boutique hotel suite, Architectural Digest spread style. Marble surfaces, walnut wood, brass accents, warm golden-hour ambient light streaming through linen curtains in the background, shallow depth of field. The product is the visual hero — confidently placed in the center of the frame at table-height, with cinematic rim lighting. A human hand may appear interacting with the product (tasteful, editorial, never distracting). Keep top 15% and bottom 18% of the frame visually clean (these become bands for headline + 3 pills in post-production — no objects, no patterns there, just soft out-of-focus background).

Mood: Veuve Clicquot ad / Aman Resort vibe. Premium, serene, aspirational.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) clean editorial photograph of "${form.nomeProduto}" for an Amazon BR feature display.

Setting: minimalist neutral residential surface (light walnut tabletop with cream linen runner, soft shallow background blur). Product centered, photographed clearly with subtle premium lighting. Top 15% and bottom 18% of the frame must be VISUALLY EMPTY (clean blurred background) — these become headline + pill bands in post-production.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) cinematic editorial photograph for "${form.nomeProduto}".

Setting: luxury Brazilian residential context — marble countertop, linen runner, brass details, eucalyptus stem, warm light. Product centered as visual hero with cinematic rim lighting, shallow depth of field. Top 15% and bottom 18% of the frame visually empty (soft out-of-focus background only) for post-production text bands.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_ANUNCIO_COMPARATIVO: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) editorial side-by-side composition for "${form.nomeProduto}".

Composition: vertically split 40/60 (no harsh divider, just slight tonal contrast). LEFT 40%: muted sand-cream background (#E8DFD2), abstract grey silhouette/shadow of a generic product (no real product, just a soft greyscale outline shape). RIGHT 60%: hero shot of the actual ${form.nomeProduto} on a premium surface (white marble or walnut), with warm cinematic golden lighting and shallow depth of field. The right side feels alive, premium, editorial; the left feels muted and forgettable. Keep top 8% empty (post-production headline band).

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) split-comparison composition for "${form.nomeProduto}".

Composition: vertically split 40/60. LEFT 40%: muted sand-cream background (#E8DFD2), abstract grey silhouette placeholder of a generic product (no real product, just a flat grey outline shape). Top of left side has empty space for a "common" pill label (post-production). RIGHT 60%: clean studio shot of the actual ${form.nomeProduto} on cream backdrop, photographed with clear premium lighting (slight warm rim). Right side has empty band on top for a "curated" pill label and side strip for checkmarks (post-production). Keep top 8% of full frame empty for headline band.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) editorial split-comparison for "${form.nomeProduto}".

Composition: 40/60 vertical split. LEFT 40%: muted sand-cream (#E8DFD2) with grey silhouette of generic product (flat outline only). RIGHT 60%: hero ${form.nomeProduto} on premium marble/walnut, warm cinematic light, shallow DOF. Top 8% of frame empty for headline band; left/right each have empty top bands for pill labels (post-production).

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_ANUNCIO_ASPIRACIONAL: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) cinematic aspirational lifestyle photograph for "${form.nomeProduto}".

Setting: luxury Brazilian residential moment — Mediterranean villa terrace, boutique hotel spa, designer's home interior (pick most natural for product category). Scene elements: white marble surfaces, lit beeswax candles in brass holders, folded linen towels, eucalyptus stems, soft warm golden light through linen curtains, shallow depth of field on background. The product is integrated naturally as a hero element with cinematic rim lighting — viewer should feel "I want to BE in this scene".

Mood: Aman Resort / Veuve Clicquot ad / Conde Nast Traveler magazine cover. Aspirational, serene, slow-luxury.

Keep bottom 22% of the frame visually empty (blurred warm bokeh background only) for headline + sub-bullets in post-production.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) editorial product moment photograph for "${form.nomeProduto}".

Setting: clean premium residential context — soft linen background, warm side lighting, product clearly visible as the focal point. Composition leaves bottom 25% of the frame visually empty (warm out-of-focus bokeh) for post-production text band with key benefits.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) cinematic aspirational photograph for "${form.nomeProduto}".

Setting: luxury residential moment — marble, linen, candles, brass, eucalyptus. Warm golden light, shallow depth of field. Product as hero with cinematic rim lighting. Bottom 22% of frame visually empty (blurred bokeh) for headline + bullets in post.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_ANUNCIO_BENEFICIOS: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) editorial lifestyle photograph for "${form.nomeProduto}" featuring everyday-luxe context.

Setting: real residential everyday moment — kitchen countertop, dining table, bathroom vanity, living room shelf (pick most natural). Marble or warm walnut surface, soft natural window light, subtle styling (cup of espresso, folded linen, one fresh flower stem) — NEVER over-styled. Product is naturally integrated as part of the scene, not a stiff product shot. Composition: split 50/50 horizontally — TOP 50% has the product hero shot with cinematic warm light; BOTTOM 50% has clean blurred background continuation (post-production text band).

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) clean editorial product photograph for "${form.nomeProduto}".

Setting: warm linen surface backdrop, product centered in top half (~55% from top), clean premium lighting. Bottom 50% of frame visually empty (smooth tonal cream gradient) for post-production benefits list. NO clutter, NO text, NO objects in bottom half.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) editorial photograph for "${form.nomeProduto}".

Composition: TOP 50% — product hero with warm rim light against minimalist residential context (marble, linen, brass accents); BOTTOM 50% — empty smooth tonal cream gradient continuation for post-production benefits text.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_ANUNCIO_PROVA_FINAL: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) magazine-cover-style hero photograph for "${form.nomeProduto}".

Setting: dramatic editorial close-up of the product as a fashion-magazine cover would feature it. Slight low-angle, very shallow depth of field, premium materials around (marble, brass, velvet) but blurred to focus attention on the product. Cinematic warm light with strong rim light defining the product silhouette. Vibe: Conde Nast Traveler cover / Architectural Digest centerfold. The product is presented as a desirable object — not just a product, but an aspiration.

Keep top 18% empty (warm bokeh) for post-production headline + selo CURADO AMALFI badge.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) hero product photograph for "${form.nomeProduto}".

Setting: clean premium close-up shot, product as the absolute focal point on a smooth neutral cream gradient. Slight low-angle for authority, sharp focus, strong rim lighting that defines silhouette. Top 18% visually empty (smooth gradient continuation) for post-production headline + badge.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a SQUARE (1:1) magazine-cover hero shot for "${form.nomeProduto}".

Setting: dramatic editorial close-up, slight low-angle, very shallow depth of field, premium materials blurred in background (marble, brass). Cinematic warm rim light. Top 18% empty for post-production text + badge.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

// --- A+ CONTENT ---

const PROMPT_APLUS_HEADER: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2 landscape, 970×600 target) editorial opening hero spread for "${form.nomeProduto}", in the style of a Conde Nast Traveler opening spread.

Composition: product positioned in the LEFT 40% of the frame as visual hero, in a luxury Brazilian residential setting (marble counter, linen, candles, brass accents, eucalyptus, warm golden light, very shallow depth of field). RIGHT 60% of frame: warm soft blurred bokeh background only — NO objects, NO text, NO distractions (this becomes the post-production text panel).

Mood: opening spread of a luxury hotel feature article. Aspirational, serene, premium.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) clean product hero for "${form.nomeProduto}".

Composition: product in LEFT 40% of frame on cream backdrop with soft premium lighting. RIGHT 60% of frame: smooth tonal cream gradient (post-production text panel) — completely empty.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) editorial hero spread for "${form.nomeProduto}".

Composition: product in LEFT 40% with warm cinematic light against minimalist residential context. RIGHT 60%: warm blurred bokeh background empty for post-production text.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_APLUS_ANTES_DEPOIS: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) editorial split composition for "${form.nomeProduto}".

Composition: vertically split 50/50 (no harsh line). LEFT 50%: muted desaturated residential scene — generic product placeholder (greyscale silhouette only, no real product), cool tonal palette, slightly under-exposed. RIGHT 50%: same residential context but warm, golden, cinematic — featuring the actual ${form.nomeProduto} as hero with rim light. Visual contrast: dull/cool vs warm/alive.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) split-comparison composition for "${form.nomeProduto}".

Composition: vertically split 50/50. LEFT 50%: cool tonal cream backdrop (#E8E2D8) with abstract grey silhouette of generic product (flat outline only). RIGHT 50%: warm cream backdrop (#F8F4EE) with the actual ${form.nomeProduto} clearly photographed with warm premium lighting. Top thin band of frame empty for post-production "antes" / "depois" labels.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) split composition for "${form.nomeProduto}".

50/50 vertical split: LEFT cool muted with grey silhouette placeholder; RIGHT warm cinematic with hero ${form.nomeProduto}.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_APLUS_SPECS: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) editorial product photograph for "${form.nomeProduto}" for a specs reference panel.

Composition: product in CENTER of frame on warm cream backdrop, photographed with subtle warm premium lighting. Surrounding the product: generous empty cream space on all sides (top 15%, left 25%, right 30%, bottom 15%) — these areas will receive technical callouts in post-production. Keep visually empty.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) technical product photograph for "${form.nomeProduto}".

Composition: product centered on cream gradient backdrop (#F8F4EE → #EFE8DD), clean front-3/4 angle, soft omnidirectional studio lighting, subtle ground shadow. Generous empty space on all four sides (top 15%, left 28%, right 32%, bottom 12%) for post-production callouts and rulers — completely visually empty.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) editorial-technical photograph for "${form.nomeProduto}".

Product centered on cream backdrop with warm rim light, generous empty cream space on all sides for post-production specs callouts.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_APLUS_CASOS_USO: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) editorial use-case photograph for "${form.nomeProduto}".

Composition: a real residential moment featuring the product naturally integrated into a daily-life scene (depending on category: morning coffee on marble counter, dinner setting, bathroom self-care, living room shelf, kitchen prep). Multiple soft scene elements (1-2 props) but never cluttered. Warm natural light, shallow depth of field. Product clearly visible as part of the scene but not the only focus — feels lived-in.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) clean residential product photograph for "${form.nomeProduto}".

Composition: product on a clean residential surface (linen runner, light walnut, marble) with minimal scene elements, soft warm light, premium feel. Generous empty space on top 15% and bottom 15% for post-production text bands.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) editorial use-case for "${form.nomeProduto}".

Real residential moment with product naturally integrated. Marble or linen surface, soft warm light, 1-2 subtle props. Top 15% and bottom 15% empty for post-production text.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_APLUS_VALIDACAO: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) hero validation shot for "${form.nomeProduto}".

Composition: product as visual hero against a luxury blurred residential background (marble, brass, soft warm light). Strong rim lighting defines the product silhouette. Top 15% and right 30% of frame empty (warm blurred bokeh) for post-production badges and stars.

Mood: trust, authority, premium curation.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) clean validation shot for "${form.nomeProduto}".

Composition: product as hero on cream gradient backdrop with warm premium rim light. Top 15% and right 30% empty (smooth gradient continuation) for post-production badge area.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) hero validation shot for "${form.nomeProduto}".

Product as hero with warm rim lighting against luxury blurred residential context. Top 15% and right 30% empty for post-production badges.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_APLUS_CTA: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) closing-frame cinematic photograph for "${form.nomeProduto}".

Composition: closing-shot vibe of a luxury hotel commercial — product elegantly placed in residential setting (marble surface, brass accent, candle, fresh linen), warm golden hour ambient, very shallow depth of field. Product is hero with cinematic rim light. Center frame around the product, leave empty cream-blurred areas on top 15% and bottom 25% for post-production headline and CTA button.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) clean closing shot for "${form.nomeProduto}".

Composition: product centered on warm cream gradient backdrop with premium lighting. Top 15% and bottom 25% of frame empty for post-production headline and CTA button.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a horizontal LANDSCAPE (3:2) closing-frame cinematic shot for "${form.nomeProduto}".

Product as hero in luxury residential setting with warm rim light. Top 15% and bottom 25% empty for post-production text.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_APLUS_PREMIUM: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate an ULTRA-WIDE LANDSCAPE (~2.4:1, 1464×600 target) magazine-spread cinematic photograph for "${form.nomeProduto}".

Composition: cinematic wide shot like a magazine centerfold or hotel commercial opening. Product positioned in the LEFT THIRD of the frame as visual hero with cinematic warm rim light, shallow depth of field. Right two-thirds: luxury blurred residential context (marble, brass, lit candles, linen, fresh herbs/eucalyptus, warm golden ambient). Mood: Conde Nast Traveler editorial spread, Aman Resort opening shot.

Right two-thirds visually open (warm blurred bokeh) for post-production large headline overlay.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate an ULTRA-WIDE LANDSCAPE (~2.4:1) clean hero shot for "${form.nomeProduto}".

Composition: product in LEFT THIRD on smooth cream gradient with warm premium lighting. Right two-thirds: smooth tonal continuation (empty) for post-production headline.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate an ULTRA-WIDE LANDSCAPE (~2.4:1) cinematic hero for "${form.nomeProduto}".

Product in LEFT THIRD with cinematic warm rim light, right two-thirds blurred warm residential context for post-production text.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

const PROMPT_APLUS_COMPARISON: PromptByStyle = {
  lifestyle: ({ form, visualSpec }) => `
Generate a SMALL SQUARE (1:1, 220×220 target) tight close-up product photograph of "${form.nomeProduto}".

Composition: product perfectly centered, occupying ~85% of the tiny frame, on smooth neutral cream backdrop, soft premium lighting, subtle warm tone. This is a thumbnail for Amazon Comparison Charts — must read clearly at small size.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  infografico: ({ form, visualSpec }) => `
Generate a SMALL SQUARE (1:1, 220×220 target) clean product thumbnail for "${form.nomeProduto}".

Composition: product centered, ~85% of frame, on cream backdrop with clean studio lighting. Reads clearly at small size for Amazon Comparison Chart.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),

  misto: ({ form, visualSpec }) => `
Generate a SMALL SQUARE (1:1, 220×220 target) product thumbnail for "${form.nomeProduto}".

Product centered, ~85% of frame, cream backdrop, soft premium lighting. Amazon Comparison Chart thumbnail.

${productClause(form, visualSpec)}
${tailAnchors()}`.trim(),
};

// ============================================================================
// MAPEAMENTO PRINCIPAL — slot → 3 prompts por estilo
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
 * API pública: retorna o prompt OpenAI pra um slot+estilo+contexto.
 *
 * @param slot Qual template de slot
 * @param form Dados do produto (nome, fotos, etc)
 * @param params Parâmetros derivados pra esse slot (extractSlotParams output)
 * @param estilo Estilo escolhido pelo user (lifestyle/infografico/misto)
 * @param visualSpec Spec extraída das fotos refs (se houver)
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
