/**
 * A+ 3: SPECS VISUAIS · 970×600
 * Régua altura lateral + 4 callouts ao redor (ícone + título + spec).
 */

import sharp from 'sharp';
import type { SlotParamsAplusSpecs } from '../types';
import { drawHeadline } from '../primitives';
import { iconAt } from '../icons';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsAplusSpecs): Promise<Buffer> {
  const { altura, callouts } = params;

  // Régua de altura à esquerda
  const rulerSvg = `<g>
    <line x1="50" y1="120" x2="50" y2="480" stroke="${COLOR.tinta}" stroke-width="1.5" />
    ${[120, 200, 300, 400, 480].map((y) => `<line x1="44" y1="${y}" x2="56" y2="${y}" stroke="${COLOR.tinta}" stroke-width="1.5" />`).join('')}
  </g>`;

  const alturaLabel = drawHeadline({
    text: altura,
    font: 'sans',
    weight: 500,
    size: 20,
    fill: COLOR.tinta,
    x: 70,
    y: 290,
    anchor: 'left',
  });

  // 4 callouts em quadrante (top-left, top-right, bottom-left, bottom-right do produto)
  const positions = [
    { x: 730, y: 100, anchor: 'left' as const },
    { x: 730, y: 240, anchor: 'left' as const },
    { x: 730, y: 380, anchor: 'left' as const },
    { x: 730, y: 500, anchor: 'left' as const },
  ];

  const calloutsSvg = callouts
    .slice(0, 4)
    .map((c, i) => {
      const pos = positions[i];
      // Cada callout: ícone topo + título bold + spec abaixo
      const iconSvg = iconAt(c.icon, pos.x, pos.y, {
        stroke: COLOR.tinta,
        size: 22,
        strokeWidth: 2,
      });
      const tituloSvg = drawHeadline({
        text: c.titulo,
        font: 'sans',
        weight: 600,
        size: 14,
        fill: COLOR.tinta,
        x: pos.x + 32,
        y: pos.y - 2,
        anchor: 'left',
      });
      const specSvg = drawHeadline({
        text: c.spec,
        font: 'sans',
        weight: 400,
        size: 12,
        fill: COLOR.tinta65,
        x: pos.x + 32,
        y: pos.y + 16,
        anchor: 'left',
      });
      return `<g>${iconSvg}${tituloSvg}${specSvg}</g>`;
    })
    .join('\n');

  const svg = `<svg width="970" height="600" xmlns="http://www.w3.org/2000/svg">
    ${rulerSvg}
    ${alturaLabel}
    ${calloutsSvg}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
