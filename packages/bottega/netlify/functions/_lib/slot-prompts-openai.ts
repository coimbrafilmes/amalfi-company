/**
 * Slot prompts otimizados pra gpt-image-1 (Bloco L).
 *
 * Diferença pro slot-prompts.ts (Gemini):
 *   - Gemini Image: pede só foto fotorrealista (texto vai por SVG overlay)
 *   - gpt-image-1: pede TUDO no prompt — texto embedded + layout + composição
 *
 * gpt-image-1 é especializado em INFOGRÁFICO de e-commerce (estilo Gumpinho).
 * Os prompts aqui descrevem o slot inteiro como design — texto exato, cores,
 * posicionamento, hierarquia.
 *
 * Não exclui o composer SVG. Quando APPLY_COMPOSER=true (default), Sharp+SVG
 * ainda aplica overlays como camada de segurança/refino. Quando false, deixa
 * só o output puro do gpt-image-1.
 */

import type {
  CriacaoForm,
  SlotKind,
} from '../../../src/types/anuncio';
import type { SlotParamsByKind } from './composer/types';

const VOICE_ANCHOR = `Style guide: serene, curated, premium-but-not-shouty, Brazilian residential context. Editorial sophistication like Architectural Digest or Conde Nast Traveler — not stock photo. Color palette warm and rich (deep navy #1F2A3A, cream osso #F8F4EE, gold ocre #D4A876, terracotta accent #C47855).`;

const NO_BRAND_ANCHOR = `Do NOT include any brand logos, store names, product brands of third parties, or text like "Amazon", "Mercado Livre", "Shopee" anywhere.`;

const QUALITY_ANCHOR = `Premium magazine-quality output. Sharp focus on product, photographic realism for product shot, clean editorial design for layout/text. Cinematic warm lighting, shallow depth of field on background.`;

/**
 * Helper: descreve fotos de referência no prompt quando elas existem.
 * gpt-image-1 com images.edit recebe as fotos como input separado, mas
 * referenciar elas no prompt ajuda o modelo a entender o que usar.
 */
function fidelityClause(form: CriacaoForm, visualSpec?: string): string {
  const hasRefs = (form.fotosBase64?.length ?? 0) > 0;
  const specPart = visualSpec
    ? `\n\nProduct fidelity (must match exactly):\n${visualSpec}`
    : '';
  if (hasRefs) {
    return `\n\nUSE THE PROVIDED REFERENCE PHOTOS to render the product faithfully — same shape, color, material, finish.${specPart}`;
  }
  return specPart;
}

