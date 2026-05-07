/**
 * Slot 1: CAPA · 1024×1024
 * Pergunta: "É o produto que eu busquei?"
 * Overlay: NENHUM (Amazon exige capa limpa)
 * Apenas passa-through da imagem do Gemini.
 */

import sharp from 'sharp';
import type { SlotParamsCapa } from '../types';

export async function compose(baseImage: Buffer, _params: SlotParamsCapa): Promise<Buffer> {
  // Garante PNG output (pode receber JPEG do Gemini)
  return sharp(baseImage).png({ quality: 92 }).toBuffer();
}
