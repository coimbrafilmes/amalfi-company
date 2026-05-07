/**
 * Biblioteca curada de ícones SVG do lucide-static.
 *
 * Carregamos via fs.readFileSync uma vez (no import) e cacheamos.
 * Total ~30 ícones × ~500 bytes = ~15KB embedded.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { IconKey } from './types';

const ICON_DIR = path.resolve('node_modules/lucide-static/icons');

const ICON_FILE: Record<IconKey, string> = {
  drop: 'droplet.svg',
  sparkle: 'sparkles.svg',
  clock: 'clock.svg',
  check: 'check.svg',
  crown: 'crown.svg',
  diamond: 'gem.svg', // alias
  gem: 'gem.svg',
  leaf: 'leaf.svg',
  soap: 'droplet.svg', // alias visual
  brush: 'brush.svg',
  tube: 'spray-can.svg',
  palette: 'palette.svg',
  ruler: 'ruler.svg',
  scale: 'scale.svg',
  recycle: 'recycle.svg',
  shield: 'shield.svg',
  star: 'star.svg',
  'circle-check': 'circle-check.svg',
  'arrow-right': 'arrow-right.svg',
  home: 'home.svg',
  'spray-can': 'spray-can.svg',
  feather: 'feather.svg',
  tag: 'tag.svg',
  'cup-soda': 'cup-soda.svg',
  'glass-water': 'glass-water.svg',
  package: 'package.svg',
  'circle-dot': 'circle-dot.svg',
};

const cache: Partial<Record<IconKey, string>> = {};

function loadIcon(key: IconKey): string {
  if (cache[key]) return cache[key]!;
  const file = path.join(ICON_DIR, ICON_FILE[key]);
  const raw = fs.readFileSync(file, 'utf8');
  cache[key] = raw;
  return raw;
}

export interface IconRenderOpts {
  /** stroke color (lucide ícones são stroke-based) */
  stroke?: string;
  /** Tamanho px (square) */
  size?: number;
  /** Stroke width (default 2) */
  strokeWidth?: number;
}

/**
 * Retorna `<g>` com o conteúdo do ícone trasladado pra (x, y) e dimensionado.
 * Lucide SVGs vêm 24×24 com `stroke="currentColor"` — substituímos.
 */
export function iconAt(key: IconKey, x: number, y: number, opts: IconRenderOpts = {}): string {
  const stroke = opts.stroke ?? 'currentColor';
  const size = opts.size ?? 24;
  const strokeWidth = opts.strokeWidth ?? 2;
  const scale = size / 24;

  const svg = loadIcon(key);
  // Extrai conteúdo interno do <svg>...</svg>
  const innerMatch = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  const inner = innerMatch ? innerMatch[1] : svg;
  // Substitui currentColor por stroke específica
  const colored = inner
    .replace(/stroke="currentColor"/g, `stroke="${stroke}"`)
    .replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`);

  return `<g transform="translate(${x}, ${y}) scale(${scale})">${colored}</g>`;
}
