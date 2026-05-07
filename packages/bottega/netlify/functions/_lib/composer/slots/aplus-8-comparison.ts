/**
 * A+ 8: COMPARISON THUMBNAIL · 220×220
 * Imagem pequena pra Amazon Comparison Charts. Sem overlay — passa-through limpo.
 * Garante PNG output (Sharp já fez resize 1:1 → 220×220 antes do composer).
 */

import sharp from 'sharp';
import type { SlotParamsAplusComparison } from '../types';

export async function compose(baseImage: Buffer, _params: SlotParamsAplusComparison): Promise<Buffer> {
  return sharp(baseImage).png({ quality: 92 }).toBuffer();
}
