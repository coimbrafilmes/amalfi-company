/**
 * Reduz/comprime uma imagem do form antes de enviar pra Function.
 *
 * Por quê: Netlify Functions têm limite de payload (~6MB). Fotos do iPhone podem
 * ter 5-10MB cada; em base64 vira ~7-13MB. Com 3 fotos isso estoura. Resize
 * client-side via canvas pra max 1024×1024 (ratio preservado) deixa cada foto
 * em ~300-500KB base64 — confortável.
 *
 * Aceita File ou base64 data URI; retorna data URI base64 (image/jpeg quality 0.85).
 */

export async function resizeImageToBase64(
  source: File | string,
  maxDim = 1024,
  quality = 0.85,
): Promise<string> {
  const dataUri =
    source instanceof File ? await fileToDataUri(source) : source;

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
      // JPEG é mais leve que PNG pra fotos. Browsers todos suportam toDataURL.
      const out = canvas.toDataURL('image/jpeg', quality);
      resolve(out);
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
