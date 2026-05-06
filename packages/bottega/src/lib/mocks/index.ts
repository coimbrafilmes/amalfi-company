/**
 * Mocks — dados de exemplo realistas pros 5 blocos da geração.
 * Espelha a interface do orchestrator real pra que a UI funcione 100%
 * sem chamar Gemini/Imagen.
 *
 * Dados inspirados no caso real do owner: tomada 2P+T 10A 250V branca NBR 14136.
 */

import type {
  CriacaoForm,
  CriacaoResults,
  AnaliseDeMercado,
  KeywordsResult,
  TitulosResult,
  DescricaoResult,
  BriefingImagem,
  ImagemGerada,
} from '../../types/anuncio';

// ============================================================
// DELAY HELPER (simula tempo de geração real)
// ============================================================

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// 1. ANÁLISE DE MERCADO
// ============================================================

export const mockAnalise: AnaliseDeMercado = {
  persona: {
    label: 'Reformando aos poucos.',
    descricao:
      'Compra por exigência (padrão obrigatório desde 2010) e por estética (acabamento branco fosco que conversa com pintura clean). Decide em até 48 horas. Lê os comentários antes do título.',
    perfilDemografico:
      'Mulher 32-48 anos, classe B+, mora em apartamento próprio em capital ou interior, está trocando tomadas antigas por padrão NBR 14136.',
  },
  dores: [
    {
      titulo: 'A casa antiga já não cabe nos plugues novos.',
      descricao:
        'Os aparelhos modernos vêm com plugue de três pinos redondos. As tomadas antigas (americano de dois pinos) não aterram, não recebem o terceiro pino, e ainda dão pequenos choques. A reforma é pequena — mas é uma reforma.',
    },
    {
      titulo: 'Eletricista cobra mais quando falta peça.',
      descricao:
        'Quando o profissional chega e descobre que não tem suporte 4x2 ou que o parafuso é diferente, é uma volta a mais até a loja. Comprar tudo no kit certo evita atrito.',
    },
  ],
  motivacoes: [
    'Atualizar a casa sem grande reforma',
    'Segurança elétrica (aterramento obrigatório)',
    'Acabamento clean que combina com paredes brancas',
    'Vender o imóvel adequado ao padrão exigido por lei',
  ],
  janelaDeDecisao: '24 a 72 horas após a primeira busca.',
  publicoSecundario:
    'Eletricistas que fazem manutenção residencial — compram em volume, querem padrão confiável.',
};

// ============================================================
// 2. KEYWORDS (50 termos agrupados)
// ============================================================

export const mockKeywords: KeywordsResult = {
  total: 50,
  destaque: [
    'tomada 10a',
    'tomada 2p+t',
    'nbr 14136',
    'padrão brasileiro',
    'tomada branca',
    'tomada 4x2',
  ],
  flat: [
    'tomada 10a', 'tomada 2p+t', 'nbr 14136', 'padrão brasileiro', 'tomada branca',
    'tomada 4x2', 'três pinos', 'novo padrão', 'aterramento', 'embutida',
    'bivolt', 'parede', 'reforma', 'apartamento', 'comercial',
    'com suporte', 'com parafusos', 'termoplástico', '5 anos garantia', 'proteção uv',
    'tomada parede', 'tomada residencial', 'tomada 250v', 'pino redondo', 'aterrada',
    'compatível plugue novo', 'caixa 4x2', 'embutir', 'kit tomada', '127v 220v',
    'casa', 'cozinha', 'sala', 'quarto', 'escritório',
    'loja', 'consultório', 'salão', 'reforma rápida', 'troca tomada',
    'antiga 2 pinos', 'plugue redondo', 'norma técnica', 'segurança', 'obrigatório',
    'branco fosco', 'instalação fácil', 'eletricista', 'kit instalação', 'energia segura',
  ],
  grupos: [
    {
      categoria: 'Termos técnicos',
      termos: ['tomada 10a', 'tomada 2p+t', 'nbr 14136', 'aterramento', 'tomada 250v', 'pino redondo', 'norma técnica', '127v 220v', 'caixa 4x2', 'termoplástico'],
    },
    {
      categoria: 'Linguagem do consumidor',
      termos: ['tomada branca', 'três pinos', 'tomada parede', 'embutida', 'antiga 2 pinos', 'plugue redondo', 'novo padrão', 'instalação fácil', 'segurança', 'obrigatório'],
    },
    {
      categoria: 'Ambientes',
      termos: ['casa', 'cozinha', 'sala', 'quarto', 'escritório', 'loja', 'consultório', 'salão', 'apartamento', 'comercial'],
    },
    {
      categoria: 'Ocasião de compra',
      termos: ['reforma', 'reforma rápida', 'troca tomada', 'kit tomada', 'kit instalação', 'eletricista', 'energia segura', 'compatível plugue novo', 'com suporte', 'com parafusos'],
    },
    {
      categoria: 'Diferenciais',
      termos: ['padrão brasileiro', 'bivolt', 'tomada residencial', '5 anos garantia', 'proteção uv', 'branco fosco', 'tomada 4x2', 'aterrada', 'parede', 'embutir'],
    },
  ],
};

