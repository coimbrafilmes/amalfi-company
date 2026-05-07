/**
 * Slot 7: PROVA FINAL / SOFISTICAÇÃO · 2000×2000
 * Pergunta: "Vale o investimento?"
 * Overlay: 2 tags discretos laterais (esquerda/direita), sem headline grande.
 */

import sharp from 'sharp';
import type { SlotParamsProvaFinal } from '../types';
import { drawTag } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsProvaFinal): Promise<Buffer> {
  const { tags } = params;

  const tag0 = tags[0];
  const tag1 = tags[1];

  const leftTag = tag0
    ? drawTag({
        x: 112,
        y: 920,
        iconKey: tag0.icon,
        label: tag0.label,
        bgFill: COLOR.osso,
        textColor: COLOR.tinta,
        iconColor: COLOR.ocre,
        fontSize: 32,
      })
    : '';

  // tag1 fica à direita; ajusta x baseado em estimativa de width (~560px após escala)
  const rightTag = tag1
    ? drawTag({
        x: 1400,
        y: 920,
        iconKey: tag1.icon,
        label: tag1.label,
        bgFill: COLOR.osso,
        textColor: COLOR.tinta,
        iconColor: COLOR.ocre,
        fontSize: 32,
      })
    : '';

  const svg = `<svg width="2000" height="2000" xmlns="http://www.w3.org/2000/svg">
    ${leftTag}
    ${rightTag}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
