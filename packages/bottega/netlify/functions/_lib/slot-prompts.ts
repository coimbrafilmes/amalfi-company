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
// V2 (Bloco J): mais agressivo após Gemini alucinar "HEADLINE Serif Headline 600%" no slot 6.
const NO_TEXT_ANCHOR = `STRICT NO-TEXT POLICY — ABSOLUTELY ZERO text, letters, words, numbers, signs, labels, captions, watermarks, logos, brand mockups, badges with text, price tags, headline samples, layout placeholders, design templates, font specimens, lorem ipsum, sample copy, or typography of ANY kind ANYWHERE in the image. NO pseudo-text, NO illegible-but-text-like marks, NO graphic design overlays. This is a 100% PHOTOGRAPHIC scene — like a real photograph captured with a camera, not a designed mockup or template. If you would normally add a label, headline, or caption — DO NOT. The scene must look like an unedited photograph.`;

// Critico para slot 3 (lifestyle-callouts): o composer adiciona EXATAMENTE 3 badges circulares.
// Gemini nao pode gerar circulos decorativos extras (aneis, copos redondos em primeiro plano,
// floroes circulares) que possam ser confundidos com badges adicionais.
const NO_DECORATIVE_CIRCLES_ANCHOR = `IMPORTANT — DO NOT include any decorative circular elements, golden rings, round badges, circular plates, framed circles, or round overlays in the scene composition. Keep the background visually flat and free of round geometric accents.`;

