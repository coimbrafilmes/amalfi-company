/**
 * Fontes vetorizadas via text-to-svg.
 * Texto vira <path> SVG (ortografia pixel-perfect, sem font deps em runtime).
 */

import TextToSVG from 'text-to-svg';
import path from 'node:path';
import { FONT_PATH, type FontKey } from './constants';

const cache: Partial<Record<FontKey, TextToSVG>> = {};

function loadFont(key: FontKey): TextToSVG {
  if (cache[key]) return cache[key]!;
  const fontFile = path.resolve(FONT_PATH[key]);
  const tts = TextToSVG.loadSync(fontFile);
  cache[key] = tts;
  return tts;
}

export interface TextPathOpts {
  text: string;
  fontKey: FontKey;
  fontSize: number;
  fill: string;
  x: number;
  y: number;
  /** 'left'|'center'|'right' horizontal · 'top'|'middle'|'baseline'|'bottom' vertical (default 'left top') */
  anchor?: string;
  letterSpacing?: number;
}

/** Retorna fragmento SVG `<path>` vetorizado pra ser embedded num <svg> maior. */
export function textPath(opts: TextPathOpts): string {
  const tts = loadFont(opts.fontKey);
  const d = tts.getD(opts.text, {
    fontSize: opts.fontSize,
    anchor: opts.anchor ?? 'left top',
    x: opts.x,
    y: opts.y,
    letterSpacing: opts.letterSpacing,
  });
  return `<path d="${d}" fill="${opts.fill}" />`;
}

/** Retorna metrics do texto (width, height) — útil pra layout adaptativo. */
export function textMetrics(opts: Pick<TextPathOpts, 'text' | 'fontKey' | 'fontSize' | 'letterSpacing'>) {
  const tts = loadFont(opts.fontKey);
  return tts.getMetrics(opts.text, {
    fontSize: opts.fontSize,
    letterSpacing: opts.letterSpacing,
  });
}
