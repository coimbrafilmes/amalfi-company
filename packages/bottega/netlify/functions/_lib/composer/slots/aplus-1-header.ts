/**
 * A+ 1: HEADER HERO · 970×600
 * Headline grande à esquerda + 2 badges laterais.
 */

import sharp from 'sharp';
import type { SlotParamsAplusHeader } from '../types';
import { drawHeadline, drawSeal, drawTag } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsAplusHeader): Promise<Buffer> {
  const { headline, sub, badges } = params;

  // Quebra headline em 2 linhas (até 6 palavras)
  const words = headline.split(' ');
  const half = Math.ceil(words.length / 2);
  const line1 = words.length > 3 ? words.slice(0, half).join(' ') : headline;
  const line2 = words.length > 3 ? words.slice(half).join(' ') : '';

  const headlineSvg = `${drawHeadline({
    text: line1,
    font: 'serif',
    size: 56,
    fill: COLOR.tinta,
    x: 50,
    y: 80,
    anchor: 'left',
  })}${
    line2
      ? drawHeadline({
          text: line2,
          font: 'serif',
          size: 56,
          fill: COLOR.tinta,
          x: 50,
          y: 150,
          anchor: 'left',
        })
      : ''
  }`;

  const subSvg = drawHeadline({
    text: sub,
    font: 'italic',
    size: 22,
    fill: COLOR.tinta65,
    x: 50,
    y: line2 ? 230 : 170,
    anchor: 'left',
  });

  // 2 badges em coluna abaixo do sub
  const badge1 = badges[0]
    ? drawTag({
        x: 50,
        y: line2 ? 290 : 230,
        iconKey: badges[0].icon,
        label: badges[0].label,
        bgFill: COLOR.osso,
        textColor: COLOR.tinta,
        iconColor: COLOR.ocre,
        fontSize: 15,
      })
    : '';

  const badge2 = badges[1]
    ? drawTag({
        x: 50,
        y: line2 ? 350 : 290,
        iconKey: badges[1].icon,
        label: badges[1].label,
        bgFill: COLOR.osso,
        textColor: COLOR.tinta,
        iconColor: COLOR.ocre,
        fontSize: 15,
      })
    : '';

  // Selo octogonal premium canto superior direito (paridade modulo-1.png)
  const seal = drawSeal({
    cx: 890,
    cy: 80,
    radius: 60,
    text: ['Curado', 'Amalfi'],
    fillColor: COLOR.ocre,
    borderColor: COLOR.tinta,
    textColor: COLOR.tinta,
    fontSize: 11,
  });

  const svg = `<svg width="970" height="600" xmlns="http://www.w3.org/2000/svg">
    ${headlineSvg}
    ${subSvg}
    ${badge1}
    ${badge2}
    ${seal}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
