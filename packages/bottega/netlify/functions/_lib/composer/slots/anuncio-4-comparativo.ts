/**
 * Slot 4: COMPARATIVO + VALIDAÇÃO · 2000×2000
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
    x: 112,
    y: 112,
    fill: COLOR.ocre,
    fontSize: 26,
  });

  const headlineSvg = drawHeadline({
    text: headline,
    font: 'serif',
    size: 112,
    fill: COLOR.tinta,
    x: 112,
    y: 200,
    anchor: 'left',
  });

  // 3 bullets com seta · y começa após headline
  const bulletStartY = 440;
  const bulletGap = 100;
  const bulletsSvg = bullets
    .slice(0, 3)
    .map((b, i) =>
      drawBullet({
        text: b,
        x: 112,
        y: bulletStartY + i * bulletGap,
        fontSize: 36,
        fill: COLOR.tinta,
        bulletStyle: 'arrow',
        bulletColor: COLOR.terracota,
      }),
    )
    .join('\n');

  // Mini-comparativo canto inferior direito (frame com placeholder + ❌ + label) — coords ×2
  const compX = 1540;
  const compY = 1640;
  const compW = 400;
  const compH = 320;
  const xMark = `<g transform="translate(${compX + compW - 72}, ${compY + 24})">
    <circle r="28" cx="28" cy="28" fill="${COLOR.terracota}" />
    <path d="M16 16 L40 40 M40 16 L16 40" stroke="${COLOR.osso}" stroke-width="5" stroke-linecap="round" />
  </g>`;
  // Placeholder de produto inferior: silhueta abstrata
  const placeholderSilhouette = `<g transform="translate(${compX + 100}, ${compY + 60})">
    <rect x="0" y="40" width="120" height="160" fill="${COLOR.tinta40}" rx="8" opacity="0.4" />
    <rect x="40" y="0" width="40" height="44" fill="${COLOR.tinta40}" rx="4" opacity="0.5" />
  </g>`;
  const compLabel = drawHeadline({
    text: comparisonLabel,
    font: 'sans',
    weight: 500,
    size: 26,
    fill: COLOR.tinta65,
    x: compX + compW / 2,
    y: compY + compH - 44,
    anchor: 'center',
  });

  const compFrame = `<g>
    <rect x="${compX}" y="${compY}" width="${compW}" height="${compH}" fill="${COLOR.osso15}" stroke="${COLOR.tinta40}" stroke-width="2" />
    ${placeholderSilhouette}
    ${xMark}
    ${compLabel}
  </g>`;

  const svg = `<svg width="2000" height="2000" xmlns="http://www.w3.org/2000/svg">
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
