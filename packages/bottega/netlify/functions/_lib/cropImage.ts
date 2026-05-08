import sharp from 'sharp';

/**
 * Crop/resize pra dimensões alvo, removendo letterbox preto antes.
 *
 * Por quê o trim:
 * Gemini Image (gemini-2.5-flash-image) às vezes ignora aspectRatio e
 * retorna PNG com letterbox PRETO embutido (faixas top/bottom ou laterais).
 * Sem trim, o cover fit preserva esse letterbox no output final, fica feio.
 * sharp.trim() detecta bordas com cor uniforme (preta) e remove antes de
 * fazer o resize. Threshold 12 dá tolerância pra pixels não-perfeitos.
 *
 * Se a imagem não tem letterbox, trim é no-op (não afeta).
 */
export async function cropToSize(
  base64: string,
  targetWidth: number,
  targetHeight: number,
): Promise<{ base64: string; largura: number; altura: number }> {
  const buf = Buffer.from(base64, 'base64');
  const out = await sharp(buf)
    .trim({ background: 'black', threshold: 12 })
    .resize(targetWidth, targetHeight, { fit: 'cover', position: 'center' })
    .png({ quality: 90 })
    .toBuffer();
  return {
    base64: out.toString('base64'),
    largura: targetWidth,
    altura: targetHeight,
  };
}
