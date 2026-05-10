/**
 * Empacota um anúncio Bottega completo em .zip pra Sarah baixar e usar
 * direto no Seller Central / social.
 *
 * Estrutura do zip:
 *   imagens/anuncio/01-capa.png ... 07-prova-final.png   (2000×2000)
 *   imagens/aplus/01-header.png ... 08-comparison.png    (970×600 + premium 1464×600 + comparison 220×220)
 *   textos/titulo.txt           (10 sugestões de título — produto + dor)
 *   textos/descricao.md         (description Amazon plain text)
 *   textos/bullets.md           (5 bullets Amazon)
 *   textos/keywords.txt         (50 keywords, 1 por linha)
 *   textos/faq.md               (FAQ)
 *   textos/destaques.md         (7 destaques punchy)
 *   analise.md                  (resumo persona + dores + motivações)
 *   README.md                   (sumário do anúncio + checklist Seller Central)
 */

import JSZip from 'jszip';
import type {
  CriacaoResults,
  FAQItem,
  ImagemGerada,
  SlotKind,
  TitulosResult,
  AnaliseDeMercado,
  DescricaoResult,
} from '../../types/anuncio';

const SLOT_FILE_INDEX: Partial<Record<SlotKind, number>> = {
  'anuncio-capa': 1,
  'anuncio-dimensoes': 2,
  'anuncio-lifestyle-callouts': 3,
  'anuncio-comparativo': 4,
  'anuncio-aspiracional': 5,
  'anuncio-beneficios': 6,
  'anuncio-prova-final': 7,
  'aplus-header': 1,
  'aplus-antes-depois': 2,
  'aplus-specs': 3,
  'aplus-casos-uso': 4,
  'aplus-validacao': 5,
  'aplus-cta': 6,
  'aplus-premium': 7,
  'aplus-comparison': 8,
};

function slotFilename(img: ImagemGerada): string {
  const slot = img.slotKind;
  if (slot && SLOT_FILE_INDEX[slot]) {
    const idx = SLOT_FILE_INDEX[slot]!;
    const slug = slot.replace(/^(anuncio|aplus)-/, '');
    return `${String(idx).padStart(2, '0')}-${slug}.png`;
  }
  // Fallback pra anúncios antigos sem slotKind
  return `${String(img.briefingNumero).padStart(2, '0')}-imagem.png`;
}

function stripDataUri(b64: string): string {
  const m = b64.match(/^data:[^;]+;base64,(.+)$/);
  return m ? m[1] : b64;
}

function safeFolderName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove diacríticos combinantes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'anuncio';
}

function formatTitulos(titulos: TitulosResult): string {
  const linhas: string[] = ['# Sugestões de título', ''];
  linhas.push('## Foco produto (técnico)', '');
  titulos.produto.forEach((t, i) => {
    linhas.push(`${i + 1}. ${t.texto}  _(${t.caracteres} chars)_`);
  });
  linhas.push('', '## Foco dor (transformação)', '');
  titulos.dor.forEach((t, i) => {
    linhas.push(`${i + 1}. ${t.texto}  _(${t.caracteres} chars)_`);
  });
  return linhas.join('\n');
}

function formatDescricao(d: DescricaoResult): string {
  return `# Descrição (plain text Amazon-compatible)

> Amazon depreciou HTML em descriptions desde julho/2021. Cole no campo "Descrição" do Seller Central como está abaixo.

---

${d.description}
`;
}

function formatBullets(bullets: string[]): string {
  const linhas = ['# Bullets Amazon (5 obrigatórios)', ''];
  bullets.forEach((b, i) => {
    linhas.push(`${i + 1}. ${b}`);
  });
  return linhas.join('\n');
}

function formatFaq(faq: FAQItem[]): string {
  const linhas = ['# FAQ — Perguntas Frequentes', ''];
  faq.forEach((q) => {
    linhas.push(`### ${q.pergunta}`, '', q.resposta, '');
  });
  return linhas.join('\n');
}

function formatDestaques(destaques: string[]): string {
  const linhas = [
    '# 7 Destaques',
    '',
    '> Frases punchy ≤80 chars pra carousel Amazon BR, abertura de listing e social.',
    '',
  ];
  destaques.forEach((d, i) => {
    linhas.push(`${String(i + 1).padStart(2, '0')}. ${d}`);
  });
  return linhas.join('\n');
}

