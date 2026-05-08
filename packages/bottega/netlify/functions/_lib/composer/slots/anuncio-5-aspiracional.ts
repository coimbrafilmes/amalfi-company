/**
 * Slot 5: ASPIRACIONAL · 2000×2000
 * Pergunta: "Como minha vida fica melhor?"
 * Overlay: headline grande topo + 3 sub-bullets curtos.
 */

import sharp from 'sharp';
import type { SlotParamsAspiracional } from '../types';
import { drawHeadline, drawBullet } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsAspiracional): Promise<Buffer> {
  const { headline, subBullets } = params;

  // Headline pode quebrar em 2 linhas (até 7 palavras)
  const words = headline.split(' ');
  const half = Math.ceil(words.length / 2);
  const line1 = words.length > 4 ? words.slice(0, half).join(' ') : headline;
  const line2 = words.length > 4 ? words.slice(half).join(' ') : '';

  const headlineL1 = drawHeadline({
    text: line1,
    font: 'serif',
    size: 128,
    fill: COLOR.tinta,
    x: 120,
    y: 160,
    anchor: 'left',
  });
  const headlineL2 = line2
    ? drawHeadline({
        text: line2,
        font: 'serif',
        size: 128,
        fill: COLOR.tinta,
        x: 120,
        y: 350,
        anchor: 'left',
      })
    : '';

  // Sub-bullets — fontSize aumentado pra balancear hierarquia com headline 128pt
  const bulletStartY = line2 ? 620 : 460;
  const bulletGap = 90;
  const bulletsSvg = subBullets
    .slice(0, 3)
    .map((b, i) =>
      drawBullet({
        text: b,
        x: 120,
        y: bulletStartY + i * bulletGap,
        fontSize: 48,
        fill: COLOR.tinta,
        font: 'italic',
        bulletStyle: 'dot',
        bulletColor: COLOR.terracota,
      }),
    )
    .join('\n');

  const svg = `<svg width="2000" height="2000" xmlns="http://www.w3.org/2000/svg">
    ${headlineL1}
    ${headlineL2}
    ${bulletsSvg}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
