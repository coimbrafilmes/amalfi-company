/**
 * Slot 5: ASPIRACIONAL · 1024×1024
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
    size: 64,
    fill: COLOR.tinta,
    x: 60,
    y: 80,
    anchor: 'left',
  });
  const headlineL2 = line2
    ? drawHeadline({
        text: line2,
        font: 'serif',
        size: 64,
        fill: COLOR.tinta,
        x: 60,
        y: 160,
        anchor: 'left',
      })
    : '';

  // Sub-bullets em rows abaixo do headline
  const bulletStartY = line2 ? 270 : 200;
  const bulletGap = 38;
  const bulletsSvg = subBullets
    .slice(0, 3)
    .map((b, i) =>
      drawBullet({
        text: b,
        x: 60,
        y: bulletStartY + i * bulletGap,
        fontSize: 19,
        fill: COLOR.tinta,
        font: 'italic',
        bulletStyle: 'dot',
        bulletColor: COLOR.terracota,
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
