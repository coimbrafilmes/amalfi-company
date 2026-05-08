/**
 * Slot 3: LIFESTYLE + CALLOUTS · 2000×2000
 * Pergunta: "Como funciona / como é usar?"
 * Layout (paridade Gumpinho — ver 04_Imagens/3.png):
 *   - Headline sans-serif BOLD no topo
 *   - 3 pills retangulares cápsula no rodapé com ícone + label
 *
 * Pills > badges circulares: melhor legibilidade, padrão "infográfico
 * Amazon", texto não estoura mais, hierarquia visual mais forte.
 */

import sharp from 'sharp';
import type { SlotParamsLifestyleCallouts } from '../types';
import { drawHeadline, drawPill, drawSeal, measurePill } from '../primitives';
import { COLOR } from '../constants';

export async function compose(baseImage: Buffer, params: SlotParamsLifestyleCallouts): Promise<Buffer> {
  const { headline, callouts } = params;

  // Headline topo — sans-serif BOLD pesado dominante (paridade Gumpinho — banda topo cheia)
  const headlineSvg = drawHeadline({
    text: headline,
    font: 'sans',
    weight: 600,
    size: 96,
    fill: COLOR.tinta,
    x: 1000,
    y: 100,
    anchor: 'center',
  });

  // 3 pills horizontais no rodapé — bg branco/osso + ícone tinta + label sans bold.
  // Mede cada pill primeiro pra centralizar a row inteira.
  const pillFontSize = 32;
  const pillPaddingX = 28;
  const pillPaddingY = 16;
  const pillGap = 24;

  const pillSpecs = callouts.slice(0, 3).map((c) => ({
    iconKey: c.icon,
    label: c.label,
  }));

  const pillSizes = pillSpecs.map((s) =>
    measurePill({
      label: s.label,
      iconKey: s.iconKey,
      fontSize: pillFontSize,
      fontWeight: 600,
      paddingX: pillPaddingX,
      paddingY: pillPaddingY,
    }),
  );

  const totalRowWidth = pillSizes.reduce((sum, p) => sum + p.w, 0) + pillGap * (pillSpecs.length - 1);
  const rowStartX = (2000 - totalRowWidth) / 2;
  const rowY = 1820; // próximo do rodapé, mas com folga pra não cortar

  let cursorX = rowStartX;
  const pillsSvg = pillSpecs
    .map((s, i) => {
      const sz = pillSizes[i];
      const pill = drawPill({
        x: cursorX,
        y: rowY,
        label: s.label,
        iconKey: s.iconKey,
        bgFill: COLOR.osso,
        textColor: COLOR.tinta,
        iconColor: COLOR.tinta,
        borderStroke: COLOR.tinta40,
        borderWidth: 1.5,
        fontSize: pillFontSize,
        fontWeight: 600,
        paddingX: pillPaddingX,
        paddingY: pillPaddingY,
      });
      cursorX += sz.w + pillGap;
      return pill;
    })
    .join('\n');

  // Selo octogonal premium no canto superior direito
  const seal = drawSeal({
    cx: 1820,
    cy: 280,
    radius: 130,
    text: ['Curado', 'Amalfi'],
    fillColor: COLOR.ocre,
    borderColor: COLOR.tinta,
    textColor: COLOR.tinta,
  });

  const svg = `<svg width="2000" height="2000" xmlns="http://www.w3.org/2000/svg">
    ${headlineSvg}
    ${seal}
    ${pillsSvg}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg) }])
    .png({ quality: 92 })
    .toBuffer();
}
