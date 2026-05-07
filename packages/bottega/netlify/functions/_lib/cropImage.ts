import sharp from 'sharp';

/**
 * Crop center pra dimensões alvo (cover fit).
 * Usado pra ajustar saída Gemini (4:3 → 970×600 pra A+).
 */
export async function cropToSize(
  base64: string,
  targetWidth: number,
  targetHeight: number,
): Promise<{ base64: string; largura: number; altura: number }> {
  const buf = Buffer.from(base64, 'base64');
  const out = await sharp(buf)
    .resize(targetWidth, targetHeight, { fit: 'cover', position: 'center' })
    .png({ quality: 90 })
    .toBuffer();
  return {
    base64: out.toString('base64'),
    largura: targetWidth,
    altura: targetHeight,
  };
}
