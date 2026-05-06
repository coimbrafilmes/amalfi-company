/** Converte string em slug seguro pra paths/IDs */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 64);
}

/** Gera ID único legível (timestamp + slug curto) */
export function gerarId(prefixo: string = 'anuncio'): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `${prefixo}-${ts}-${rand}`;
}
