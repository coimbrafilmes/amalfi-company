/**
 * A+ 7: PREMIUM HERO · 1464×600
 * Hero amplificado horizontal — Amazon A+ Premium tem 50% mais largura que A+ Standard.
 * Layout: headline serif grande (3 linhas possíveis) + sub italic + 3 badges horizontais.
 * Produto fica nos ~30% à direita; texto ocupa ~70% à esquerda.
 */

import sharp from 'sharp';
import type { SlotParamsAplusPremium } from '../types';
import { drawHeadline, drawTag } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsAplusPremium): Promise<Buffer> {
  const { headline, sub, badges } = params;

  // Quebra headline em 2 linhas (até 6 palavras) — mais largura disponível que aplus-header
  const words = headline.split(' ');
  const half = Math.ceil(words.length / 2);
  const line1 = words.length > 4 ? words.slice(0, half).join(' ') : headline;
  const line2 = words.length > 4 ? words.slice(half).join(' ') : '';

  const headlineSvg = `${drawHeadline({
    text: line1,
    font: 'serif',
    size: 64,
    fill: COLOR.tinta,
    x: 60,
    y: 90,
    anchor: 'left',
  })}${
    line2
      ? drawHeadline({
          text: line2,
          font: 'serif',
          size: 64,
          fill: COLOR.tinta,
          x: 60,
          y: 170,
          anchor: 'left',
        })
      : ''
  }`;

  const subSvg = drawHeadline({
    text: sub,
    font: 'italic',
    size: 26,
    fill: COLOR.tinta65,
    x: 60,
    y: line2 ? 260 : 180,
    anchor: 'left',
  });

  // 3 badges em ROW horizontal (vs aplus-header que tem 2 em coluna) — aproveita largura extra
  const badgeY = line2 ? 360 : 280;
  const badgeGap = 20; // gap aproximado entre tags (drawTag calcula width baseado no label)
  // Posiciona aproximadamente: x:60, x:330, x:600 — ajustável visualmente em E2E
  const badgePositions = [60, 360, 660];

  const badgesSvg = badges
    .slice(0, 3)
    .map((badge, i) =>
      drawTag({
        x: badgePositions[i] ?? 60,
        y: badgeY,
        iconKey: badge.icon,
        label: badge.label,
        bgFill: COLOR.osso,
        textColor: COLOR.tinta,
        iconColor: COLOR.ocre,
        fontSize: 16,
      }),
    )
    .join('\n');

  // Marca implícita do gap (não renderizada, só pra clareza do layout):
  void badgeGap;

  const svg = `<svg width="1464" height="600" xmlns="http://www.w3.org/2000/svg">
    ${headlineSvg}
    ${subSvg}
    ${badgesSvg}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
