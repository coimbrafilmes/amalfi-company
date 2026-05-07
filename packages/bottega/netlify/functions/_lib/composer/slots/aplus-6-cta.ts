/**
 * A+ 6: CTA / AMBIENTAÇÃO FINAL · 970×600
 * Headline serif + sub CTA texto (sem botão) + 3 mini-tags features.
 */

import sharp from 'sharp';
import type { SlotParamsAplusCta } from '../types';
import { drawHeadline, drawPill } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsAplusCta): Promise<Buffer> {
  const { headline, subCta, miniFeatures } = params;

  const headlineSvg = drawHeadline({
    text: headline,
    font: 'serif',
    size: 56,
    fill: COLOR.tinta,
    x: 50,
    y: 100,
    anchor: 'left',
  });

  const subSvg = drawHeadline({
    text: subCta,
    font: 'sans',
    weight: 500,
    size: 18,
    fill: COLOR.terracota,
    x: 50,
    y: 175,
    anchor: 'left',
  });

  // 3 mini features em pills empilhados verticalmente embaixo (left side)
  const pillStartY = 380;
  const pillGap = 50;
  const pillsSvg = miniFeatures
    .slice(0, 3)
    .map((f, i) =>
      drawPill({
        x: 50,
        y: pillStartY + i * pillGap,
        label: f,
        bgFill: COLOR.osso,
        textColor: COLOR.tinta,
        fontSize: 14,
        paddingX: 14,
        paddingY: 8,
      }),
    )
    .join('\n');

  const svg = `<svg width="970" height="600" xmlns="http://www.w3.org/2000/svg">
    ${headlineSvg}
    ${subSvg}
    ${pillsSvg}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