// ============================================================
// 3. TÍTULOS (5 produto + 5 dor)
// ============================================================

export const mockTitulos: TitulosResult = {
  produto: [
    {
      texto: 'Tomada 10A 250V Branca 2P+T NBR 14136 com Suporte 4x2 e Parafusos — Padrão Brasileiro Bivolt',
      caracteres: 102,
      foco: 'produto',
    },
    {
      texto: 'Tomada Padrão Brasileiro 10A 250V — Encaixe 4x2 — Branca Fosca — Kit com Suporte e Parafusos',
      caracteres: 99,
      foco: 'produto',
    },
    {
      texto: 'Tomada de Parede 2P+T NBR 14136 — 10 Amperes Bivolt Branca — Acabamento Termoplástico UV',
      caracteres: 96,
      foco: 'produto',
    },
    {
      texto: 'Tomada Embutir 4x2 Branca 10A 250V — Padrão NBR 14136 — Inclui Suporte e 2 Parafusos Fixação',
      caracteres: 100,
      foco: 'produto',
    },
    {
      texto: 'Tomada Elétrica Residencial 10A 250V Branca 2P+T — Padrão Brasileiro Novo NBR 14136 4x2',
      caracteres: 95,
      foco: 'produto',
    },
  ],
  dor: [
    {
      texto: 'Sua Casa no Padrão Atual: Tomada 10A 250V Branca NBR 14136 2P+T com Kit Suporte 4x2 Pronto',
      caracteres: 98,
      foco: 'dor',
    },
    {
      texto: 'Trocar Tomada Antiga Sem Bagunça: Kit Completo 10A 250V Branca Suporte 4x2 e Parafusos',
      caracteres: 92,
      foco: 'dor',
    },
    {
      texto: 'Aparelho Novo Não Encaixa? Tomada 2P+T 10A 250V Branca NBR 14136 com Suporte e Parafusos',
      caracteres: 97,
      foco: 'dor',
    },
    {
      texto: 'Reforma Rápida e Segura: Tomada Branca Padrão Brasileiro 10A 250V Kit 4x2 Pronto Pra Instalar',
      caracteres: 100,
      foco: 'dor',
    },
    {
      texto: 'Acabou o Choque do Pino Antigo: Tomada NBR 14136 Branca 10A 250V com Suporte 4x2 Inclusos',
      caracteres: 97,
      foco: 'dor',
    },
  ],
};

// ============================================================
// 4. DESCRIÇÃO COMPLETA
// ============================================================

