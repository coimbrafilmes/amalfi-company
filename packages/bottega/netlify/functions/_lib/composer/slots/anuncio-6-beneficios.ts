/**
 * Slot 6: BENEFÍCIOS LIFESTYLE PRÁTICOS · 2000×2000
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

  // Headline sans-bold (paridade Gumpinho — slots factuais usam sans pesado)
  const headlineL1 = drawHeadline({
    text: line1,
    font: 'sans',
    weight: 600,
    size: 84,
    fill: COLOR.tinta,
    x: 120,
    y: 160,
    anchor: 'left',
  });
  const headlineL2 = line2
    ? drawHeadline({
        text: line2,
        font: 'sans',
        weight: 600,
        size: 84,
        fill: COLOR.tinta,
        x: 120,
        y: 290,
        anchor: 'left',
      })
    : '';

  // line1 ocupa até y~244, line2 até y~374 — bullets fontSize aumentado pra hierarquia
  const bulletStartY = line2 ? 510 : 350;
  const bulletGap = 96;
  const bulletsSvg = bullets
    .slice(0, 3)
    .map((b, i) =>
      drawBullet({
        text: b,
        x: 120,
        y: bulletStartY + i * bulletGap,
        fontSize: 44,
        fill: COLOR.tinta,
        bulletStyle: 'dot',
        bulletColor: COLOR.ocre,
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
