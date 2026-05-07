/**
 * Slot 4: COMPARATIVO + VALIDAÇÃO · 1024×1024
 * Pergunta: "Por que esse e não o concorrente genérico?"
 * Overlay: eyebrow + headline serif + 3 bullets com seta + mini-comparativo canto inferior direito.
 */

import sharp from 'sharp';
import type { SlotParamsComparativo } from '../types';
import { drawHeadline, drawBullet, drawEyebrow } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsComparativo): Promise<Buffer> {
  const { eyebrow, headline, bullets, comparisonLabel } = params;

  const eyebrowSvg = drawEyebrow({
    text: eyebrow,
    x: 56,
    y: 56,
    fill: COLOR.ocre,
    fontSize: 13,
  });

  const headlineSvg = drawHeadline({
    text: headline,
    font: 'serif',
    size: 56,
    fill: COLOR.tinta,
    x: 56,
    y: 100,
    anchor: 'left',
  });

  // 3 bullets com seta · y começa após headline
  const bulletStartY = 220;
  const bulletGap = 50;
  const bulletsSvg = bullets
    .slice(0, 3)
    .map((b, i) =>
      drawBullet({
        text: b,
        x: 56,
        y: bulletStartY + i * bulletGap,
        fontSize: 18,
        fill: COLOR.tinta,
        bulletStyle: 'arrow',
        bulletColor: COLOR.terracota,
      }),
    )
    .join('\n');

  // Mini-comparativo canto inferior direito (frame com placeholder + ❌ + label)
  const compX = 770;
  const compY = 820;
  const compW = 200;
  const compH = 160;
  const xMark = `<g transform="translate(${compX + compW - 36}, ${compY + 12})">
    <circle r="14" cx="14" cy="14" fill="${COLOR.terracota}" />
    <path d="M8 8 L20 20 M20 8 L8 20" stroke="${COLOR.osso}" stroke-width="2.5" stroke-linecap="round" />
  </g>`;
  // Placeholder de produto inferior: silhueta abstrata
  const placeholderSilhouette = `<g transform="translate(${compX + 50}, ${compY + 30})">
    <rect x="0" y="20" width="60" height="80" fill="${COLOR.tinta40}" rx="4" opacity="0.4" />
    <rect x="20" y="0" width="20" height="22" fill="${COLOR.tinta40}" rx="2" opacity="0.5" />
  </g>`;
  const compLabel = drawHeadline({
    text: comparisonLabel,
    font: 'sans',
    weight: 500,
    size: 13,
    fill: COLOR.tinta65,
    x: compX + compW / 2,
    y: compY + compH - 22,
    anchor: 'center',
  });

  const compFrame = `<g>
    <rect x="${compX}" y="${compY}" width="${compW}" height="${compH}" fill="${COLOR.osso15}" stroke="${COLOR.tinta40}" stroke-width="1" />
    ${placeholderSilhouette}
    ${xMark}
    ${compLabel}
  </g>`;

  const svg = `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    ${eyebrowSvg}
    ${headlineSvg}
    ${bulletsSvg}
    ${compFrame}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
