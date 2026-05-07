/**
 * Slot 2: DIMENSÕES · 2000×2000
 * Pergunta: "Cabe no meu espaço?"
 * Overlay: cotas (setas + medidas) + footer label.
 *
 * Layout (coords escaladas ×2 do baseline 1024 — Amazon BR exige 2000+ pra zoom mobile):
 * - Largura: cota horizontal acima do produto (y ~ 180, x range central 480-1560)
 * - Altura: cota vertical à esquerda (x ~ 180, y range 400-1640)
 * - Profundidade (se houver): cota diagonal pequena no canto inferior direito
 * - Footer: label centralizada em y ~ 1860
 */

import sharp from 'sharp';
import type { SlotParamsDimensoes } from '../types';
import { drawDimensionLine, drawHeadline } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsDimensoes): Promise<Buffer> {
  const { cotas, footerLabel } = params;

  const cotaSvgs: string[] = [];

  for (const cota of cotas) {
    if (cota.axis === 'largura') {
      cotaSvgs.push(
        drawDimensionLine({
          from: { x: 480, y: 180 },
          to: { x: 1560, y: 180 },
          label: cota.value,
          stroke: COLOR.tinta,
          textColor: COLOR.tinta,
          fontSize: 52,
          textPosition: 'above',
          dashed: true,
        }),
      );
    } else if (cota.axis === 'altura') {
      cotaSvgs.push(
        drawDimensionLine({
          from: { x: 180, y: 400 },
          to: { x: 180, y: 1640 },
          label: cota.value,
          stroke: COLOR.tinta,
          textColor: COLOR.tinta,
          fontSize: 52,
          textPosition: 'left',
          dashed: true,
        }),
      );
    } else if (cota.axis === 'profundidade') {
      // Diagonal pequena canto inferior direito
      cotaSvgs.push(
        drawDimensionLine({
          from: { x: 1440, y: 1740 },
          to: { x: 1840, y: 1840 },
          label: cota.value,
          stroke: COLOR.tinta65,
          textColor: COLOR.tinta65,
          fontSize: 44,
          textPosition: 'below',
          dashed: true,
        }),
      );
    }
  }

  const footer = drawHeadline({
    text: footerLabel,
    font: 'sans',
    weight: 500,
    size: 44,
    fill: COLOR.tinta,
    x: 1000,
    y: 1860,
    anchor: 'center',
  });

  const svg = `<svg width="2000" height="2000" xmlns="http://www.w3.org/2000/svg">
    ${cotaSvgs.join('\n')}
    ${footer}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png({ quality: 92 })
    .toBuffer();
}
