/**
 * Slot 3: LIFESTYLE + CALLOUTS · 2000×2000
 * Pergunta: "Como funciona / como é usar?"
 * Overlay: headline serif topo + 3 badges circulares ao redor do produto.
 */

import sharp from 'sharp';
import type { SlotParamsLifestyleCallouts } from '../types';
import { drawHeadline, drawCircularBadge } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsLifestyleCallouts): Promise<Buffer> {
  const { headline, callouts } = params;

  const headlineSvg = drawHeadline({
    text: headline,
    font: 'serif',
    size: 88,
    fill: COLOR.tinta,
    x: 1000,
    y: 140,
    anchor: 'center',
  });

  // 3 badges em triângulo invertido (top-left, top-right, bottom-center) — empurrados
  // pras bordas pra evitar sobreposição com o produto (que Gemini tende a centralizar).
  // Top y:540 (27%) — abaixo do headline (y:140) com folga, longe do centro vertical.
  // Lateral x:260/1740 (13%/87%) — quase encostando nas bordas.
  // Bottom-center cy:1720 (86%) — abaixo do produto.
  const badgePositions = [
    { cx: 260, cy: 540 },
    { cx: 1740, cy: 540 },
    { cx: 1000, cy: 1720 },
  ];

  const badgesSvg = callouts
    .slice(0, 3)
    .map((c, i) => {
      const pos = badgePositions[i] ?? badgePositions[0];
      return drawCircularBadge({
        cx: pos.cx,
        cy: pos.cy,
        radius: 160,
        iconKey: c.icon,
        label: c.label,
        bgFill: COLOR.osso,
        borderStroke: COLOR.ocre,
        iconColor: COLOR.terracota,
        textColor: COLOR.tinta,
      });
    })
    .join('\n');

  const svg = `<svg width="2000" height="2000" xmlns="http://www.w3.org/2000/svg">
    ${headlineSvg}
    ${badgesSvg}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