function formatAnalise(a: AnaliseDeMercado): string {
  const linhas = [
    '# Análise de mercado',
    '',
    '## Persona dominante',
    '',
    `**${a.persona.label}**`,
    '',
    a.persona.descricao,
    '',
    `_${a.persona.perfilDemografico}_`,
    '',
    '## Dores',
    '',
  ];
  a.dores.forEach((dor, i) => {
    linhas.push(`### Dor ${i + 1}: ${dor.titulo}`, '', dor.descricao, '');
  });
  linhas.push('## Motivações', '');
  a.motivacoes.forEach((m) => linhas.push(`- ${m}`));
  linhas.push('', `## Janela de decisão`, '', a.janelaDeDecisao);
  if (a.publicoSecundario) {
    linhas.push('', '## Público secundário', '', a.publicoSecundario);
  }
  return linhas.join('\n');
}

function formatReadme(results: CriacaoResults, productName: string): string {
  const imagens = results.imagens ?? [];
  const okImagens = imagens.filter((i) => !i.falhou && i.base64);
  const anuncioCount = okImagens.filter((i) => i.variante === 'anuncio').length;
  const aplusCount = okImagens.filter((i) => i.variante === 'aplus').length;

  return `# ${productName}

> Anúncio Amazon BR gerado pelo AMALFI CREATOR · Amalfi Co.
> Gerado em ${new Date(results.geradoEm).toLocaleString('pt-BR')} · modo \`${results.modoGeracao}\`

---

## O que tem nesse zip

### \`/imagens\`
- **Anúncio principal** (\`/imagens/anuncio/\`): ${anuncioCount} imagens 2000×2000 PNG
  - 01 Capa · 02 Dimensões · 03 Lifestyle+Callouts · 04 Comparativo · 05 Aspiracional · 06 Benefícios · 07 Prova Final
- **Conteúdo A+** (\`/imagens/aplus/\`): ${aplusCount} imagens
  - 01–06: 970×600 (Standard) · 07: 1464×600 (Premium) · 08: 220×220 (Comparison Charts)

### \`/textos\`
- \`titulo.txt\`: 10 sugestões de título (5 produto + 5 dor)
- \`descricao.md\`: descrição plain text Amazon-compatible
- \`bullets.md\`: 5 bullets Amazon obrigatórios
- \`keywords.txt\`: ${results.keywords.total} palavras-chave (1 por linha)
- \`faq.md\`: ${results.descricao.faq.length} perguntas frequentes
- \`destaques.md\`: ${results.destaques?.length ?? 0} destaques punchy pra social/carousel

### \`/analise.md\`
Persona, dores, motivações, janela de decisão.

---

## Checklist Seller Central

- [ ] Capa principal (\`/imagens/anuncio/01-capa.png\`) — fundo branco puro, produto 80%
- [ ] 6 imagens secundárias do anúncio (slots 02–07) na ordem
- [ ] Título copiado de \`textos/titulo.txt\` (escolher 1 dos 10)
- [ ] 5 bullets Amazon de \`textos/bullets.md\`
- [ ] Descrição plain text de \`textos/descricao.md\`
- [ ] Keywords backend de \`textos/keywords.txt\` (preencher campo "Palavras-chave de busca")
- [ ] Conteúdo A+ — upload das 8 imagens em \`/imagens/aplus/\`
- [ ] FAQ — colar no campo de perguntas (se aplicável à categoria)
`;
}

export interface BuildZipOpts {
  /** Nome do produto pra usar como nome do arquivo + título do README. */
  productName: string;
}

/**
 * Empacota tudo num Blob .zip pronto pra download.
 * Roda 100% client-side — não bate em nenhum endpoint.
 */
export async function buildZip(
  results: CriacaoResults,
  opts: BuildZipOpts,
): Promise<{ blob: Blob; filename: string }> {
  const zip = new JSZip();

  // Imagens
  for (const img of results.imagens ?? []) {
    if (img.falhou || !img.base64) continue;
    const folder = img.variante; // 'anuncio' | 'aplus'
    const filename = slotFilename(img);
    zip.file(`imagens/${folder}/${filename}`, stripDataUri(img.base64), { base64: true });
  }

  // Textos
  zip.file('textos/titulo.txt', formatTitulos(results.titulos));
  zip.file('textos/descricao.md', formatDescricao(results.descricao));
  zip.file('textos/bullets.md', formatBullets(results.descricao.amazonBulletPoints));
  zip.file('textos/keywords.txt', results.keywords.flat.join('\n'));
  zip.file('textos/faq.md', formatFaq(results.descricao.faq));
  if (results.destaques && results.destaques.length > 0) {
    zip.file('textos/destaques.md', formatDestaques(results.destaques));
  }

  // Resumos top-level
  zip.file('analise.md', formatAnalise(results.analise));
  zip.file('README.md', formatReadme(results, opts.productName));

  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `${safeFolderName(opts.productName)}-amalfi.zip`;
  return { blob, filename };
}

/** Dispara download do Blob no browser (sem precisar de endpoint). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Libera memória após o browser processar o download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
