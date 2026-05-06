import sharp from 'sharp';

/**
 * Recebe base64 de imagem (sem prefixo data URI) e devolve cropada/redimensionada
 * pra dimensões alvo, mantendo o centro (cover fit).
 *
 * Usado pra ajustar saída do Gemini Image (4:3 → 970×600 pra A+ Content).
 */
export async function cropToSize(
  base64: string,
  targetWidth: number,
  targetHeight: number,
): Promise<{ base64: string; largura: number; altura: number }> {
  const buf = Buffer.from(base64, 'base64');
  const out = await sharp(buf)
    .resize(targetWidth, targetHeight, {
      fit: 'cover',
      position: 'center',
    })
    .png({ quality: 90 })
    .toBuffer();
  return {
    base64: out.toString('base64'),
    largura: targetWidth,
    altura: targetHeight,
  };
}
