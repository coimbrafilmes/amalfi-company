/**
 * Slot params extractor — converte form + analise + descricao em params específicos
 * pra cada um dos 13 slots da composition layer.
 */

import type {
  AnaliseDeMercado,
  CriacaoForm,
  DescricaoResult,
  SlotKind,
} from '../../../src/types/anuncio';
import type { IconKey, SlotParamsByKind } from './composer/types';

// =====================================================
// PARSERS de detalhesTecnicos
// =====================================================

function parseCotas(text: string): Array<{ axis: 'largura' | 'altura' | 'profundidade'; value: string }> {
  const cotas: Array<{ axis: 'largura' | 'altura' | 'profundidade'; value: string }> = [];
  const lower = text.toLowerCase();

  // "cm" opcional — aceita "altura: 16", "altura 16cm", "16cm altura"
  const altura = lower.match(/altura[:\s]*(\d+(?:[.,]\d+)?)\s*cm?/i)
    ?? lower.match(/(\d+(?:[.,]\d+)?)\s*cm?\s*(?:de\s*)?altura/i)
    ?? null;
  if (altura) cotas.push({ axis: 'altura', value: `${altura[1].replace(',', '.')} cm` });

  const largura = lower.match(/largura[:\s]*(\d+(?:[.,]\d+)?)\s*cm?/i)
    ?? lower.match(/(\d+(?:[.,]\d+)?)\s*cm?\s*(?:de\s*)?largura/i)
    ?? null;
  if (largura) cotas.push({ axis: 'largura', value: `${largura[1].replace(',', '.')} cm` });

  const prof = lower.match(/profundidade[:\s]*(\d+(?:[.,]\d+)?)\s*cm?/i)
    ?? lower.match(/(\d+(?:[.,]\d+)?)\s*cm?\s*(?:de\s*)?profundidade/i)
    ?? lower.match(/comprimento[:\s]*(\d+(?:[.,]\d+)?)\s*cm?/i)
    ?? null;
  if (prof) cotas.push({ axis: 'profundidade', value: `${prof[1].replace(',', '.')} cm` });

  // Fallback: "AxBxC" com ou sem "cm" no fim
  if (cotas.length === 0) {
    const dim = text.match(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*cm?/i);
    if (dim) {
      cotas.push({ axis: 'largura', value: `${dim[1].replace(',', '.')} cm` });
      cotas.push({ axis: 'altura', value: `${dim[2].replace(',', '.')} cm` });
      cotas.push({ axis: 'profundidade', value: `${dim[3].replace(',', '.')} cm` });
    }
  }

  // Fallback 2: "AxB" (2D — assume LxA, profundidade omitida)
  if (cotas.length === 0) {
    const dim2 = text.match(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*cm?/i);
    if (dim2) {
      cotas.push({ axis: 'largura', value: `${dim2[1].replace(',', '.')} cm` });
      cotas.push({ axis: 'altura', value: `${dim2[2].replace(',', '.')} cm` });
    }
  }

  return cotas;
}

function parseCapacidade(text: string): string | null {
  const m = text.match(/(\d+)\s*ml/i) ?? text.match(/(\d+)\s*L\b/i);
  if (m) return /ml/i.test(m[0]) ? `${m[1]}ml` : `${m[1]}L`;
  return null;
}

// =====================================================
// HEADLINE PATTERNS (do blueprint Marco)
// =====================================================

const PATTERNS_ASPIRACIONAL = [
  'Transforme seu cantinho',
  'Pequenos detalhes que mudam o ambiente',
  'Sofisticação que cabe na sua casa',
  'A elegância do dia a dia',
];

const PATTERNS_BENEFICIOS = [
  'Organização e Praticidade',
  'Conforto e Durabilidade',
  'Funcionalidade e Estilo',
  'Higiene e Beleza',
];

const PATTERNS_APLUS_CTA = [
  'Eleve seu Ambiente',
  'O detalhe que faz a diferença',
  'Sua casa, mais Amalfi',
];

