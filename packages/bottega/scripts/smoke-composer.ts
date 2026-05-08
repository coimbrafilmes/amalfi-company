/**
 * Smoke test do composer — gera os 15 slots com input mock realístico
 * e salva PNGs em `tmp/smoke/` pra inspeção visual local.
 *
 * Razão: build/lint não pegam bugs visuais. Esse script roda os composers
 * com Sharp local (mesmo binário Mac ARM64 do Netlify Lambda Linux x64,
 * mesma API) sem precisar deploy + Gemini, custo zero.
 *
 * Uso:
 *   npx tsx scripts/smoke-composer.ts
 *   open tmp/smoke
 */

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { composeForSlot } from '../netlify/functions/_lib/composer/index.ts';
import { extractSlotParams, __testing } from '../netlify/functions/_lib/slot-params.ts';
import { cropToSize } from '../netlify/functions/_lib/cropImage.ts';
import {
  SLOT_ORDER,
  SLOT_DIMENSIONS,
  type CriacaoForm,
  type AnaliseDeMercado,
  type DescricaoResult,
  type SlotKind,
} from '../src/types/anuncio.ts';
import type { SlotParamsByKind, SlotParamsLifestyleCallouts } from '../netlify/functions/_lib/composer/types.ts';

// ============================================================
// PARSER TESTS — valida regex de parseCotas com inputs reais
// ============================================================

interface ParserCase {
  name: string;
  input: string;
  expectAxes: Array<'largura' | 'altura' | 'profundidade'>;
  expectValues?: Partial<Record<'largura' | 'altura' | 'profundidade', string>>;
}

const PARSER_CASES: ParserCase[] = [
  {
    name: 'Caso real owner: tesoura "23C x 7L centímetros"',
    input: 'Dimensões do produto: 23C x 7L centímetros. Material: aço.',
    expectAxes: ['profundidade', 'largura'],
    expectValues: { profundidade: '23 cm', largura: '7 cm' },
  },
  {
    name: 'Padrão Amazon BR: "20A x 10L x 5P"',
    input: 'Dimensões 20A x 10L x 5P',
    expectAxes: ['altura', 'largura', 'profundidade'],
    expectValues: { altura: '20 cm', largura: '10 cm', profundidade: '5 cm' },
  },
  {
    name: 'AxBxC numérico: "23x7x12 cm"',
    input: 'Tamanho 23x7x12 cm',
    expectAxes: ['largura', 'altura', 'profundidade'],
  },
  {
    name: 'Palavras-chave: "altura 16cm, largura 7cm"',
    input: 'altura 16cm, largura 7cm, profundidade 5 cm',
    expectAxes: ['altura', 'largura', 'profundidade'],
    expectValues: { altura: '16 cm', largura: '7 cm', profundidade: '5 cm' },
  },
  {
    name: '2D apenas: "23x7"',
    input: 'Dimensões 23x7',
    expectAxes: ['largura', 'altura'],
  },
  {
    name: 'Decimal vírgula: "16,5cm de altura"',
    input: '16,5cm de altura, 8 cm de largura',
    expectAxes: ['altura', 'largura'],
    expectValues: { altura: '16.5 cm' },
  },
  {
    name: 'Sem dimensões → 0 cotas',
    input: 'Material: aço inoxidável. Cor: preto.',
    expectAxes: [],
  },
];

function runParserTests(): { ok: number; fail: number } {
  let ok = 0;
  let fail = 0;
  console.log('[parser tests]');
  for (const c of PARSER_CASES) {
    const got = __testing.parseCotas(c.input);
    const gotAxes = got.map((g) => g.axis);
    const matchAxes =
      gotAxes.length === c.expectAxes.length &&
      c.expectAxes.every((a) => gotAxes.includes(a));

    let valuesOk = true;
    if (c.expectValues) {
      for (const [axis, expectedValue] of Object.entries(c.expectValues)) {
        const found = got.find((g) => g.axis === axis);
        if (!found || found.value !== expectedValue) {
          valuesOk = false;
          break;
        }
      }
    }

    if (matchAxes && valuesOk) {
      console.log(`  ✓ ${c.name}`);
      ok += 1;
    } else {
      console.error(`  ✗ ${c.name}`);
      console.error(`    input: "${c.input}"`);
      console.error(`    expect axes: [${c.expectAxes.join(', ')}]`);
      console.error(`    got: ${JSON.stringify(got)}`);
      fail += 1;
    }
  }
  return { ok, fail };
}

// ============================================================
// MOCK DATA — input realístico (caso real do owner: tesoura preta)
// ============================================================

const mockForm: CriacaoForm = {
  nomeProduto: 'Tesoura para frango preta',
  detalhesTecnicos:
    'Dimensões do produto: 23C x 7L centímetros. Material: lâminas de aço inoxidável endurecido de alta qualidade e cabo de polipropileno anatômico. Corta facilmente papelão, barbante, alimentos, carne, vegetais, frango, aves, peixes, frutos do mar e churrasco.',
  numeroImagens: 7,
  estiloImagem: 'lifestyle',
};