export const mockDescricao: DescricaoResult = {
  description: `Atualize sua casa ou comércio para o padrão elétrico brasileiro NBR 14136 com uma tomada robusta, segura e pronta pra usar.

Esta Tomada 2P+T 10A 250V Branca foi desenvolvida para entregar conexão segura e durável em qualquer ambiente. Compatível com o novo padrão brasileiro de 3 pinos redondos, funciona em redes 127V e 220V — ideal pra reformas, construção nova ou substituição daquelas tomadas antigas de 2 pinos americanos que já não atendem aparelhos modernos.

O que vem na embalagem:
- 1 Tomada 2P+T 10A 250V branca
- 1 Suporte 4x2 (espelho)
- 2 Parafusos de fixação

Especificações técnicas:
- Corrente máxima: 10 amperes
- Tensão máxima: 250V (compatível com 127V e 220V)
- Padrão: NBR 14136 (2 polos + terra)
- Material: termoplástico branco com proteção UV
- Encaixe: caixa de luz 4x2 padrão brasileiro

Indicado para residências, escritórios, lojas, consultórios, ambientes comerciais. Combina com decoração moderna, minimalista, industrial ou clássica.`,

  descriptionHTML: `
<h2>Atualize sua casa ao padrão NBR 14136</h2>
<p><strong>Esta Tomada 2P+T 10A 250V Branca</strong> entrega conexão segura e durável em qualquer ambiente. Compatível com o padrão brasileiro de 3 pinos redondos, funciona em redes 127V e 220V.</p>

<h2>O que vem na embalagem</h2>
<ul>
  <li>1 Tomada 2P+T 10A 250V branca</li>
  <li>1 Suporte 4x2 (espelho)</li>
  <li>2 Parafusos de fixação</li>
</ul>

<h2>Especificações</h2>
<table>
  <tr><th>Corrente máxima</th><td>10 amperes</td></tr>
  <tr><th>Tensão</th><td>250V (compatível com 127V e 220V)</td></tr>
  <tr><th>Padrão</th><td>NBR 14136 (2 polos + terra)</td></tr>
  <tr><th>Material</th><td>Termoplástico branco com proteção UV</td></tr>
  <tr><th>Encaixe</th><td>Caixa 4x2 padrão brasileiro</td></tr>
</table>

<p><em>Indicado para residências, escritórios, lojas, consultórios. Combina com decoração moderna, minimalista, industrial ou clássica.</em></p>
`,

  amazonBulletPoints: [
    'PADRÃO BRASILEIRO NBR 14136: Tomada 2P+T (2 polos + terra) compatível com o padrão obrigatório no Brasil desde 2010. Plug de 3 pinos redondos, encaixa em caixas 4x2 padrão de toda residência e comércio modernos.',
    '10A / 250V — APARELHOS ATÉ 1100W EM 127V OU 2200W EM 220V: Suporta carga ideal para o dia a dia. TV, micro-ondas, ferro de passar, ventilador, computador, carregadores de notebook.',
    'KIT COMPLETO PRONTO PRA INSTALAR: Acompanha 1 tomada branca + 1 suporte 4x2 (espelho) + 2 parafusos de fixação. Sem ferramenta especial, sem peça faltando.',
    'PLÁSTICO RESISTENTE COM PROTEÇÃO ANTI-AMARELAMENTO: Corpo em termoplástico branco com tratamento UV. Não amarela com a luz solar nem com o tempo. Resistente a impacto, fácil de limpar.',
    'IDEAL PARA SALA, QUARTO, COZINHA, ESCRITÓRIO E LOJA: Design discreto, encaixe perfeito em paredes claras, harmoniza com qualquer decoração. Use em reformas ou substituição de tomadas antigas.',
  ],

  bulletPoints: [
    'Padrão brasileiro NBR 14136 (3 pinos redondos)',
    '10 amperes · 250V (funciona em 127V e 220V)',
    'Kit completo: tomada + suporte 4x2 + 2 parafusos',
    'Termoplástico branco com proteção UV',
    'Para sala, quarto, cozinha, escritório e loja',
  ],

  faq: [
    {
      pergunta: 'Esta tomada é bivolt?',
      resposta: 'Sim. Suporta redes 127V e 220V (até 250V) — funciona em qualquer estado brasileiro.',
    },
    {
      pergunta: 'Encaixa em caixa antiga?',
      resposta: 'Sim. Encaixa em qualquer caixa 4x2 padrão brasileiro — a maioria das casas já tem.',
    },
    {
      pergunta: 'Posso instalar sozinho?',
      resposta: 'Sim, com cuidado básico. Sempre desligue o disjuntor antes de manusear a fiação.',
    },
    {
      pergunta: 'Aceita plugues importados?',
      resposta: 'Aceita qualquer plugue de 3 pinos redondos no padrão NBR 14136.',
    },
    {
      pergunta: 'Vem com os parafusos?',
      resposta: 'Sim. Embalagem inclui suporte 4x2 e 2 parafusos de fixação.',
    },
  ],
};

