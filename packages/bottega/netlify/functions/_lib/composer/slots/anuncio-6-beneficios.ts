/**
 * Slot 6: BENEFÍCIOS LIFESTYLE PRÁTICOS · 1024×1024
 * Pergunta: "Que problema concreto resolve?"
 * Overlay: headline duplo + 3 bullets com pontos arredondados.
 */

import sharp from 'sharp';
import type { SlotParamsBeneficios } from '../types';
import { drawHeadline, drawBullet } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsBeneficios): Promise<Buffer> {
  const { headline, bullets } = params;

  // Headline padrão "[Verbo] e [Verbo]" — quebra no "e" em 2 linhas
  let line1 = headline;
  let line2 = '';
  const eIdx = headline.indexOf(' e ');
  if (eIdx > 0) {
    line1 = headline.slice(0, eIdx);
    line2 = headline.slice(eIdx + 1).trim();
  }

  const headlineL1 = drawHeadline({
    text: line1,
    font: 'serif',
    size: 50,
    fill: COLOR.tinta,
    x: 60,
    y: 80,
    anchor: 'left',
  });
  const headlineL2 = line2
    ? drawHeadline({
        text: line2,
        font: 'serif',
        size: 50,
        fill: COLOR.tinta,
        x: 60,
        y: 145,
        anchor: 'left',
      })
    : '';

  const bulletStartY = line2 ? 240 : 180;
  const bulletGap = 42;
  const bulletsSvg = bullets
    .slice(0, 3)
    .map((b, i) =>
      drawBullet({
        text: b,
        x: 60,
        y: bulletStartY + i * bulletGap,
        fontSize: 18,
        fill: COLOR.tinta,
        bulletStyle: 'dot',
        bulletColor: COLOR.ocre,
      }),
    )
    .join('\n');

  const svg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    ${headlineL1}
    ${headlineL2}
    ${bulletsSvg}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