function pickHeadline(patterns: string[], seed: string): string {
  const idx = Math.abs(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % patterns.length;
  return patterns[idx];
}

// =====================================================
// ICON INFERENCE (mapeia palavras-chave → IconKey)
// =====================================================

function inferIcon(label: string): IconKey {
  const t = label.toLowerCase();
  if (/dosagem|gota|líquid|água|hidrat/i.test(t)) return 'drop';
  if (/limpa|brilha|polid|sparkle|brilh/i.test(t)) return 'sparkle';
  if (/conforto|tempo|prático/i.test(t)) return 'clock';
  if (/qualidade|premium|nobre|sofistic/i.test(t)) return 'gem';
  if (/proteç|seguranç|garant/i.test(t)) return 'shield';
  if (/escov|maquia|pinc/i.test(t)) return 'brush';
  if (/spray|tube|aroma/i.test(t)) return 'spray-can';
  if (/copo|recipiente|vidro/i.test(t)) return 'glass-water';
  if (/folh|verde|natural|sustenta/i.test(t)) return 'leaf';
  if (/casa|lar|residenc/i.test(t)) return 'home';
  if (/durab|robust|resist/i.test(t)) return 'shield';
  if (/cor|paleta|design|estética/i.test(t)) return 'palette';
  if (/dimens|tamanho|cm/i.test(t)) return 'ruler';
  if (/peso|kg|leve/i.test(t)) return 'scale';
  if (/recicl|sustent/i.test(t)) return 'recycle';
  if (/embalag|conteúdo|kit/i.test(t)) return 'package';
  return 'circle-dot';
}

// =====================================================
// EXTRACTOR
// =====================================================

export function extractSlotParams<K extends SlotKind>(
  slot: K,
  form: CriacaoForm,
  analise: AnaliseDeMercado,
  descricao: DescricaoResult,
): SlotParamsByKind[K] {
  const cotas = parseCotas(form.detalhesTecnicos);
  const capacidade = parseCapacidade(form.detalhesTecnicos);
  const motivacoesShort = analise.motivacoes.map((m) => shorten(m, 28));
  const dor1 = analise.dores[0]?.titulo ?? 'Bagunça visual';

  switch (slot) {
    case 'anuncio-capa':
      return {} as SlotParamsByKind[K];

    case 'anuncio-dimensoes': {
      const footerLabel = capacidade
        ? `${shorten(form.nomeProduto, 30)} · ${capacidade}`
        : shorten(form.nomeProduto, 40);
      return { cotas, footerLabel } as SlotParamsByKind[K];
    }

    case 'anuncio-lifestyle-callouts': {
      const headline = analise.persona.label.length <= 28
        ? analise.persona.label
        : 'O essencial bem-feito';
      const callouts = motivacoesShort.slice(0, 3).map((label) => ({
        icon: inferIcon(label),
        label,
      }));
      // garante 3 callouts (preenche se faltar)
      while (callouts.length < 3) callouts.push({ icon: 'circle-dot', label: 'Curado' });
      return { headline, callouts } as SlotParamsByKind[K];
    }

    case 'anuncio-comparativo': {
      const eyebrow = 'ACABAMENTO E DURABILIDADE';
      const headline = 'Qualidade e Confiança';
      const bullets = (descricao.bulletPoints ?? motivacoesShort).slice(0, 3).map((b) => shorten(b, 38));
      while (bullets.length < 3) bullets.push('Detalhe que dura');
      return {
        eyebrow,
        headline,
        bullets,
        comparisonLabel: 'Falta de Qualidade',
      } as SlotParamsByKind[K];
    }

    case 'anuncio-aspiracional': {
      const headline = pickHeadline(PATTERNS_ASPIRACIONAL, form.nomeProduto);
      const subBullets = motivacoesShort.slice(0, 3);
      while (subBullets.length < 3) subBullets.push('Curadoria Amalfi');
      return { headline, subBullets } as SlotParamsByKind[K];
    }

    case 'anuncio-beneficios': {
      const headline = pickHeadline(PATTERNS_BENEFICIOS, form.nomeProduto);
      const bullets = motivacoesShort.slice(0, 3).map((b) => shorten(b, 42));
      while (bullets.length < 3) bullets.push('Sem complicação');
      return { headline, bullets } as SlotParamsByKind[K];
    }

    case 'anuncio-prova-final': {
      const tags = [
        { icon: 'gem' as IconKey, label: 'Design Sofisticado' },
        { icon: 'crown' as IconKey, label: 'Acabamento Premium' },
      ];
      return { tags } as SlotParamsByKind[K];
    }

    case 'aplus-header': {
      const headline = analise.persona.label.length <= 26
        ? analise.persona.label
        : 'Pequenos gestos costeiros';
      const sub = 'Curado com calma, levado com cuidado.';
      const badges = [
        { icon: 'gem' as IconKey, label: 'Design Sofisticado' },
        { icon: 'crown' as IconKey, label: 'Acabamento Premium' },
      ];
      return { headline, sub, badges } as SlotParamsByKind[K];
    }

    case 'aplus-antes-depois': {
      const features = (descricao.amazonBulletPoints ?? motivacoesShort)
        .slice(0, 4)
        .map((b) => shorten(b.split(':')[0] ?? b, 30));
      while (features.length < 4) features.push('Acabamento curado');
      return { features } as SlotParamsByKind[K];
    }

    case 'aplus-specs': {
      const altura = cotas.find((c) => c.axis === 'altura')?.value ?? '—';
      const calloutsBase: Array<{ icon: IconKey; titulo: string; spec: string }> = [];
      if (capacidade) calloutsBase.push({ icon: 'glass-water', titulo: 'Capacidade', spec: capacidade });
      const largura = cotas.find((c) => c.axis === 'largura')?.value;
      if (largura) calloutsBase.push({ icon: 'ruler', titulo: 'Largura', spec: largura });
      calloutsBase.push({ icon: 'gem', titulo: 'Material', spec: detectMaterial(form.detalhesTecnicos) });
      calloutsBase.push({ icon: 'shield', titulo: 'Durabilidade', spec: 'Reforçada' });
      while (calloutsBase.length < 4) {
        calloutsBase.push({ icon: 'circle-dot', titulo: 'Detalhe', spec: 'Curado' });
      }
      return { altura, callouts: calloutsBase.slice(0, 4) } as SlotParamsByKind[K];
    }

    case 'aplus-casos-uso': {
      const usos = inferUsos(form.nomeProduto, dor1);
      return { usos } as SlotParamsByKind[K];
    }

    case 'aplus-validacao': {
      const callouts = motivacoesShort.slice(0, 3).map((m) => shorten(m, 24));
      while (callouts.length < 3) callouts.push('Curado');
      return { callouts } as SlotParamsByKind[K];
    }

    case 'aplus-cta': {
      const headline = pickHeadline(PATTERNS_APLUS_CTA, form.nomeProduto);
      const subCta = 'Compre agora';
      const miniFeatures = motivacoesShort.slice(0, 3).map((b) => shorten(b, 22));
      while (miniFeatures.length < 3) miniFeatures.push('Detalhe Amalfi');
      return { headline, subCta, miniFeatures } as SlotParamsByKind[K];
    }

    case 'aplus-premium': {
      // Hero amplificado (1464×600) — mesma intenção que aplus-header mas com 3 badges em vez de 2
      const headline = analise.persona.label.length <= 30
        ? analise.persona.label
        : 'Pequenos gestos costeiros';
      const sub = 'Curado com calma, levado com cuidado.';
      const badges = [
        { icon: 'gem' as IconKey, label: 'Design Sofisticado' },
        { icon: 'crown' as IconKey, label: 'Acabamento Premium' },
        { icon: 'shield' as IconKey, label: 'Durabilidade Real' },
      ];
      return { headline, sub, badges } as SlotParamsByKind[K];
    }

    case 'aplus-comparison':
      // Thumbnail 220×220 — sem overlay, passa-through
      return {} as SlotParamsByKind[K];

    default:
      throw new Error(`extractSlotParams: slot desconhecido ${slot}`);
  }
}

// =====================================================
// HELPERS
// =====================================================

/**
 * Encurta texto para `max` chars cortando no espaço mais próximo (não quebra palavra).
 * Não adiciona ellipsis quando a palavra cortada já é o final natural do texto.
 */
function shorten(text: string, max: number): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;

  // Busca último espaço antes do limite — preserva palavra inteira
  const slice = trimmed.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  // Se o espaço estiver muito no início (< 60% do max), corta direto e adiciona ellipsis
  if (lastSpace < max * 0.6) {
    return slice.trimEnd() + '…';
  }
  return trimmed.slice(0, lastSpace).trimEnd() + '…';
}

