/**
 * A+ 6: CTA / AMBIENTAÇÃO FINAL · 970×600
 * Layout (paridade Gumpinho — modulo-6.png):
 *   - Headline sans-bold branco grande topo-esquerda
 *   - Sub italic dourado abaixo (acento emocional)
 *   - Botão dourado sólido com texto bold (visual destacado, sem fingir compra Amazon)
 *   - 2 mini-ícones rodapé com labels: Garantia + Curadoria/Premium
 */

import sharp from 'sharp';
import type { SlotParamsAplusCta } from '../types';
import { drawHeadline, drawPill } from '../primitives';
import { iconAt } from '../icons';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsAplusCta): Promise<Buffer> {
  const { headline, subCta, miniFeatures } = params;

  // Headline sans-bold OSSO grande (cena final é tipicamente escura, texto claro)
  const headlineSvg = drawHeadline({
    text: headline,
    font: 'sans',
    weight: 600,
    size: 48,
    fill: COLOR.osso,
    x: 50,
    y: 90,
    anchor: 'left',
  });

  // Sub italic dourado — acento emocional Amalfi
  const subSvg = drawHeadline({
    text: subCta,
    font: 'italic',
    weight: 500,
    size: 26,
    fill: COLOR.ocre,
    x: 50,
    y: 165,
    anchor: 'left',
  });

  // Botão dourado destacado (visual de "destaque" sem fingir CTA de compra Amazon)
  // Pill grande com fontSize maior, fill ocre, texto tinta bold
  const buttonLabel = miniFeatures[0] ?? 'Eleve seu Ambiente';
  const buttonSvg = drawPill({
    x: 50,
    y: 240,
    label: buttonLabel,
    iconKey: 'sparkle',
    bgFill: COLOR.ocre,
    textColor: COLOR.tinta,
    iconColor: COLOR.tinta,
    fontSize: 22,
    fontWeight: 600,
    paddingX: 32,
    paddingY: 18,
  });

  // 2 mini-ícones rodapé: Garantia + Curadoria
  const footerY = 540;
  const footerIconY = footerY - 14;
  const garantiaIcon = iconAt('shield', 50, footerIconY, {
    stroke: COLOR.osso,
    size: 24,
    strokeWidth: 2,
  });
  const garantiaLabel = drawHeadline({
    text: 'Garantia Amalfi',
    font: 'sans',
    weight: 500,
    size: 16,
    fill: COLOR.osso,
    x: 86,
    y: footerY - 8,
    anchor: 'left',
  });
  const curadoriaIcon = iconAt('gem', 280, footerIconY, {
    stroke: COLOR.osso,
    size: 24,
    strokeWidth: 2,
  });
  const curadoriaLabel = drawHeadline({
    text: 'Curadoria Premium',
    font: 'sans',
    weight: 500,
    size: 16,
    fill: COLOR.osso,
    x: 316,
    y: footerY - 8,
    anchor: 'left',
  });

  const svg = `<svg width="970" height="600" xmlns="http://www.w3.org/2000/svg">
    ${headlineSvg}
    ${subSvg}
    ${buttonSvg}
    ${garantiaIcon}
    ${garantiaLabel}
    ${curadoriaIcon}
    ${curadoriaLabel}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