// CINEMATIC LUXURY VIBE — paridade Gumpinho. Cenas geradas pelo Gemini estavam
// "mornas" (cozinha mediana, taça pequena no canto). Esse anchor força drama
// de magazine editorial / luxury hotel commercial. Aplicado em slots
// lifestyle/aspirational (3, 5, 6, 7, A+ hero, A+ cta).
const LUXURY_VIBE_ANCHOR = `CINEMATIC LUXURY VIBE — render the scene like a high-end editorial spread (Conde Nast Traveler, Architectural Digest, Saint Laurent residential, Veuve Clicquot ad, Eichholtz showroom). MANDATORY visual treatment:
- WARM GOLDEN HOUR ambient lighting (soft sunset glow, never flat midday)
- VERY SHALLOW depth of field — background heavily blurred, dreamy bokeh
- Product feels like a HERO — central, confident, lit dramatically with rim light
- Composition is CINEMATIC — like a still from a luxury commercial, not stock photo
- Materials in scene are PREMIUM — marble, wood, brass, velvet, linen — never plastic or cheap surfaces
- Color palette is RICH and MOODY — deep tones with warm highlights, never flat or washed-out
- The image must feel ASPIRATIONAL — viewer wants to BE in this scene, not just buy the product`;

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
Catalog-style product spec sheet of ${form.nomeProduto}.
NEUTRAL LIGHT studio backdrop — soft off-white to light cream gradient (#F8F4EE to #EFE8DD).
NO surface, NO marble, NO countertop, NO lifestyle scene — like an isolated catalog photo.
Product centered occupying ~45-55% of frame width and ~50-60% of frame height (smaller than cover).
Soft diffused omnidirectional studio lighting, very subtle ground shadow only.
LEAVE WIDE MARGINS on left, right, top, and bottom — the entire LEFT 22% and RIGHT 22% must be visually empty for measurement annotations and a vertical ruler.
Top 10% and bottom 12% also clear for headline + footer label.
Mood: technical reference, clean, almost editorial spec-sheet.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-lifestyle-callouts': ({ form, visualSpec }) => `
Editorial luxury lifestyle scene featuring ${form.nomeProduto} in elegant Brazilian residential context (boutique hotel suite, magazine-spread interior, design studio living room — pick the most natural fit for the product category).
Product is the HERO — clearly visible upper-middle of frame, lit with cinematic rim light, confident presence.
Surface: dark marble, walnut wood, brass accents, or rich linen — never plastic or cheap.
LEAVE TOP 15% of frame CLEAR (entire top band) for a bold headline overlay.
LEAVE BOTTOM 18% of frame CLEAR (entire bottom band, smoothly blurred) for 3 horizontal info pills — keep this region visually flat.
${LUXURY_VIBE_ANCHOR}
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
${NO_DECORATIVE_CIRCLES_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-comparativo': ({ form, visualSpec }) => `
Hero product photography of ${form.nomeProduto} on the RIGHT 60% of the frame.
Position the product clearly in the right two-thirds, occupying x:60%-95% horizontal, vertically centered around y:50-70%.
LEAVE THE ENTIRE LEFT 40% of the frame VISUALLY EMPTY — soft muted off-white or cream background with no decorative elements (it will be covered by a comparison card overlay).
TOP 12% must also be clear (entire band) for a centered bold headline.
Setting (right side only): clean elegant wood or marble countertop, very subtle premium ambient lighting, mood of quiet luxury.
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-aspiracional': ({ form, visualSpec }) => `
Cinematic aspirational scene featuring ${form.nomeProduto} in a luxury setting (boutique hotel spa, Mediterranean villa interior, magazine-spread bathroom, designer's home).
Setting elements: white marble, eucalyptus plant, lit beeswax candles, folded linen towels, brass accents — Veuve Clicquot ad / Aman Resort vibe.
Product placement: integrated into the scene, NOT subtle and faded — visible enough to read material/finish, but the SCENE is the star.
LEAVE TOP-LEFT 60% clear for large serif headline overlay (composer adds text — keep this region purely photographic with no decorative typography).
${LUXURY_VIBE_ANCHOR}
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-beneficios': ({ form, visualSpec }) => `
Cinematic everyday-luxe lifestyle of ${form.nomeProduto} — feels like a moment captured for an editorial magazine, not a stock photo.
Setting: well-curated Brazilian residence, premium materials (marble, walnut, brass), warm afternoon light streaming in.
Product is clearly visible and confidently placed — the kind of product placement you'd see in a Saint Laurent home spread.
LEAVE TOP-LEFT 60% clear for serif headline + bullet list (composer adds text — keep this region purely photographic with no decorative typography).
${LUXURY_VIBE_ANCHOR}
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'anuncio-prova-final': ({ form, visualSpec }) => `
Hero close-up product portrait of ${form.nomeProduto} — magazine cover-style, dramatic and confident.
Material details visible: brushed metal, etched glass, polished surface — whatever applies, render it precisely.
Setting: rich blurred background (marble bathroom, walnut counter, dark velvet) — pure mood, no distracting elements.
LEAVE LEFT 25% and RIGHT 25% margins clear for small elegant tag overlays.
${LUXURY_VIBE_ANCHOR}
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
${VOICE_ANCHOR}`.trim(),

  'aplus-header': ({ form, visualSpec }) => `
Wide cinematic editorial hero shot for ${form.nomeProduto} (970×600 landscape).
Product on RIGHT THIRD of frame, LEFT TWO-THIRDS clear for typography overlay.
Setting: feels like the opening spread of a Conde Nast Traveler feature — luxury hotel suite, marble + walnut + brass, warm twilight light.
${LUXURY_VIBE_ANCHOR}
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
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
Cinematic final lifestyle scene featuring ${form.nomeProduto} — like the closing frame of a luxury hotel commercial or the back cover of an Aman resort brochure.
Setting: rich, intimate, warm — boutique hotel suite at golden hour, candle-lit dinner scene, or designer's residential sanctuary. Marble + brass + eucalyptus + lit candles.
${form.nomeProduto} placed in upper-right area with cinematic presence.
LEAVE TOP-LEFT 60% clear for elegant serif headline + sub-CTA + 3 mini-tags.
${LUXURY_VIBE_ANCHOR}
${fidelityClause(visualSpec)}
${NO_PACKAGING_ANCHOR}
${NO_TEXT_ANCHOR}
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