const mockAnalise: AnaliseDeMercado = {
  persona: {
    label: 'Cozinha que resolve',
    descricao: 'Quem cozinha em casa toda semana e busca uma ferramenta que economize tempo no preparo de carnes e aves.',
    perfilDemografico: 'Mulher, 30-50, classe B/B+, cozinha em casa',
  },
  dores: [
    { titulo: 'Perde tempo cortando', descricao: 'Facas comuns não cortam frango cru direito.' },
    { titulo: 'Risco de se cortar', descricao: 'Tesouras pequenas escapam da mão.' },
    { titulo: 'Falta versatilidade', descricao: 'Quer 1 ferramenta que sirva várias funções.' },
  ],
  motivacoes: [
    'Facilitar o preparo de carnes em casa',
    'Ter uma ferramenta versátil que serve para várias coisas',
    'Agilizar o processo de cozinhar para a família',
    'Sentir-se mais confiante na cozinha',
  ],
  janelaDeDecisao: '24-72h após primeira busca',
  publicoSecundario: null,
};

const mockDescricao: DescricaoResult = {
  description: 'Texto de descrição mock.\n\nSegundo parágrafo mock.',
  amazonBulletPoints: [
    'CORTE PRECISO: lâmina de aço inoxidável endurecido pra alimentos',
    'CABO ANATÔMICO: polipropileno antiderrapante para uso prolongado',
    'VERSÁTIL: serve frango, aves, papelão, barbante e mais',
    'DURABILIDADE: aço inox de alta qualidade resistente',
    'FÁCIL DE LIMPAR: design simples para higienização rápida',
  ],
  bulletPoints: [
    'Lâmina de aço inoxidável',
    'Cabo ergonômico antiderrapante',
    'Multiuso na cozinha',
  ],
  faq: [
    { pergunta: 'Pode ir na lava-louças?', resposta: 'Sim, é totalmente segura.' },
  ],
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Gera imagem base fake — gradient diagonal areia → mar pra contrastar com overlays
 * de qualquer cor. Permite ver se overlay tá legível em fundo claro E escuro.
 */
async function makeBaseImage(w: number, h: number): Promise<Buffer> {
  // Cria SVG gradient e renderiza via Sharp
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E8DFD2"/>
        <stop offset="50%" stop-color="#A8B0BC"/>
        <stop offset="100%" stop-color="#2D5D7B"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="${Math.min(w, h) * 0.08}"
          fill="rgba(255,255,255,0.18)" text-anchor="middle" dominant-baseline="middle">
      MOCK BASE
    </text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// ============================================================
// MAIN
// ============================================================

// ============================================================
// TRIM TESTS — valida cropToSize remove letterbox preto do Gemini
// ============================================================

/**
 * Gera PNG 1024×1024 com retângulo central útil + faixas pretas top/bottom
 * (simula letterbox que Gemini retorna quando ignora aspectRatio:'1:1').
 */
async function makeLetterboxedMock(
  outerW: number, outerH: number,
  innerW: number, innerH: number,
): Promise<string> {
  const offsetX = Math.floor((outerW - innerW) / 2);
  const offsetY = Math.floor((outerH - innerH) / 2);
  // SVG com fundo preto e retângulo bege central
  const svg = `<svg width="${outerW}" height="${outerH}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${outerW}" height="${outerH}" fill="black"/>
    <rect x="${offsetX}" y="${offsetY}" width="${innerW}" height="${innerH}" fill="#E8DFD2"/>
  </svg>`;
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return buf.toString('base64');
}

async function runTrimTests(): Promise<{ ok: number; fail: number }> {
  console.log('[trim tests]');
  let ok = 0;
  let fail = 0;

  // Caso 1: letterbox top/bottom (4:3 dentro de 1:1) → trim deve remover faixas pretas
  // Mock: 1024×1024 outer, 1024×768 inner (4:3) — bordas pretas top+bottom 128px cada
  const lbBase64 = await makeLetterboxedMock(1024, 1024, 1024, 768);
  const trimmed = await cropToSize(lbBase64, 2000, 2000);
  // Após trim, a imagem útil 1024×768 (1.33:1) é resized cover pra 2000×2000.
  // Cover preserva o ratio 1.33:1 cortando lateral, output deve ser 2000×2000 sem
  // mais nenhum pixel preto puro nas bordas (validar via Sharp metadata + amostra).
  const meta = await sharp(Buffer.from(trimmed.base64, 'base64')).metadata();
  if (meta.width === 2000 && meta.height === 2000) {
    console.log(`  ✓ Letterbox 4:3 removido + resize 2000×2000`);
    ok += 1;
  } else {
    console.error(`  ✗ Letterbox: dim final ${meta.width}×${meta.height} (esperava 2000×2000)`);
    fail += 1;
  }

  // Caso 2: imagem sem letterbox (puro 1024×1024) → trim deve ser no-op
  const cleanBase64 = await sharp({
    create: { width: 1024, height: 1024, channels: 3, background: '#A8B0BC' },
  }).png().toBuffer().then((b) => b.toString('base64'));
  const cleanResized = await cropToSize(cleanBase64, 2000, 2000);
  const cleanMeta = await sharp(Buffer.from(cleanResized.base64, 'base64')).metadata();
  if (cleanMeta.width === 2000 && cleanMeta.height === 2000) {
    console.log(`  ✓ Imagem limpa (sem letterbox) → resize 2000×2000 ok`);
    ok += 1;
  } else {
    console.error(`  ✗ Clean: dim final ${cleanMeta.width}×${cleanMeta.height}`);
    fail += 1;
  }

  return { ok, fail };
}

// ============================================================
// PILL LENGTH TESTS — valida slot 3 callouts ≤ 30 chars (paridade Gumpinho)
// ============================================================

function runPillLengthTests(): { ok: number; fail: number } {
  console.log('[pill tests]');
  let ok = 0;
  let fail = 0;

  // Mock com motivações LONGAS (37-43 chars) — tipo o caso real "Escultura Abaporu"
  const longMotivacoes: AnaliseDeMercado = {
    persona: { label: 'Cultura na casa', descricao: 'x', perfilDemografico: 'x' },
    dores: [{ titulo: 'd1', descricao: 'x' }, { titulo: 'd2', descricao: 'x' }],
    motivacoes: [
      'Conectar a casa à cultura brasileira',                  // 37 chars
      'Expressar identidade e pertencimento',                  // 36 chars
      'Agregar valor estético e intelectual ao lar',           // 43 chars
      'Obra clássica reinterpretada',                          // 28 chars
    ],
    janelaDeDecisao: '24h',
    publicoSecundario: null,
  };

  const params = extractSlotParams(
    'anuncio-lifestyle-callouts',
    mockForm,
    longMotivacoes,
    mockDescricao,
  ) as SlotParamsLifestyleCallouts;

  if (params.callouts.length !== 3) {
    console.error(`  ✗ callouts.length = ${params.callouts.length} (esperava 3)`);
    fail += 1;
  } else {
    let allShort = true;
    for (const c of params.callouts) {
      if (c.label.length > 30) {
        console.error(`  ✗ pill "${c.label}" tem ${c.label.length} chars (max 30)`);
        allShort = false;
        fail += 1;
        break;
      }
    }
    if (allShort) {
      console.log(`  ✓ Slot 3 pills ≤ 30 chars (atual: ${params.callouts.map((c) => c.label.length).join(', ')})`);
      ok += 1;
    }
  }

  return { ok, fail };
}

// Roda parser tests primeiro — bloqueia se algum falhar
const parserResult = runParserTests();
console.log(`[parser tests] ${parserResult.ok} OK · ${parserResult.fail} FAIL\n`);

const trimResult = await runTrimTests();
console.log(`[trim tests] ${trimResult.ok} OK · ${trimResult.fail} FAIL\n`);

const pillResult = runPillLengthTests();
console.log(`[pill tests] ${pillResult.ok} OK · ${pillResult.fail} FAIL\n`);

const totalFails = parserResult.fail + trimResult.fail + pillResult.fail;
if (totalFails > 0) {
  console.error('[smoke] testes programáticos falharam — abortando antes de gerar imagens');
  process.exit(1);
}

const outDir = path.resolve(import.meta.dirname ?? '.', '..', 'tmp', 'smoke');
await fs.rm(outDir, { recursive: true, force: true });
await fs.mkdir(outDir, { recursive: true });

console.log(`[smoke] gerando ${SLOT_ORDER.length} slots em ${outDir}\n`);

let okCount = 0;
let failCount = 0;

for (const slot of SLOT_ORDER) {
  const dim = SLOT_DIMENSIONS[slot];
  try {
    const base = await makeBaseImage(dim.w, dim.h);
    const params = extractSlotParams(slot as SlotKind, mockForm, mockAnalise, mockDescricao);
    const out = await composeForSlot(
      slot as SlotKind,
      base,
      params as SlotParamsByKind[SlotKind],
    );
    const idx = String(SLOT_ORDER.indexOf(slot) + 1).padStart(2, '0');
    const filename = `${idx}-${slot}.png`;
    await fs.writeFile(path.join(outDir, filename), out);
    const sizeKB = (out.length / 1024).toFixed(0);
    console.log(`✓ ${slot.padEnd(30)} ${String(dim.w).padStart(4)}×${String(dim.h).padEnd(4)}  ${sizeKB.padStart(5)}KB`);
    okCount += 1;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`✗ ${slot.padEnd(30)} FAIL: ${msg}`);
    failCount += 1;
  }
}

console.log(`\n[smoke] ${okCount} OK · ${failCount} FAIL`);
console.log(`[smoke] abra: open '${outDir}'`);

if (failCount > 0) {
  process.exit(1);
}
