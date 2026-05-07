/**
 * Primitivas reutilizáveis pra slot composers.
 * Cada função retorna fragmento SVG (string) pra ser concatenado num <svg> maior.
 */

import { textPath, textMetrics } from './fonts';
import { iconAt } from './icons';
import type { IconKey } from './types';
import { COLOR } from './constants';

// =====================================================
// HEADLINE (serif/italic/sans)
// =====================================================

export interface HeadlineOpts {
  text: string;
  font: 'serif' | 'italic' | 'sans';
  weight?: 400 | 500 | 600;
  size: number;
  fill: string;
  x: number;
  y: number;
  anchor?: 'left' | 'center' | 'right';
}

function fontKey(font: 'serif' | 'italic' | 'sans', weight: 400 | 500 | 600 = 400) {
  if (font === 'serif') return 'serif400' as const; // só temos 400
  if (font === 'italic') return weight === 500 ? ('italic500' as const) : ('italic400' as const);
  // sans
  if (weight === 500) return 'sans500' as const;
  if (weight === 600) return 'sans600' as const;
  return 'sans400' as const;
}

export function drawHeadline(opts: HeadlineOpts): string {
  return textPath({
    text: opts.text,
    fontKey: fontKey(opts.font, opts.weight),
    fontSize: opts.size,
    fill: opts.fill,
    x: opts.x,
    y: opts.y,
    anchor: `${opts.anchor ?? 'left'} top`,
  });
}

// =====================================================
// BULLET (texto com prefixo: arrow, dot, check)
// =====================================================

export interface BulletOpts {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
  font?: 'serif' | 'italic' | 'sans';
  bulletStyle: 'arrow' | 'dot' | 'check' | 'dash';
  bulletColor?: string;
}

