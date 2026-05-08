/**
 * Slot 4: COMPARATIVO + VALIDAÇÃO · 2000×2000
 * Pergunta: "Por que esse e não o concorrente genérico?"
 *
 * Layout (paridade Gumpinho — modulo-5.png):
 *   - Headline sans-bold topo (ocupa toda largura)
 *   - Lado esquerdo (40%): card "Genérico" com silhueta + 3 X features negativas
 *   - Lado direito (60%): produto Amalfi (Gemini) + 3-4 ✓ features positivas
 *
 * Diferente da versão anterior (mini-canto), agora split é dominante visual.
 */

import sharp from 'sharp';
import type { SlotParamsComparativo } from '../types';
import { drawHeadline, drawCheckText } from '../primitives';
import { iconAt } from '../icons';
import { COLOR } from '../constants';

const FRAME = 2000;

export async function compose(baseImage: Buffer, params: SlotParamsComparativo): Promise<Buffer> {
  const { headline, bullets } = params;

  // Headline topo — sans-bold ocupando toda a largura
  const headlineSvg = drawHeadline({
    text: 'O Investimento Certo',
    font: 'sans',
    weight: 600,
    size: 80,
    fill: COLOR.tinta,
    x: FRAME / 2,
    y: 100,
    anchor: 'center',
  });

  // === LADO ESQUERDO (40%) — Genérico ===
  const leftX = 80;
  const leftW = 720;
  const leftY = 280;
  const leftH = 1480;

  const leftFrame = `<rect x="${leftX}" y="${leftY}" width="${leftW}" height="${leftH}" fill="${COLOR.areia}" rx="12" />`;

  // Label superior centralizada "Comum" (fundo escuro)
  const leftLabelBg = `<rect x="${leftX + leftW / 2 - 140}" y="${leftY + 30}" width="280" height="64" rx="32" fill="${COLOR.tinta}" />`;
  const leftLabel = drawHeadline({
    text: 'Comum',
    font: 'sans',
    weight: 600,
    size: 28,
    fill: COLOR.osso,
    x: leftX + leftW / 2,
    y: leftY + 50,
    anchor: 'center',
  });

  // Silhueta abstrata genérica (placeholder retangular cinza)
  const silSvg = `<g transform="translate(${leftX + leftW / 2 - 140}, ${leftY + 200})">
    <rect x="40" y="80" width="200" height="280" fill="${COLOR.tinta40}" rx="8" opacity="0.5" />
    <rect x="100" y="0" width="80" height="100" fill="${COLOR.tinta40}" rx="6" opacity="0.5" />
  </g>`;

  // 3 X features negativas no lado esquerdo (rodapé do card)
  const negFeatures = ['Qualidade comum', 'Sem destaque', 'Sem curadoria'];
  const negStartY = leftY + 760;
  const negGap = 110;
  const xMarkColor = COLOR.terracota;
  const negSvgs = negFeatures
    .map((feat, i) => {
      const ny = negStartY + i * negGap;
      const xMark = `<g transform="translate(${leftX + 70}, ${ny - 22})">
        <circle r="22" cx="22" cy="22" fill="${xMarkColor}" />
        <path d="M14 14 L30 30 M30 14 L14 30" stroke="${COLOR.osso}" stroke-width="3.5" stroke-linecap="round" />
      </g>`;
      const txt = drawHeadline({
        text: feat,
        font: 'sans',
        weight: 500,
        size: 32,
        fill: COLOR.tinta,
        x: leftX + 130,
        y: ny - 16,
        anchor: 'left',
      });
      return `<g>${xMark}${txt}</g>`;
    })
    .join('\n');

  // === LADO DIREITO (60%) — produto vem do Gemini ===
  // Coords pra ✓ checks no lado direito (sobre área que Gemini deixa livre)
  const rightStartX = 880;
  // 3 ou 4 features positivas — usa bullets do params (3) + 1 fixa premium
  const posFeatures = bullets.slice(0, 3);
  while (posFeatures.length < 3) posFeatures.push('Acabamento curado');
  posFeatures.push('Curadoria Amalfi');

  const posStartY = 760;
  const posGap = 110;
  const posSvgs = posFeatures
    .slice(0, 4)
    .map((feat, i) =>
      drawCheckText({
        text: feat,
        x: rightStartX,
        y: posStartY + i * posGap,
        fontSize: 32,
        textColor: COLOR.tinta,
        checkColor: COLOR.validacao,
      }),
    )
    .join('\n');

  // Label "Halter Amalfi" no rodapé direito (ícone selo dourado)
  const rightLabelBg = `<rect x="${rightStartX}" y="${posStartY - 90}" width="320" height="64" rx="32" fill="${COLOR.ocre}" />`;
  const rightLabel = drawHeadline({
    text: 'Curadoria Amalfi',
    font: 'sans',
    weight: 600,
    size: 28,
    fill: COLOR.tinta,
    x: rightStartX + 160,
    y: posStartY - 70,
    anchor: 'center',
  });

  // Suprime warning de import não usado quando iconAt não é necessário aqui
  void iconAt;

  const svg = `<svg width="${FRAME}" height="${FRAME}" xmlns="http://www.w3.org/2000/svg">
    ${headlineSvg}
    ${leftFrame}
    ${leftLabelBg}
    ${leftLabel}
    ${silSvg}
    ${negSvgs}
    ${rightLabelBg}
    ${rightLabel}
    ${posSvgs}
  </svg>`;

  // Suprime headline (do params) e bullets/comparisonLabel — agora controlados
  // por padrão fixo Gumpinho-style (headline "O Investimento Certo", labels
  // "Comum" / "Curadoria Amalfi"). Mantém compatibilidade com type ainda.
  void headline;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
