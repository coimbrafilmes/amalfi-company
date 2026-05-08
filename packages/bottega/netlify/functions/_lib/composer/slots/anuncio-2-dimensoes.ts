/**
 * Slot 2: DIMENSÕES · 2000×2000
 * Pergunta: "Cabe no meu espaço? / O que recebo?"
 *
 * Layout (paridade Gumpinho — ver medidas.png + modulo-3.png):
 *   - Headline sans-bold topo: "Especificações Técnicas"
 *   - Produto centralizado em fundo claro studio (Gemini renderiza)
 *   - Callouts apontando partes do produto (drawCallout)
 *   - Régua vertical direita (drawVerticalRuler) com altura ou capacidade
 *   - Footer: nomeProduto · capacidade
 *
 * Fallback Bloco J: quando cotas em cm não disponíveis (ex: "Taça 320ml" só
 * tem capacidade), usa material/cor/capacidade como callouts e capacidade
 * na régua. Slot nunca fica vazio.
 */

import sharp from 'sharp';
import type { SlotParamsDimensoes } from '../types';
import { drawCallout, drawHeadline, drawVerticalRuler } from '../primitives';
import { COLOR } from '../constants';

const FRAME = 2000;

export async function compose(baseImage: Buffer, params: SlotParamsDimensoes): Promise<Buffer> {
  const { cotas, footerLabel, capacidade, material, cor } = params;

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

  const elements: string[] = [headlineSvg];

  // Mapear cotas por eixo
  const altura = cotas.find((c) => c.axis === 'altura');
  const largura = cotas.find((c) => c.axis === 'largura');
  const profundidade = cotas.find((c) => c.axis === 'profundidade');

  // ============================================================
  // Régua vertical à direita
  // ============================================================
  // Prioridade: altura > largura > capacidade (fallback)
  const rulerLabel = altura?.value ?? largura?.value ?? capacidade;
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

  // ============================================================
  // Callouts à esquerda — apontam partes do produto
  // ============================================================
  // Configuração: 1-3 callouts. Coords y verticalmente espaçadas.
  // Ordem de prioridade quando temos cotas físicas:
  //   1. Largura
  //   2. Profundidade
  //   3. Material (sempre)
  //
  // Quando cotas vazias (fallback Bloco J):
  //   1. Material
  //   2. Cor (se detectada)
  //   3. Capacidade (se não foi pra régua)
  //
  // Coords y: distribuídas em 3 alturas pra não sobrepor.
  const calloutSlots: Array<{ y: number }> = [
    { y: 600 },
    { y: 1000 },
    { y: 1400 },
  ];
  const calloutLabels: string[] = [];

  if (cotas.length > 0) {
    // Modo cotas: temos dimensões cm declaradas
    if (largura) calloutLabels.push(`Largura · ${largura.value}`);
    if (profundidade) calloutLabels.push(`Profundidade · ${profundidade.value}`);
    if (material) calloutLabels.push(`Material · ${material}`);
  } else {
    // Modo fallback: produto sem cm — usa material/cor/capacidade
    if (material) calloutLabels.push(`Material · ${material}`);
    if (cor) calloutLabels.push(`Cor · ${cor}`);
    // Capacidade só vai pra callout se a régua já estiver renderizando outra coisa.
    // Se rulerLabel === capacidade, ela já tá lá; senão adiciona aqui.
    if (capacidade && rulerLabel !== capacidade) {
      calloutLabels.push(`Capacidade · ${capacidade}`);
    }
  }

  calloutLabels.slice(0, 3).forEach((label, i) => {
    const slot = calloutSlots[i];
    elements.push(
      drawCallout({
        anchor: { x: 800, y: slot.y },
        labelEnd: { x: 360, y: slot.y },
        label,
        labelSide: 'left',
        fontSize: 36,
        fontWeight: 500,
        stroke: COLOR.tinta,
        textColor: COLOR.tinta,
        strokeWidth: 2,
      }),
    );
  });

  // Footer
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