export function drawBullet(opts: BulletOpts): string {
  const bulletGap = opts.fontSize * 0.6;
  const bulletColor = opts.bulletColor ?? opts.fill;
  let bulletGlyph: string;
  const cy = opts.y + opts.fontSize * 0.55;

  if (opts.bulletStyle === 'dot') {
    bulletGlyph = `<circle cx="${opts.x + opts.fontSize * 0.3}" cy="${cy}" r="${opts.fontSize * 0.18}" fill="${bulletColor}" />`;
  } else if (opts.bulletStyle === 'arrow') {
    const ax = opts.x;
    const ay = cy - opts.fontSize * 0.25;
    const aw = opts.fontSize * 0.7;
    bulletGlyph = `<path d="M${ax} ${ay + opts.fontSize * 0.25} L${ax + aw} ${ay + opts.fontSize * 0.25} M${ax + aw - 6} ${ay + opts.fontSize * 0.1} L${ax + aw} ${ay + opts.fontSize * 0.25} L${ax + aw - 6} ${ay + opts.fontSize * 0.4}" stroke="${bulletColor}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
  } else if (opts.bulletStyle === 'check') {
    bulletGlyph = iconAt('check', opts.x - 2, opts.y + opts.fontSize * 0.1, {
      stroke: bulletColor,
      size: opts.fontSize,
      strokeWidth: 2.5,
    });
  } else {
    // dash
    bulletGlyph = `<line x1="${opts.x}" y1="${cy}" x2="${opts.x + opts.fontSize * 0.5}" y2="${cy}" stroke="${bulletColor}" stroke-width="2" />`;
  }

  const text = textPath({
    text: opts.text,
    fontKey: fontKey(opts.font ?? 'sans', 400),
    fontSize: opts.fontSize,
    fill: opts.fill,
    x: opts.x + opts.fontSize + bulletGap,
    y: opts.y,
    anchor: 'left top',
  });

  return `<g>${bulletGlyph}${text}</g>`;
}

// =====================================================
// CIRCULAR BADGE (lifestyle slot: ícone + label)
// =====================================================

export interface BadgeOpts {
  cx: number;
  cy: number;
  radius: number;
  iconKey: IconKey;
  label: string;
  bgFill?: string;
  borderStroke?: string;
  iconColor?: string;
  textColor?: string;
}

export function drawCircularBadge(opts: BadgeOpts): string {
  const bg = opts.bgFill ?? COLOR.osso;
  const border = opts.borderStroke ?? COLOR.ocre;
  const iconColor = opts.iconColor ?? COLOR.tinta;
  const textColor = opts.textColor ?? COLOR.tinta;
  const iconSize = opts.radius * 0.55;
  const fontSize = opts.radius * 0.28;

  // Label pode ser 1-3 palavras curtas. Quebra em 2 linhas se > 1 palavra.
  const words = opts.label.split(' ');
  let lines: string[];
  if (words.length === 1) lines = words;
  else if (words.length === 2) lines = words;
  else lines = [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')];

  const labelStartY = opts.cy + iconSize * 0.7;
  const lineGap = fontSize * 1.15;

  const labels = lines
    .map((line, i) =>
      textPath({
        text: line,
        fontKey: 'sans500',
        fontSize,
        fill: textColor,
        x: opts.cx,
        y: labelStartY + i * lineGap,
        anchor: 'center top',
      }),
    )
    .join('');

  const icon = iconAt(opts.iconKey, opts.cx - iconSize / 2, opts.cy - iconSize - opts.radius * 0.15, {
    stroke: iconColor,
    size: iconSize,
    strokeWidth: 2,
  });

  return `<g>
    <circle cx="${opts.cx}" cy="${opts.cy}" r="${opts.radius}" fill="${bg}" stroke="${border}" stroke-width="2" />
    ${icon}
    ${labels}
  </g>`;
}

// =====================================================
// TAG (retangular elegante: ícone + label)
// =====================================================

export interface TagOpts {
  x: number;
  y: number;
  iconKey?: IconKey;
  label: string;
  bgFill?: string;
  textColor?: string;
  paddingX?: number;
  paddingY?: number;
  fontSize?: number;
  iconColor?: string;
  borderRadius?: number;
}

export function drawTag(opts: TagOpts): string {
  const fontSize = opts.fontSize ?? 16;
  const paddingX = opts.paddingX ?? 14;
  const paddingY = opts.paddingY ?? 10;
  const iconSize = fontSize * 1.1;
  const iconGap = opts.iconKey ? iconSize + 8 : 0;
  const bg = opts.bgFill ?? COLOR.osso;
  const textColor = opts.textColor ?? COLOR.tinta;
  const borderRadius = opts.borderRadius ?? 4;

  const metrics = textMetrics({ text: opts.label, fontKey: 'sans500', fontSize });
  const w = paddingX * 2 + iconGap + metrics.width;
  const h = paddingY * 2 + fontSize * 1.2;

  const iconSvg = opts.iconKey
    ? iconAt(opts.iconKey, opts.x + paddingX, opts.y + (h - iconSize) / 2, {
        stroke: opts.iconColor ?? textColor,
        size: iconSize,
      })
    : '';

  const labelSvg = textPath({
    text: opts.label,
    fontKey: 'sans500',
    fontSize,
    fill: textColor,
    x: opts.x + paddingX + iconGap,
    y: opts.y + (h - fontSize) / 2,
    anchor: 'left top',
  });

  return `<g>
    <rect x="${opts.x}" y="${opts.y}" width="${w}" height="${h}" rx="${borderRadius}" fill="${bg}" />
    ${iconSvg}
    ${labelSvg}
  </g>`;
}

// =====================================================
// PILL (variante do tag, mais arredondado, sem ícone obrigatório)
// =====================================================

export function drawPill(opts: {
  x: number;
  y: number;
  label: string;
  bgFill?: string;
  textColor?: string;
  fontSize?: number;
  paddingX?: number;
  paddingY?: number;
}): string {
  const fontSize = opts.fontSize ?? 15;
  const paddingX = opts.paddingX ?? 18;
  const paddingY = opts.paddingY ?? 9;
  const bg = opts.bgFill ?? COLOR.osso;
  const textColor = opts.textColor ?? COLOR.tinta;

  const metrics = textMetrics({ text: opts.label, fontKey: 'sans500', fontSize });
  const w = paddingX * 2 + metrics.width;
  const h = paddingY * 2 + fontSize * 1.2;

  const labelSvg = textPath({
    text: opts.label,
    fontKey: 'sans500',
    fontSize,
    fill: textColor,
    x: opts.x + paddingX,
    y: opts.y + (h - fontSize) / 2,
    anchor: 'left top',
  });

  return `<g>
    <rect x="${opts.x}" y="${opts.y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" />
    ${labelSvg}
  </g>`;
}

// =====================================================
// DIMENSION LINE (cota com setas + label)
// =====================================================

export interface DimensionLineOpts {
  /** ponto inicial e final da cota. */
  from: { x: number; y: number };
  to: { x: number; y: number };
  label: string; // ex: "16 cm"
  stroke?: string;
  textColor?: string;
  fontSize?: number;
  /** Lado em que o texto fica relativo à linha (default 'above' pra horizontal, 'right' pra vertical) */
  textPosition?: 'above' | 'below' | 'left' | 'right';
  dashed?: boolean;
}

export function drawDimensionLine(opts: DimensionLineOpts): string {
  const stroke = opts.stroke ?? COLOR.tinta;
  const textColor = opts.textColor ?? COLOR.tinta;
  const fontSize = opts.fontSize ?? 22;
  const dashAttr = opts.dashed ? 'stroke-dasharray="6 4"' : '';

  const isHorizontal = Math.abs(opts.to.x - opts.from.x) > Math.abs(opts.to.y - opts.from.y);
  const arrowSize = 10;

  // Setas em forma de < e > (horizontal) ou ^ v (vertical)
  let arrowFrom: string;
  let arrowTo: string;
  if (isHorizontal) {
    arrowFrom = `<path d="M${opts.from.x + arrowSize} ${opts.from.y - arrowSize / 2} L${opts.from.x} ${opts.from.y} L${opts.from.x + arrowSize} ${opts.from.y + arrowSize / 2}" stroke="${stroke}" stroke-width="2" fill="none" />`;
    arrowTo = `<path d="M${opts.to.x - arrowSize} ${opts.to.y - arrowSize / 2} L${opts.to.x} ${opts.to.y} L${opts.to.x - arrowSize} ${opts.to.y + arrowSize / 2}" stroke="${stroke}" stroke-width="2" fill="none" />`;
  } else {
    arrowFrom = `<path d="M${opts.from.x - arrowSize / 2} ${opts.from.y + arrowSize} L${opts.from.x} ${opts.from.y} L${opts.from.x + arrowSize / 2} ${opts.from.y + arrowSize}" stroke="${stroke}" stroke-width="2" fill="none" />`;
    arrowTo = `<path d="M${opts.to.x - arrowSize / 2} ${opts.to.y - arrowSize} L${opts.to.x} ${opts.to.y} L${opts.to.x + arrowSize / 2} ${opts.to.y - arrowSize}" stroke="${stroke}" stroke-width="2" fill="none" />`;
  }

  const line = `<line x1="${opts.from.x}" y1="${opts.from.y}" x2="${opts.to.x}" y2="${opts.to.y}" stroke="${stroke}" stroke-width="2" ${dashAttr} />`;

  // Label position
  const cx = (opts.from.x + opts.to.x) / 2;
  const cy = (opts.from.y + opts.to.y) / 2;
  const offset = fontSize * 0.6;
  let labelX = cx;
  let labelY: number;
  let anchor: string;

  if (isHorizontal) {
    if (opts.textPosition === 'below') {
      labelY = cy + offset;
      anchor = 'center top';
    } else {
      labelY = cy - offset - fontSize;
      anchor = 'center top';
    }
  } else {
    if (opts.textPosition === 'left') {
      labelX = cx - offset;
      anchor = 'right top';
    } else {
      labelX = cx + offset;
      anchor = 'left top';
    }
    labelY = cy - fontSize / 2;
  }

  const label = textPath({
    text: opts.label,
    fontKey: 'sans500',
    fontSize,
    fill: textColor,
    x: labelX,
    y: labelY,
    anchor,
  });

  return `<g>${line}${arrowFrom}${arrowTo}${label}</g>`;
}

// =====================================================
// CHECKMARK COM TEXTO (slot validação)
// =====================================================

export function drawCheckText(opts: {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  textColor?: string;
  checkColor?: string;
}): string {
  const fontSize = opts.fontSize ?? 20;
  const textColor = opts.textColor ?? COLOR.osso;
  const checkColor = opts.checkColor ?? COLOR.validacao;
  const checkSize = fontSize * 1.2;

  const check = iconAt('circle-check', opts.x, opts.y, {
    stroke: checkColor,
    size: checkSize,
    strokeWidth: 2.5,
  });

  const text = textPath({
    text: opts.text,
    fontKey: 'sans500',
    fontSize,
    fill: textColor,
    x: opts.x + checkSize + 12,
    y: opts.y + (checkSize - fontSize) / 2,
    anchor: 'left top',
  });

  return `<g>${check}${text}</g>`;
}

// =====================================================
// SPLIT DIVIDER (linha vertical/horizontal)
// =====================================================

export function drawSplitDivider(opts: {
  width: number;
  height: number;
  axis: 'vertical' | 'horizontal';
  position: number; // 0-1 (proporcional)
  stroke?: string;
  strokeWidth?: number;
}): string {
  const stroke = opts.stroke ?? COLOR.tinta;
  const sw = opts.strokeWidth ?? 2;
  if (opts.axis === 'vertical') {
    const x = opts.width * opts.position;
    return `<line x1="${x}" y1="0" x2="${x}" y2="${opts.height}" stroke="${stroke}" stroke-width="${sw}" />`;
  }
  const y = opts.height * opts.position;
  return `<line x1="0" y1="${y}" x2="${opts.width}" y2="${y}" stroke="${stroke}" stroke-width="${sw}" />`;
}

// =====================================================
// HEADER LABEL (eyebrow uppercase tracked)
// =====================================================

export function drawEyebrow(opts: {
  text: string;
  x: number;
  y: number;
  fill?: string;
  fontSize?: number;
}): string {
  const fontSize = opts.fontSize ?? 12;
  const fill = opts.fill ?? COLOR.tinta65;
  return textPath({
    text: opts.text.toUpperCase(),
    fontKey: 'sans500',
    fontSize,
    fill,
    x: opts.x,
    y: opts.y,
    anchor: 'left top',
    letterSpacing: 0.18,
  });
}
