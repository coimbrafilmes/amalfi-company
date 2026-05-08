/**
 * Slot prompts (V3) — 13 prompts dedicados pra Gemini Image gerar a CENA
 * fotorealista de cada slot (sem texto, sem callouts).
 *
 * Os overlays (texto/setas/badges) são adicionados depois pelo composer.
 *
 * Estratégia: cada prompt direciona o modelo a deixar negative space onde
 * o composer vai aplicar overlay (topo, lateral, etc).
 */

import type { CriacaoForm, SlotKind } from '../../../src/types/anuncio';

interface PromptCtx {
  form: CriacaoForm;
  visualSpec?: string;
}

const VOICE_ANCHOR = `Style: serene, curated, premium-but-not-shouty, Brazilian residential context. Mood: sophisticated calm.`;

// Critico: as fotos de referencia geralmente mostram o produto AINDA na embalagem
// blister/cartelinha original (como vem da fabrica). Esse anchor instrui o modelo
// a renderizar APENAS o produto exposto, sem qualquer embalagem comercial.
const NO_PACKAGING_ANCHOR = `CRITICAL — render ONLY the bare product fully unpackaged. NO blister card, NO plastic wrap, NO cardboard backing, NO retail packaging, NO product tag, NO barcode label, NO brand sticker. Show the product as it appears AFTER being removed from its retail box, ready to use.`;

// Reforco contra Gemini "preencher" negative space com tipografia ilegivel/labels falsos.
// O composer vai adicionar todo texto depois — a CENA deve estar 100% limpa.
const NO_TEXT_ANCHOR = `STRICT — ABSOLUTELY ZERO text, letters, words, numbers, signs, labels, captions, watermarks, logos, badges with text, price tags, or typography of ANY kind ANYWHERE in the image. The scene must be photographic only.`;

// Critico para slot 3 (lifestyle-callouts): o composer adiciona EXATAMENTE 3 badges circulares.
// Gemini nao pode gerar circulos decorativos extras (aneis, copos redondos em primeiro plano,
// floroes circulares) que possam ser confundidos com badges adicionais.
const NO_DECORATIVE_CIRCLES_ANCHOR = `IMPORTANT — DO NOT include any decorative circular elements, golden rings, round badges, circular plates, framed circles, or round overlays in the scene composition. Keep the background visually flat and free of round geometric accents.`;

function fidelityClause(visualSpec?: string): string {
  if (!visualSpec) return '';
  return `\n\nIMPORTANT — render the EXACT product described:\n${visualSpec}`;
}