function detectMaterial(text: string): string {
  const lower = text.toLowerCase();
  if (/vidro/.test(lower)) return 'Vidro';
  if (/alumín/.test(lower)) return 'Alumínio';
  if (/inox/.test(lower)) return 'Inox';
  if (/madeira/.test(lower)) return 'Madeira';
  if (/cerâmic/.test(lower)) return 'Cerâmica';
  if (/abs|plástic/.test(lower)) return 'ABS';
  if (/zamac/.test(lower)) return 'Zamac';
  if (/metal/.test(lower)) return 'Metal';
  if (/algodão|linho|tecido/.test(lower)) return 'Tecido natural';
  return 'Material nobre';
}

function inferUsos(nomeProduto: string, _dor: string): Array<{ icon: IconKey; label: string }> {
  const lower = nomeProduto.toLowerCase();
  // Heurística por categoria: dispenser/copo → 4 usos típicos de banho
  if (/dispenser|sabonete|pump/.test(lower)) {
    return [
      { icon: 'drop', label: 'Para Sabonete' },
      { icon: 'brush', label: 'Para Escovas' },
      { icon: 'spray-can', label: 'Pasta de Dente' },
      { icon: 'palette', label: 'Para Maquiagem' },
    ];
  }
  if (/tomada|elétric/.test(lower)) {
    return [
      { icon: 'home', label: 'Sala' },
      { icon: 'package', label: 'Cozinha' },
      { icon: 'shield', label: 'Quarto' },
      { icon: 'sparkle', label: 'Escritório' },
    ];
  }
  if (/copo|jarra|cerâmic/.test(lower)) {
    return [
      { icon: 'glass-water', label: 'Para Água' },
      { icon: 'cup-soda', label: 'Para Suco' },
      { icon: 'brush', label: 'Para Escovas' },
      { icon: 'palette', label: 'Para Pincéis' },
    ];
  }
  // fallback genérico
  return [
    { icon: 'home', label: 'Em Casa' },
    { icon: 'leaf', label: 'No Dia a Dia' },
    { icon: 'crown', label: 'Pra Receber' },
    { icon: 'gem', label: 'Pra Você' },
  ];
}