const PROMPTS: Record<SlotKind, (ctx: { form: CriacaoForm; params: SlotParamsByKind[SlotKind]; visualSpec?: string }) => string> = {
  // ============================================================
  // ANÚNCIO (1024×1024 input → Sharp upscale → 2000×2000 final)
  // ============================================================

  'anuncio-capa': ({ form, visualSpec }) => `
Generate a SQUARE (1:1) Amazon BR product cover image of "${form.nomeProduto}".

Layout: Pure white background (#FFFFFF), product perfectly centered occupying about 80% of the frame, soft three-point studio lighting with no harsh shadows.

NO TEXT anywhere. NO overlays. NO watermarks. NO props besides the product itself. Camera angle: slight 3/4 view that shows depth without distortion.

This is the Amazon main listing cover — must be visually identical to top-tier catalog photography (compliant with Amazon main image rules).
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-dimensoes': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['anuncio-dimensoes'];
    const cotaLines = p.cotas.length > 0
      ? p.cotas.map((c) => `${c.axis === 'altura' ? 'Altura' : c.axis === 'largura' ? 'Largura' : 'Profundidade'}: ${c.value}`).join(', ')
      : `Material: ${p.material ?? 'Premium'}${p.cor ? `, Cor: ${p.cor}` : ''}${p.capacidade ? `, Capacidade: ${p.capacidade}` : ''}`;

    return `
Generate a SQUARE (1:1) Amazon spec-sheet infographic for "${form.nomeProduto}".

Layout — clean editorial spec sheet style (like a Conde Nast product feature):
- Top banner (10% height): bold dark navy headline text "Especificações Técnicas" centered, sans-serif (Inter Bold or similar), color #1F2A3A on cream #F8F4EE background
- Center area (75% height): the product photographed isolated on a smooth neutral light cream gradient backdrop (#F8F4EE to #EFE8DD), soft diffused omnidirectional lighting, gentle ground shadow only
- Vertical ruler on the right side: thin navy outline rectangle with tick marks and arrow heads top/bottom, with the label "${p.cotas.find(c => c.axis === 'altura')?.value ?? p.capacidade ?? p.cotas[0]?.value ?? ''}" in the middle (sans-serif)
- Left side callouts: thin navy lines pointing from the product to text labels: ${cotaLines}
- Bottom banner (8% height): "${p.footerLabel}" in clean sans-serif, centered

Background must be NEUTRAL studio — NO marble, NO countertop, NO lifestyle scene. This is a technical reference image.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'anuncio-lifestyle-callouts': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['anuncio-lifestyle-callouts'];
    const calloutsList = p.callouts.map((c, i) => `Pill ${i + 1}: "${c.label}"`).join(', ');
    return `
Generate a SQUARE (1:1) Amazon BR lifestyle infographic for "${form.nomeProduto}".

Layout (3 horizontal bands):
- TOP BAND (15% height, full width): bold sans-serif headline "${p.headline}" centered in dark navy #1F2A3A on cream #F8F4EE background. Top-right corner: small octagonal gold seal (#D4A876) with "CURADO AMALFI" in 2 lines uppercase.
- CENTER (67% height): cinematic editorial lifestyle photo of the product in a luxury Brazilian residential setting (boutique hotel suite, Architectural Digest spread, golden hour warm light, marble + walnut + brass accents, shallow depth of field, product is hero with cinematic rim light)
- BOTTOM BAND (18% height, full width): 3 horizontal pill-shaped buttons side by side, evenly spaced, each pill has white #F8F4EE background with thin navy border (1.5px), containing one small line-icon and a sans-serif bold label. The 3 pills (left to right): ${calloutsList}.

Style: editorial Amazon BR top-seller infographic, premium magazine quality. Mood: serene, sophisticated, Veuve Clicquot ad / Aman Resort vibe.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'anuncio-comparativo': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['anuncio-comparativo'];
    const bulletsList = p.bullets.map((b, i) => `${i + 1}. "${b}"`).join('; ');
    return `
Generate a SQUARE (1:1) Amazon BR comparison infographic for "${form.nomeProduto}".

Layout — split 40/60:
- TOP BAND (8% height): bold sans-serif headline "O Investimento Certo" centered in navy #1F2A3A
- LEFT 40% (background sand color #E8DFD2, rounded corners): label pill "Comum" at top in dark navy capsule with cream text. Below: abstract grey silhouette placeholder of a generic product. Below: 3 red ✗ marks with labels: 1. "Qualidade comum"; 2. "Sem destaque"; 3. "Sem curadoria" — sans-serif, navy text
- RIGHT 60%: hero shot of the actual ${form.nomeProduto} on a premium surface (marble/walnut), warm cinematic lighting, shallow DOF. Top of this side: gold #D4A876 pill "Curadoria Amalfi". Over the right side: 4 green ✓ checkmarks with labels: ${bulletsList}; 4. "Curadoria Amalfi"

Style: side-by-side comparison like Architectural Digest "good vs bad" feature. Premium, editorial, clear visual hierarchy.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'anuncio-aspiracional': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['anuncio-aspiracional'];
    const bulletsList = p.subBullets.map((b, i) => `${i + 1}. "${b}"`).join('; ');
    return `
Generate a SQUARE (1:1) Amazon BR aspirational lifestyle image for "${form.nomeProduto}".

Layout:
- Cinematic aspirational scene: ${form.nomeProduto} integrated into a luxury Brazilian residential moment (Mediterranean villa, boutique hotel spa, designer's home — pick most natural for product category). Setting elements: white marble, eucalyptus, lit beeswax candles, folded linen towels, brass accents. Veuve Clicquot ad / Aman Resort visual reference.
- TOP-LEFT: large serif italic headline overlay "${p.headline}" in deep navy #1F2A3A or warm gold #D4A876, set in DM Serif Display or similar editorial serif. Headline can be 1-2 lines.
- Below headline: 3 small bullet points with terracotta dot prefix, italic serif text: ${bulletsList}.

Mood: serene, transformative, magazine cover feel. Not literal product showcase — it's emotional aspiration. Product visible but scene is the star.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'anuncio-beneficios': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['anuncio-beneficios'];
    const headlineParts = p.headline.split(' e ');
    const line1 = headlineParts[0] ?? p.headline;
    const line2 = headlineParts[1] ?? '';
    const bulletsList = p.bullets.map((b, i) => `${i + 1}. "${b}"`).join('; ');
    return `
Generate a SQUARE (1:1) Amazon BR everyday-luxe lifestyle infographic for "${form.nomeProduto}".

Layout:
- Top-left area: bold sans-serif headline in deep navy #1F2A3A, 2 lines: "${line1}${line2 ? ` e\n${line2}` : ''}" in Inter Bold or similar
- Below headline: 3 bullet points with gold dot prefix, sans-serif text: ${bulletsList}.
- Center-right: editorial photo of ${form.nomeProduto} in a curated Brazilian residential setting (premium materials — marble, walnut, brass — warm afternoon light streaming in). Saint Laurent home spread vibe.

Style: cinematic everyday-luxe — not stock photo, magazine quality. Product confidently placed, surroundings are premium.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'anuncio-prova-final': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['anuncio-prova-final'];
    const tagsList = p.tags.map((t, i) => `${i + 1}. "${t.label}"`).join('; ');
    return `
Generate a SQUARE (1:1) Amazon BR hero close-up portrait of "${form.nomeProduto}".

Layout:
- Hero shot of the product, magazine cover-style — dramatic, confident, central composition. Material details visible (brushed metal, etched glass, polished surface). Background: rich blurred mood (marble bathroom, walnut counter, dark velvet) — pure mood, no distracting elements.
- Two small elegant rectangular tags floating beside the product, one on left margin and one on right margin (about 25% from edges), each with a tiny line-icon and gold #D4A876 accent. Tags: ${tagsList}.

Style: editorial luxury close-up. Aman Resort / Eichholtz showroom vibe. NO large headlines — the product is the headline.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  // ============================================================
  // A+ Standard (970×600 — pedimos 1536×1024 e Sharp redimensiona)
  // ============================================================

  'aplus-header': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['aplus-header'];
    const badgesList = p.badges.map((b) => `"${b.label}"`).join(', ');
    return `
Generate a WIDE LANDSCAPE (3:2 aspect, will be cropped to 970×600) Amazon A+ hero header for "${form.nomeProduto}".

Layout:
- Cinematic editorial hero shot — Conde Nast Traveler opening spread feel
- Product on RIGHT THIRD of frame, lit dramatically with rim light
- LEFT TWO-THIRDS: bold serif headline "${p.headline}" in 2 lines (DM Serif Display, deep navy #1F2A3A) + below it italic Cormorant sub "${p.sub}" in opacity-65 navy
- Below sub: 2 horizontal pill tags with line-icon + label, white background with thin navy border: ${badgesList}
- Top-right corner: small octagonal gold #D4A876 seal "CURADO AMALFI" 2 lines

Setting: luxury hotel suite, marble + walnut + brass, warm twilight light, shallow DOF.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'aplus-antes-depois': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['aplus-antes-depois'];
    const features = p.features.map((f, i) => `${i + 1}. ✓ "${f}"`).join('; ');
    return `
Generate a WIDE LANDSCAPE (3:2 aspect → 970×600) split-frame BEFORE/AFTER comparison for "${form.nomeProduto}".

Layout — split 50/50 vertical with sharp white divider line in middle:
- LEFT HALF: desaturated B&W cluttered ordinary residential scene (cluttered counter with plain plastic items, no warmth, mundane lighting). Top of left half: bold sans-serif "Antes:" then below "Caos Visual" in 2 lines, white #F8F4EE color, 38pt
- RIGHT HALF: pristine warm-lit elegant scene with ${form.nomeProduto} placed prominently — premium materials, warm golden hour, marble countertop. Top: bold sans-serif "Depois:" then "Elegância Real" in 2 lines, white #F8F4EE color, 38pt
- Right half center-right area: 4 small green ✓ checkmarks vertically stacked with labels: ${features}, white text 22pt

Style: dramatic before/after — like a magazine "transformation" feature. Clear contrast between the two halves.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'aplus-specs': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['aplus-specs'];
    const calloutsList = p.callouts.map((c) => `"${c.titulo}: ${c.spec}"`).join('; ');
    return `
Generate a WIDE LANDSCAPE (3:2 → 970×600) Amazon A+ technical specs infographic for "${form.nomeProduto}".

Layout:
- Top: bold sans-serif headline "Especificações Técnicas" centered in deep navy #1F2A3A
- Center: ${form.nomeProduto} isolated on smooth neutral cream gradient backdrop (#F8F4EE), soft directional lighting from upper-left
- Left side: thin vertical ruler outline with tick marks, with label "${p.altura}" near the middle
- Right side: 4 stacked technical callouts vertically, each with a tiny line-icon + bold sans-serif title + spec value below in lighter weight: ${calloutsList}

Style: clean editorial technical reference, like an Apple product spec page. Premium, minimal, sharp focus on details.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'aplus-casos-uso': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['aplus-casos-uso'];
    const usosList = p.usos.map((u, i) => `${i + 1}. icon + "${u.label}"`).join('; ');
    return `
Generate a WIDE LANDSCAPE (3:2 → 970×600) "Versatility" use-case infographic for "${form.nomeProduto}".

Layout:
- Top center: bold sans-serif headline "Versatilidade para Todos os Momentos" in deep navy #1F2A3A
- 4 equal vertical panels side by side, each panel showing a different lifestyle scenario where the product is used:
  ${usosList}
- Above each panel, a small white pill-shaped tag with line-icon + label name (sans-serif bold, 18pt)
- Each panel: warm cinematic lifestyle photo, golden hour, premium materials

Style: editorial multi-scenario feature like a Veranda magazine "5 ways to..." spread.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'aplus-validacao': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['aplus-validacao'];
    const calloutsList = p.callouts.map((c, i) => `${i + 1}. "${c}"`).join('; ');
    return `
Generate a WIDE LANDSCAPE (3:2 → 970×600) Amazon A+ validation infographic for "${form.nomeProduto}".

Layout:
- Hero shot of ${form.nomeProduto} on the LEFT-CENTER (occupying ~40% width), premium surface, warm cinematic lighting
- Large green ✓ checkmark badge floating near the product top (validation seal)
- RIGHT 40%: 3 stacked white pill-shaped callouts with thin connector lines pointing to product details: ${calloutsList} — each pill sans-serif bold

Style: editorial product validation, warm sophisticated background blurred elegantly.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'aplus-cta': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['aplus-cta'];
    const featuresList = p.miniFeatures.map((f) => `"${f}"`).join(', ');
    return `
Generate a WIDE LANDSCAPE (3:2 → 970×600) Amazon A+ closing CTA scene for "${form.nomeProduto}".

Layout:
- Cinematic intimate scene — closing frame of a luxury hotel commercial, candle-lit dinner, or designer's residential sanctuary. Marble + brass + eucalyptus + lit candles. Aman Resort closing-shot vibe.
- ${form.nomeProduto} placed in upper-right area with cinematic presence
- TOP-LEFT 60% area: bold sans-serif white #F8F4EE headline "${p.headline}" 48pt + below it italic gold #D4A876 sub-headline 26pt
- Below sub: large gold #D4A876 pill button "Eleve seu Ambiente" (visual CTA, NOT a real Amazon button — just a styled label)
- Bottom-left: 2 mini-icons + labels ("Garantia Amalfi" + "Curadoria Premium"), small sans-serif 16pt white

Mood: ASPIRATIONAL — viewer wants to BE in this scene. Warm, intimate, magazine cover quality.
Mini-features for context (don't render literally as icons): ${featuresList}.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  // ============================================================
  // A+ Premium (1464×600) e A+ Comparison (220×220)
  // ============================================================

  'aplus-premium': ({ form, params, visualSpec }) => {
    const p = params as SlotParamsByKind['aplus-premium'];
    const badgesList = p.badges.map((b) => `"${b.label}"`).join(', ');
    return `
Generate a WIDE LANDSCAPE (3:2 → cropped to 1464×600) ULTRA-WIDE Amazon A+ Premium hero for "${form.nomeProduto}".

Layout — cinematic premium feel, 50% wider than standard A+:
- Cinematic editorial hero shot — like the opening spread of a luxury brand campaign
- Product on RIGHT THIRD of frame, dramatically lit
- LEFT TWO-THIRDS: bold serif headline "${p.headline}" in 2 lines (DM Serif Display, deep navy #1F2A3A) + below italic Cormorant sub "${p.sub}" 26pt
- Below sub: 3 horizontal pill tags side by side with line-icon + label, white background with thin navy border: ${badgesList}
- Top-right corner: small octagonal gold seal "CURADO AMALFI"

Setting: ultra-luxury (5-star hotel suite, Mediterranean villa interior, Aman Resort), warm golden hour, marble + walnut + brass + linen.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim();
  },

  'aplus-comparison': ({ form, visualSpec }) => `
Generate a SQUARE (1:1, will be resized to 220×220) tiny clean product thumbnail of "${form.nomeProduto}" for Amazon Comparison Charts.

Layout: pure white background (#FFFFFF), product centered occupying ~75% of frame, soft even studio lighting. NO TEXT, NO overlays. Clean, identifiable at very small size — like a catalog cover thumbnail.
${fidelityClause(form, visualSpec)}
${NO_BRAND_ANCHOR}
${QUALITY_ANCHOR}
${VOICE_ANCHOR}`.trim(),
};

export function promptForSlotOpenAI(
  slot: SlotKind,
  form: CriacaoForm,
  params: SlotParamsByKind[SlotKind],
  visualSpec?: string,
): string {
  return PROMPTS[slot]({ form, params, visualSpec });
}
