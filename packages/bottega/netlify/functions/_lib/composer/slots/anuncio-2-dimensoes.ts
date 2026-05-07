/**
 * Slot 2: DIMENSÕES · 1024×1024
 * Pergunta: "Cabe no meu espaço?"
 * Overlay: cotas (setas + medidas) + footer label.
 *
 * Estratégia de layout:
 * - Largura: cota horizontal acima do produto (y ~ 80, x range central 250-700)
 * - Altura: cota vertical à esquerda (x ~ 80, y range 200-820)
 * - Profundidade (se houver): cota diagonal pequena no canto inferior direito
 * - Footer: label centralizada em y ~ 950
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
          from: { x: 240, y: 90 },
          to: { x: 780, y: 90 },
          label: cota.value,
          stroke: COLOR.tinta,
          textColor: COLOR.tinta,
          fontSize: 26,
          textPosition: 'above',
          dashed: true,
        }),
      );
    } else if (cota.axis === 'altura') {
      cotaSvgs.push(
        drawDimensionLine({
          from: { x: 90, y: 200 },
          to: { x: 90, y: 820 },
          label: cota.value,
          stroke: COLOR.tinta,
          textColor: COLOR.tinta,
          fontSize: 26,
          textPosition: 'left',
          dashed: true,
        }),
      );
    } else if (cota.axis === 'profundidade') {
      // Diagonal pequena canto inferior direito
      cotaSvgs.push(
        drawDimensionLine({
          from: { x: 720, y: 870 },
          to: { x: 920, y: 920 },
          label: cota.value,
          stroke: COLOR.tinta65,
          textColor: COLOR.tinta65,
          fontSize: 22,
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
    size: 22,
    fill: COLOR.tinta,
    x: 512,
    y: 950,
    anchor: 'center',
  });

  const svg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    ${cotaSvgs.join('\n')}
    ${footer}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png({ quality: 92 })
    .toBuffer();
}