const PROMPTS: Record<SlotKind, (ctx: PromptCtx) => string> = {
  'anuncio-capa': ({ form, visualSpec }) => `
Professional product photography on PURE WHITE background (#FFFFFF, no shadows).
Soft three-point studio lighting, no harsh shadows, neutral evenly-lit white seamless.
Product (${form.nomeProduto}) centered, occupying ~80% of the square frame.
Camera angle: slight 3/4 view that shows depth without distortion.
NO people, NO text, NO overlays, NO watermarks, NO props.
E-commerce catalog style, clean minimal, Amazon-compliant cover image.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-dimensoes': ({ form, visualSpec }) => `
Product photography on light marble or cream surface.
Product (${form.nomeProduto}) clearly visible, centered, no people.
Soft natural diffused lighting from upper-left.
Background: blurred neutral bathroom or counter, very subtle.
LEAVE 25% MARGIN around product on top, left, and bottom for measurement annotations to be added later.
Composition: product fills only the central area; ample negative space surrounding.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-lifestyle-callouts': ({ form, visualSpec }) => `
Lifestyle photography in elegant Brazilian residential context (bathroom, kitchen, or bedroom — pick the most relevant for ${form.nomeProduto}).
Product in natural use scenario, soft warm directional lighting.
Surface: marble or wood, blurred sophisticated background.
Composition: product clearly visible in the upper-middle/middle area of the frame.
LEAVE TOP 15% of frame CLEAR (entire top band) for a bold headline overlay.
LEAVE BOTTOM 18% of frame CLEAR (entire bottom band, plain or smoothly blurred) for 3 horizontal info pills — keep this region visually flat.
Mood: serene, premium quiet luxury.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
${NO_DECORATIVE_CIRCLES_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-comparativo': ({ form, visualSpec }) => `
Elegant lifestyle scene with product (${form.nomeProduto}) being used by a person's hand (only hand visible, no face).
Setting: marble countertop, sophisticated muted bathroom or kitchen.
Premium directional lighting from above-left.
LEAVE TOP-LEFT QUADRANT (left 50%, top 60%) clear for serif headline + bullet list.
LEAVE BOTTOM-RIGHT corner area (~20% wide × ~16% tall, anchored to bottom-right with small margin) clear for a small comparison frame.
Mood: confident demonstration of quality.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-aspiracional': ({ form, visualSpec }) => `
Aspirational lifestyle photography, dreamy warm golden hour lighting.
Setting: spa-like Brazilian bathroom or living space — marble or wooden counter, eucalyptus plant, lit candle, white folded towel.
Product (${form.nomeProduto}) subtle in scene, not dominant.
LEAVE TOP-LEFT 60% clear for large serif headline overlay (composer adds text — keep this region purely photographic with no decorative typography).
Mood: serene, transformative, invitation to elevated lifestyle.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-beneficios': ({ form, visualSpec }) => `
Everyday Brazilian residential lifestyle, well-organized clean bathroom or home counter.
Product (${form.nomeProduto}) clearly visible and focal, daily-use feeling.
Neutral natural lighting, mid-day soft window light.
LEAVE TOP-LEFT 60% clear for serif headline + bullet list (composer adds text — keep this region purely photographic with no decorative typography).
Mood: practical sophistication, friendly daily ritual.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-prova-final': ({ form, visualSpec }) => `
Hero product photography of ${form.nomeProduto}, premium ambient lighting, golden hour glow.
Surface: marble, blurred elegant bathroom background with bathtub silhouette.
Mood: aspirational quiet luxury, central product hero.
LEAVE LEFT 25% and RIGHT 25% margins clear for small elegant tag overlays.
Camera close-up showing material quality and finish details.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'aplus-header': ({ form, visualSpec }) => `
Wide horizontal cinematic product hero shot for ${form.nomeProduto} (970×600 landscape).
Premium environment, golden hour ambient lighting.
Product on RIGHT THIRD of frame, LEFT TWO-THIRDS clear for typography overlay.
Setting: marble + wood luxury bathroom, blurred elegant.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'aplus-antes-depois': ({ form, visualSpec }) => `
Split horizontal landscape (970×600) with TWO equal halves divided by sharp vertical line in center.
LEFT HALF: desaturated, cluttered ordinary bathroom counter with generic items, mundane lighting.
RIGHT HALF: pristine harmonious organized bathroom with the ${form.nomeProduto}, elegant warm lighting.
Comparable camera angle on both sides.
LEAVE TOP 60px clear on both sides for "Antes" / "Depois" labels.
LEAVE RIGHT-MIDDLE area (x:510-940, y:230-440) clear for 4 checkmark features.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'aplus-specs': ({ form, visualSpec }) => `
Clean product showcase of ${form.nomeProduto} on neutral cream surface.
Soft directional lighting from upper-left, subtle shadow below product.
Blurred minimalist background.
Product in CENTER-LEFT area (x:200-650).
LEAVE LEFT 100px margin for vertical ruler annotation.
LEAVE RIGHT 30% (x:700-940) clear for 4 stacked technical callouts.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'aplus-casos-uso': ({ form, visualSpec }) => `
Horizontal landscape (970×600) showing FOUR equally-spaced scenes side by side, each ~242px wide.
Each scene shows hands using ${form.nomeProduto} or a related accessory in a different domestic context.
Neutral cream/marble background between scenes.
LEAVE TOP 80px clear for ICON + LABEL above each of the 4 columns.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'aplus-validacao': ({ form, visualSpec }) => `
Landscape product hero (970×600) with ${form.nomeProduto} in elegant counter setting.
Soft warm lighting, blurred sophisticated background.
Product on LEFT-CENTER area (x:150-450).
LEAVE TOP-CENTER-LEFT clear for circular validation badge (around x:320, y:170).
LEAVE RIGHT 40% (x:580-940) clear for 3 stacked text pills.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'aplus-cta': ({ form, visualSpec }) => `
Aspirational final lifestyle scene, premium spa-like Brazilian bathroom.
Marble + golden accents, eucalyptus plant, large mirror, ${form.nomeProduto} elegantly placed in upper-right area.
Mood: invitation to elevated lifestyle, warm intimate.
LEAVE TOP-LEFT 60% clear for elegant serif headline + sub-CTA + 3 mini-tags.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'aplus-premium': ({ form, visualSpec }) => `
Wide cinematic premium hero shot for ${form.nomeProduto} (16:9 ultra-wide landscape, will be cropped to 1464×600).
Amazon A+ Premium module — 50% wider than standard A+, more cinematic feel.
Product on RIGHT THIRD of frame, LEFT TWO-THIRDS clear for typography overlay (headline + sub + 3 horizontal tags).
Setting: marble + wood luxury bathroom or tabletop, blurred elegant background, golden hour ambient.
Camera: subtle slow-zoom feel, depth of field gentle.
Mood: editorial product showcase, quiet luxury, invitation.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'aplus-comparison': ({ form, visualSpec }) => `
Tiny product thumbnail of ${form.nomeProduto} for Amazon Comparison Chart (220×220 square).
PURE WHITE background (#FFFFFF), no shadows, soft even studio lighting.
Product centered, occupying ~75% of the frame.
Camera: clean front-facing or slight 3/4 view.
NO people, NO text, NO overlays, NO watermarks, NO props.
Same visual style as Amazon catalog cover — clean, minimal, identifiable at very small size.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${VOICE_ANCHOR}`.trim(),
};

export function promptForSlot(slot: SlotKind, form: CriacaoForm, visualSpec?: string): string {
  return PROMPTS[slot]({ form, visualSpec });
}
