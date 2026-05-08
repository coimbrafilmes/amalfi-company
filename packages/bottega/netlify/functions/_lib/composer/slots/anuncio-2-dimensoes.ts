/**
 * Slot 2: DIMENSÕES · 2000×2000
 * Pergunta: "Cabe no meu espaço?"
 *
 * Layout (paridade Gumpinho — ver medidas.png + modulo-3.png):
 *   - Headline sans-bold topo: "Especificações Técnicas"
 *   - Produto centralizado em fundo claro studio (Gemini renderiza)
 *   - Callouts apontando partes do produto (drawCallout):
 *       Largura → ponto-âncora no meio do produto, label à esquerda
 *       Profundidade → ponto-âncora na base do produto, label à esquerda abaixo
 *   - Régua vertical direita (drawVerticalRuler) com altura
 *   - Footer: nomeProduto · capacidade
 */

import sharp from 'sharp';
import type { SlotParamsDimensoes } from '../types';
import { drawCallout, drawHeadline, drawVerticalRuler } from '../primitives';
import { COLOR } from '../constants';

const FRAME = 2000;

export async function compose(baseImage: Buffer, params: SlotParamsDimensoes): Promise<Buffer> {
  const { cotas, footerLabel } = params;

  // Headline topo — sans bold
  const headlineSvg = drawHeadline({
    text: 'Especificações Técnicas',
    font: 'sans',
    weight: 600,
    size: 56,
    fill: COLOR.tinta,
    x: FRAME / 2,
    y: 90,
    anchor: 'center',
  });

  // Mapear cotas por eixo pra layout
  const altura = cotas.find((c) => c.axis === 'altura');
  const largura = cotas.find((c) => c.axis === 'largura');
  const profundidade = cotas.find((c) => c.axis === 'profundidade');

  const elements: string[] = [headlineSvg];

  // Régua vertical à direita com altura (se disponível)
  // Caso não haja altura, mas haja largura, usa largura como "extensão maior"
  const rulerLabel = altura?.value ?? largura?.value;
  if (rulerLabel) {
    elements.push(
      drawVerticalRuler({
        top: { x: 1720, y: 380 },
        bottom: { x: 1720, y: 1620 },
        label: rulerLabel,
        width: 50,
        tickCount: 24,
        fontSize: 44,
        stroke: COLOR.tinta,
        textColor: COLOR.tinta,
      }),
    );
  }

  // Callout largura — ponto-âncora no meio horizontal do produto, label esquerda
  if (largura) {
    elements.push(
      drawCallout({
        anchor: { x: 800, y: 900 },
        labelEnd: { x: 360, y: 900 },
        label: `Largura · ${largura.value}`,
        labelSide: 'left',
        fontSize: 36,
        fontWeight: 500,
        stroke: COLOR.tinta,
        textColor: COLOR.tinta,
        strokeWidth: 2,
      }),
    );
  }

  // Callout profundidade — ponto-âncora na base do produto, label esquerda
  if (profundidade) {
    elements.push(
      drawCallout({
        anchor: { x: 800, y: 1450 },
        labelEnd: { x: 360, y: 1450 },
        label: `Profundidade · ${profundidade.value}`,
        labelSide: 'left',
        fontSize: 36,
        fontWeight: 500,
        stroke: COLOR.tinta,
        textColor: COLOR.tinta,
        strokeWidth: 2,
      }),
    );
  }

  // Caso tenha altura E (não tem régua porque já usou ela acima) — adiciona callout de altura também
  // Quando rulerLabel veio de "altura", já está renderizado na régua. Quando rulerLabel veio de "largura"
  // (sem altura), nem precisa do callout de altura. Então não adiciona altura aqui.

  // Footer — nome do produto + capacidade
  const footer = drawHeadline({
    text: footerLabel,
    font: 'sans',
    weight: 500,
    size: 38,
    fill: COLOR.tinta,
    x: FRAME / 2,
    y: 1880,
    anchor: 'center',
  });
  elements.push(footer);

  const svg = `<svg width="${FRAME}" height="${FRAME}" xmlns="http://www.w3.org/2000/svg">
    ${elements.join('\n')}
  </svg>`;

  return sharp(baseImage)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png({ quality: 92 })
    .toBuffer();
}
