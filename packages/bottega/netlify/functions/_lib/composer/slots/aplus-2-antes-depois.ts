/**
 * A+ 2: ANTES/DEPOIS · 970×600
 * Split horizontal half-half com labels "Antes" / "Depois" + 4 checkmarks lado direito.
 */

import sharp from 'sharp';
import type { SlotParamsAplusAntesDepois } from '../types';
import { drawHeadline, drawCheckText, drawSplitDivider } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsAplusAntesDepois): Promise<Buffer> {
  const { features } = params;

  const divider = drawSplitDivider({
    width: 970,
    height: 600,
    axis: 'vertical',
    position: 0.5,
    stroke: COLOR.osso,
    strokeWidth: 3,
  });

  const labelAntes = drawHeadline({
    text: 'Antes: Bagunça Visual',
    font: 'sans',
    weight: 600,
    size: 24,
    fill: COLOR.osso,
    x: 30,
    y: 30,
    anchor: 'left',
  });
  const labelDepois = drawHeadline({
    text: 'Depois: Harmonia & Estilo',
    font: 'sans',
    weight: 600,
    size: 24,
    fill: COLOR.osso,
    x: 940,
    y: 30,
    anchor: 'right',
  });

  // 4 features no lado direito (depois)
  const checkStartY = 230;
  const checkGap = 50;
  const checks = features
    .slice(0, 4)
    .map((f, i) =>
      drawCheckText({
        text: f,
        x: 510,
        y: checkStartY + i * checkGap,
        fontSize: 18,
        textColor: COLOR.osso,
        checkColor: COLOR.validacao,
      }),
    )
    .join('\n');

  const svg = `<svg width="970" height="600" xmlns="http://www.w3.org/2000/svg">
    ${divider}
    ${labelAntes}
    ${labelDepois}
    ${checks}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