// ============================================================
// 5. BRIEFINGS DE IMAGEM
// ============================================================

export const mockBriefings: BriefingImagem[] = [
  {
    numero: 1,
    isCover: true,
    estagio: 'capa',
    titulo: 'Hero · produto isolado, fundo Osso, 80% do frame',
    prompt: 'Photorealistic product photography of a white Brazilian 2P+T NBR 14136 wall outlet on a pure white background, perfectly centered, occupying 80% of the frame, soft shadow, e-commerce style, no text, no logo, 2000x2000px.',
    overlayText: '',
    dataPoints: ['10A', '250V', 'NBR 14136', 'branca', 'termoplástico'],
    paletaCor: 'osso-outline',
  },
  {
    numero: 2,
    isCover: false,
    estagio: 'gancho',
    titulo: 'Lifestyle · sala ao entardecer, luz lateral suave',
    prompt: 'Lifestyle photography of a modern Brazilian apartment living room at golden hour, warm side light, the wall outlet is the focal point on a clean white painted wall, hint of green plant out of focus, terracotta accents, no people, photorealistic, magazine editorial style.',
    overlayText: 'A casa que respira.',
    dataPoints: ['ambiente residencial', 'luz natural', 'integração'],
    paletaCor: 'mar',
  },
  {
    numero: 3,
    isCover: false,
    estagio: 'detalhe',
    titulo: 'Detalhe · três pinos, encaixe, micro',
    prompt: 'Macro shot of the three round pin holes of the outlet, sharp focus, soft natural light, white textured surface, technical and elegant, photorealistic.',
    overlayText: '3 pinos · NBR 14136',
    dataPoints: ['3 pinos redondos', 'NBR 14136', 'aterramento'],
    paletaCor: 'ceu',
  },
  {
    numero: 4,
    isCover: false,
    estagio: 'mecanismo',
    titulo: 'Conteúdo da caixa · tomada + suporte + 2 parafusos',
    prompt: 'Top-down flat lay product photography on pure white background of three items neatly arranged: 1) white Brazilian 2P+T outlet, 2) white plastic 4x2 wall plate frame, 3) two small Phillips screws. Sharp focus, e-commerce style.',
    overlayText: 'kit completo',
    dataPoints: ['1 tomada', '1 suporte 4x2', '2 parafusos'],
    paletaCor: 'terracota',
  },
  {
    numero: 5,
    isCover: false,
    estagio: 'prova',
    titulo: 'Compatibilidade · caixa 4x2 padrão brasileiro',
    prompt: 'Technical illustration showing the outlet fitting perfectly into a Brazilian 4x2 wall box, dashed outline of the box, measurements, clean editorial style, parchment background.',
    overlayText: 'encaixa em qualquer 4x2',
    dataPoints: ['caixa 4x2', '7,5x5cm interno', 'padrão BR'],
    paletaCor: 'osso-outline',
  },
  {
    numero: 6,
    isCover: false,
    estagio: 'lifestyle',
    titulo: 'Manhã na cozinha · cafeteira conectada, vapor',
    prompt: 'Photography of a small kitchen counter at morning, marble countertop, a coffee maker plugged into the white outlet on the wall, steam rising, warm natural light, no people, photorealistic, lifestyle editorial.',
    overlayText: 'O café que começa o dia.',
    dataPoints: ['cozinha', 'eletrodoméstico', 'rotina'],
    paletaCor: 'ocre',
  },
  {
    numero: 7,
    isCover: false,
    estagio: 'objecao',
    titulo: 'Antes e depois · padrão antigo vs NBR 14136',
    prompt: 'Side-by-side comparison illustration: left = old American 2-pin outlet (faded), right = new Brazilian NBR 14136 3-pin outlet (sharp). Editorial flat illustration, parchment background, sage green accents.',
    overlayText: 'antes · depois',
    dataPoints: ['padrão antigo', 'novo padrão', 'aterramento'],
    paletaCor: 'areia',
  },
  {
    numero: 8,
    isCover: false,
    estagio: 'prova',
    titulo: 'Diferenciais · 5 anos garantia, proteção UV',
    prompt: 'Editorial infographic with 4 quadrants showing key features: 5 anos garantia, proteção UV, NBR 14136, 4x2 incluso. Clean white background, terracotta accents, DM Serif Display headlines.',
    overlayText: '5 anos · UV',
    dataPoints: ['5 anos garantia', 'proteção UV', 'NBR 14136', 'suporte 4x2'],
    paletaCor: 'osso-outline',
  },
  {
    numero: 9,
    isCover: false,
    estagio: 'decisao',
    titulo: 'Decisão · tomada vista frontal, simplicidade',
    prompt: 'Clean studio photography of the white outlet on a calm pastel background (osso color), centered, warm light, photorealistic, e-commerce final shot.',
    overlayText: 'pequenos gestos',
    dataPoints: ['simplicidade', 'acabamento', 'casa'],
    paletaCor: 'mar',
  },
];

