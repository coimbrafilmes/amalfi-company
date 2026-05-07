/**
 * A+ 5: VALIDAÇÃO COM CHECKMARKS · 970×600
 * Check verde grande + 3 callouts em pills à direita.
 */

import sharp from 'sharp';
import type { SlotParamsAplusValidacao } from '../types';
import { drawPill } from '../primitives';
import { iconAt } from '../icons';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsAplusValidacao): Promise<Buffer> {
  const { callouts } = params;

  // Check verde grande no canto superior central-esquerdo
  const checkBadge = `<g>
    <circle cx="320" cy="170" r="32" fill="${COLOR.validacao}" />
    ${iconAt('check', 296, 146, { stroke: COLOR.osso, size: 48, strokeWidth: 3 })}
  </g>`;

  // 3 pills à direita stacked vertically
  const pillStartY = 200;
  const pillGap = 60;
  const pillsSvg = callouts
    .slice(0, 3)
    .map((c, i) =>
      drawPill({
        x: 600,
        y: pillStartY + i * pillGap,
        label: c,
        bgFill: COLOR.osso,
        textColor: COLOR.tinta,
        fontSize: 16,
        paddingX: 18,
        paddingY: 10,
      }),
    )
    .join('\n');

  const svg = `<svg width="970" height="600" xmlns="http://www.w3.org/2000/svg">
    ${checkBadge}
    ${pillsSvg}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
