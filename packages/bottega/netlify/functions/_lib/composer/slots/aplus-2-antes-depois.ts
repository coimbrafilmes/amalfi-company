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

  // Labels Antes/Depois — sans BOLD GIGANTE (paridade modulo-2 Gumpinho)
  const labelAntes = drawHeadline({
    text: 'Antes:',
    font: 'sans',
    weight: 600,
    size: 38,
    fill: COLOR.osso,
    x: 240,
    y: 40,
    anchor: 'center',
  });
  const labelAntesSub = drawHeadline({
    text: 'Caos Visual',
    font: 'sans',
    weight: 600,
    size: 38,
    fill: COLOR.osso,
    x: 240,
    y: 88,
    anchor: 'center',
  });
  const labelDepois = drawHeadline({
    text: 'Depois:',
    font: 'sans',
    weight: 600,
    size: 38,
    fill: COLOR.osso,
    x: 730,
    y: 40,
    anchor: 'center',
  });
  const labelDepoisSub = drawHeadline({
    text: 'Elegância Real',
    font: 'sans',
    weight: 600,
    size: 38,
    fill: COLOR.osso,
    x: 730,
    y: 88,
    anchor: 'center',
  });

  // 4 features no lado direito (depois) — checks maiores
  const checkStartY = 240;
  const checkGap = 56;
  const checks = features
    .slice(0, 4)
    .map((f, i) =>
      drawCheckText({
        text: f,
        x: 520,
        y: checkStartY + i * checkGap,
        fontSize: 22,
        textColor: COLOR.osso,
        checkColor: COLOR.validacao,
      }),
    )
    .join('\n');

  const svg = `<svg width="970" height="600" xmlns="http://www.w3.org/2000/svg">
    ${divider}
    ${labelAntes}
    ${labelAntesSub}
    ${labelDepois}
    ${labelDepoisSub}
    ${checks}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
