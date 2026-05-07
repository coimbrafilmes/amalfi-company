/**
 * Resize/compress de imagens client-side antes de enviar pra Function.
 * Reduz payload — Netlify limit ~6MB.
 *
 * Aceita File ou base64 data URI; retorna data URI image/jpeg q=0.85, max 1024×1024.
 */

export async function resizeImageToBase64(
  source: File | string,
  maxDim = 1024,
  quality = 0.85,
): Promise<string> {
  const dataUri = source instanceof File ? await fileToDataUri(source) : source;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      let targetW = width;
      let targetH = height;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          targetW = maxDim;
          targetH = Math.round(height * (maxDim / width));
        } else {
          targetH = maxDim;
          targetW = Math.round(width * (maxDim / height));
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context não disponível'));
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = dataUri;
  });
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}
