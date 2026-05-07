/**
 * A+ 4: CASOS DE USO · 970×600
 * 4 quadrantes com ícones + labels (acima ou abaixo de cada quadrante).
 *
 * Nota: a imagem base do Gemini deve ter 4 cenas em layout horizontal.
 * Aplicamos labels com ícones ACIMA de cada região aproximada.
 */

import sharp from 'sharp';
import type { SlotParamsAplusCasosUso } from '../types';
import { drawHeadline } from '../primitives';
import { iconAt } from '../icons';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsAplusCasosUso): Promise<Buffer> {
  const { usos } = params;

  // 4 colunas ~242px cada · label centralizada acima do "círculo" (~y=40)
  const columnWidth = 970 / 4;
  const labels = usos
    .slice(0, 4)
    .map((u, i) => {
      const cx = i * columnWidth + columnWidth / 2;
      const iconSvg = iconAt(u.icon, cx - 12, 30, {
        stroke: COLOR.tinta,
        size: 24,
        strokeWidth: 2,
      });
      const labelSvg = drawHeadline({
        text: u.label,
        font: 'sans',
        weight: 500,
        size: 14,
        fill: COLOR.tinta,
        x: cx,
        y: 65,
        anchor: 'center',
      });
      return `<g>${iconSvg}${labelSvg}</g>`;
    })
    .join('\n');

  const svg = `<svg width="970" height="600" xmlns="http://www.w3.org/2000/svg">
    ${labels}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