// ============================================================
// IMAGENS MOCK (data URI placeholders coloridos)
// ============================================================

const PALETA_HEX: Record<string, string> = {
  mar: '#2D5D7B',
  areia: '#E6D6BF',
  ceu: '#CFDFE6',
  terracota: '#C47855',
  ocre: '#D4A05A',
  'osso-outline': '#F4EDE0',
};

function svgPlaceholder(cor: string, label: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="${cor}"/>
      <text x="300" y="310" font-family="Cormorant Garamond, serif" font-style="italic" font-size="32" fill="rgba(244,237,224,0.9)" text-anchor="middle">${label}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export function gerarMockImagens(briefings: BriefingImagem[]): ImagemGerada[] {
  return briefings.map((b) => {
    const cor = PALETA_HEX[b.paletaCor ?? 'mar'] ?? PALETA_HEX.mar;
    return {
      briefingNumero: b.numero,
      base64: svgPlaceholder(cor, `cena ${b.numero}`),
      largura: 600,
      altura: 600,
      modelUsado: 'mock-svg',
    };
  });
}

// ============================================================
// ORCHESTRATOR MOCK (espelha lib/gemini/orchestrator.ts)
// ============================================================

export async function gerarMockTudo(_input: CriacaoForm): Promise<CriacaoResults> {
  // simula latência editorial — nem rápido demais nem lento demais
  await delay(900);
  return {
    analise: mockAnalise,
    keywords: mockKeywords,
    titulos: mockTitulos,
    descricao: mockDescricao,
    briefings: mockBriefings,
    imagens: gerarMockImagens(mockBriefings),
    geradoEm: new Date().toISOString(),
    modoGeracao: 'mock',
  };
}

export const LOADING_MESSAGES = [
  'Analisando o comportamento do consumidor brasileiro…',
  'Identificando público-alvo, dores e motivações de compra…',
  'Minerando as melhores palavras-chave do mercado…',
  'Compondo títulos com calma e precisão…',
  'Escrevendo a descrição que vende sem gritar…',
  'Desenhando os briefings de imagem com cuidado…',
  'Renderizando as cenas em fidelidade alta…',
];
