# Story — Bottega Fase 1: Tier 0 (Fix bugs print + dimensões + FAQ + destaques + zip)

**Owner story:** Sarah (Amalfi)
**Implementador:** Dex (@dev)
**Branch:** `feat/bottega-v3-composition`
**Pré-requisitos lidos:** `docs/specs/bottega-v3-blueprint-visual.md` (Marco), `docs/specs/bottega-v3-composition.md` (Aria)
**Estimativa:** ~12h + ~2h Bloco G (correções E2E)
**Status:** InProgress — Bloco G (4 bugs E2E) corrigido localmente, pendente segundo push e re-validação visual

---

## Por quê

V3 composition layer está 100% implementado e gerando os 13 slots, mas o último teste E2E da Sarah mostrou bugs visuais que quebram a experiência ("print" mencionado nas notas) e algumas features que faltam para chegar à paridade Gumpinho prometida no escopo C:

1. **Slot 2 (Dimensões)** sai sem cotas — regex de parseamento de `detalhesTecnicos` provavelmente não está capturando
2. **Slot 3 (Lifestyle+Callouts)** mostra 4 badges em vez dos 3 da spec
3. **Slots 5/6 (Aspiracional/Benefícios)** com placeholder vazando na imagem
4. **Slot 6 (Benefícios)** com elementos sobrepostos (alinhamento errado)
5. **Truncamento `...`** em texto que deveria caber
6. **Dimensão anúncio 1024×1024 → 2000×2000** (Amazon recomenda mínimo 1500px, 2000 é o sweet spot)
7. **A+ Premium 1464×600** e **A+ Comparison 220×220** não existem como slots
8. **FAQ** não é gerado hoje
9. **7 Destaques** não é gerado hoje (Gumpinho entrega; Bottega ainda não)
10. **Zip export** não existe — Sarah precisa baixar PNG por PNG

---

## Acceptance Criteria (Tier 0)

- [ ] **AC1:** Slot 2 mostra 3 cotas extraídas de `form.detalhesTecnicos` (largura, altura, profundidade) com labels em pt-BR perfeito
- [ ] **AC2:** Slot 3 mostra exatamente **3** badges circulares (não 4)
- [ ] **AC3:** Slots 5 e 6 sem placeholder vazando — overlay limpo
- [ ] **AC4:** Slot 6 sem sobreposição entre headline e bullets
- [ ] **AC5:** Nenhum texto truncado com `...` em qualquer slot quando o conteúdo cabe
- [ ] **AC6:** Slots de anúncio geram em **2000×2000** (constants `SLOT_DIMENSIONS` atualizado, prompt Gemini atualizado)
- [ ] **AC7:** Novo slot `aplus-premium` (1464×600) implementado com layout próprio
- [ ] **AC8:** Novo slot `aplus-comparison` (220×220) implementado com layout próprio
- [ ] **AC9:** FAQ gerado pelo pipeline (5-7 perguntas) e exibido em aba dedicada
- [ ] **AC10:** 7 Destaques gerados (bullet points punchy, máx 80 chars cada) e exibidos em aba dedicada
- [ ] **AC11:** Botão "Baixar tudo (.zip)" no `ResultsTabs.tsx` empacota: 13+ imagens PNG + textos (título, descrição, keywords, FAQ, destaques) em `.txt`/`.md` separados
- [ ] **AC12:** `npm run build` limpo, lint zero erros
- [ ] **AC13:** Smoke test E2E em deploy preview com 1 produto Amalfi real (dispenser dourado) — todas as ACs visuais passam

---

## Tasks (ordem sugerida — checklist do Dex)

### 🔧 Bloco A — Fix bugs visuais (rápido, low-risk) ~3h ✅

- [x] **A1:** `parseCotas` agora aceita "cm" opcional + fallback `AxBxC` sem cm + fallback 2D `AxB` + suporte "comprimento"
- [x] **A2:** Prompt do slot 3 reforçado com `NO_DECORATIVE_CIRCLES_ANCHOR` (proíbe Gemini gerar círculos decorativos extras na cena) + `NO_TEXT_ANCHOR`. Composer já garantia 3 badges no código
- [x] **A3:** Slots 5 e 6 ganharam `NO_TEXT_ANCHOR` (proibição estrita de texto/letras/labels na cena base) + ênfase no negative space "purely photographic with no decorative typography"
- [x] **A4:** Slot 5 — L2 y de 160→175, bulletStartY de 270→295. Slot 6 — L2 y de 145→160, bulletStartY de 240→270. Sobreposição eliminada
- [x] **A5:** Helper `shorten()` reescrito para cortar em espaço (não no meio de palavra) + limites aumentados: motivacoesShort 20→28, slot 6 bullets 32→42

### 📐 Bloco B — Dimensões corretas Amazon ~2h ✅

- [x] **B1:** `SLOT_DIMENSIONS` em `src/types/anuncio.ts` — 7 slots de anúncio agora 2000×2000
- [x] **B2:** Coords escaladas ×2.0 nos 6 slot composers com overlay (slots 2, 3, 4, 5, 6, 7). Slot 1 (capa) é passa-through, sem mudança
- [x] **B3:** Prompts em `slot-prompts.ts` atualizados — slot 1 removeu "1024×1024" hardcoded (Gemini gera no tamanho dele); slots 3 e 4 com coords absolutas convertidas pra percentuais (mais robustas a mudanças futuras)
- [x] **B3.5:** Pipeline + regen agora **sempre** chamam `cropToSize` (Sharp resize cover) — antes só A+, agora também upscale 1024→2000 do anúncio. Gemini Image gera ~1024 nativo, Sharp escala pra dim alvo antes do composer rodar
- [x] **B4:** Build (424ms) + lint passaram. Bundle client mantém 318KB (zero mudança — toda lógica é server). Bundle Functions cresce só pelo PNG output em runtime, não pelo código

### ➕ Bloco C — Novos slots A+ ~3h ✅

- [x] **C1:** `aplus-premium` adicionado em SlotKind + SLOT_VARIANT + SLOT_DIMENSIONS (1464×600) + SLOT_ORDER + SLOT_LABEL ("A+ Premium (1464×600)")
- [x] **C2:** `composer/slots/aplus-7-premium.ts` criado — layout hero amplificado horizontal: headline serif 64pt (até 2 linhas) + sub italic 26pt + 3 badges em row horizontal (vs 2 em coluna do aplus-header). Aproveita 50% mais largura
- [x] **C3:** Prompt em `slot-prompts.ts` — pede 16:9 ultra-wide cinematic, produto no terço direito, 2/3 esquerdos limpos, mood "editorial product showcase quiet luxury", reforço NO_TEXT
- [x] **C4:** Params extractor — usa `analise.persona.label` como headline (fallback "Pequenos gestos costeiros"), sub fixo, 3 badges Design/Acabamento/Durabilidade
- [x] **C5:** `aplus-comparison` adicionado (220×220) como slot independente pra Amazon Comparison Charts
- [x] **C6:** `composer/slots/aplus-8-comparison.ts` — passa-through limpo (sem overlay, igual à capa principal)
- [x] **C7:** `SLOT_ORDER` atualizado — premium e comparison no fim. Pipeline usa SLOT_ORDER automaticamente, sem hardcode
- [x] **C7.5:** Novo mapping `SLOT_ASPECT_RATIO` em `types/anuncio.ts` — pipeline agora usa por-slot ('1:1' | '4:3' | '16:9') em vez de inferir pela variante. Premium pede 16:9, comparison 1:1, demais inalterados
- [x] **C8:** UI `ResultsTabs.tsx` **não precisou mudar** — renderiza dinamicamente via `SLOT_ORDER.map` + `SLOT_LABEL[slot]`. Novos slots aparecem automaticamente nas sub-abas A+

### 📝 Bloco D — FAQ + 7 Destaques (texto) ~2h ✅

- [x] **D1:** FAQ — **já existia completo** (schema `descricaoSchema.faq`, gerado via `promptDescricao`, renderizado em ResultsTabs linha ~219). Sem retrabalho
- [x] **D2:** `destaquesSchema` adicionado em `schemas.ts` — `z.array(string min:8 max:80).length(7)` (paridade Gumpinho exige exatamente 7)
- [x] **D3:** `promptDestaques()` adicionado em `prompts.ts` — pede 7 destaques punchy mobile-first (≤80 chars), 7 ângulos diferentes (forma/função/durabilidade/contexto/sensação/design/propósito), zero superlativo vazio, voz Amalfi
- [x] **D4:** Pipeline — destaques gerado em paralelo com keywords/titulos/descricao (mesma promise.all), retornado em `CriacaoResults.destaques`
- [x] **D5:** `CriacaoResults.destaques?: string[]` adicionado (opcional pra backward-compat com anúncios antigos sem o campo)
- [x] **D6:** FAQ permanece dentro da aba "Descrição" (já estava ali e funcionando — nova aba seria duplicação)
- [x] **D7:** Bloco "7 Destaques" adicionado dentro da aba "Descrição", logo após FAQ — lista numerada `01.` `02.` ... com terracota italic, max-w 760px, sub-explicação "≤80 chars mobile-first pra carousel Amazon e social"
- [x] **D8 (bonus cleanup):** Removidas referências hardcoded a "1024×1024" no UI — agora reflete corretamente "2000×2000 anúncio + 970×600/1464×600/220×220 A+"

### 📦 Bloco E — Zip Export ~2h ✅

- [x] **E1:** `jszip@^3.x` adicionado em `package.json` (npm install — 13 packages, zero vulnerabilities)
- [x] **E2:** `src/lib/export/buildZip.ts` criado — função `buildZip(results, {productName})` retorna `{blob, filename}`. Estrutura:
  - `imagens/anuncio/{01-capa..07-prova-final}.png` (7 slots 2000×2000)
  - `imagens/aplus/{01-header..08-comparison}.png` (6 standard + premium 1464×600 + comparison 220×220)
  - `textos/{titulo.txt, descricao.md, bullets.md, keywords.txt, faq.md, destaques.md}`
  - `analise.md` (persona + dores + motivações)
  - `README.md` (sumário + checklist passo-a-passo Seller Central)
  - Helper `slotFilename()` mapeia slotKind → nome ordenado (com fallback pra anúncios antigos sem slotKind)
  - Helper `safeFolderName()` normaliza nome do produto pra slug ASCII (sem diacríticos)
  - Helper `downloadBlob(blob, filename)` dispara download client-side (sem endpoint)
- [x] **E3:** Botão "Baixar tudo (.zip)" no footer de `ResultsTabs.tsx` (substituiu "Exportar PDF" que não fazia nada). Recebe `productName` via prop nova
- [x] **E4:** Loading state — botão exibe "Empacotando…" durante geração + estado `error` com mensagem terracota se buildZip falhar (auto-clear em 4s)
- [x] **E5 (bonus):** `CriacaoPage.tsx` passa `productName={form.nomeProduto}` pro ResultsTabs

### ✅ Bloco F — Validação ~1h

- [x] **F1:** `npm run build` limpo (459ms, sem warnings)
- [x] **F2:** `npm run lint` zero erros
- [x] **F3:** Commit `671026c` consolidado (mudanças entrelaçadas no mesmo arquivo entre blocos B/C/D — splittar exigiria `git add -p` interativo; mensagem rica detalha cada bloco). +1004 / -143 linhas, 22 files
- [ ] **F4:** Push para preview deploy via @devops (handoff necessário — dev não tem permissão de push)
- [ ] **F5:** Smoke test E2E manual no preview pela Sarah: gerar anúncio com produto real, validar 13 ACs visuais do Marco

---

### 🔧 Bloco G — Fix bugs descobertos no E2E real (~2h) ✅

E2E real do owner expôs 4 bugs visuais que build/lint não pegam. Adicionei smoke test programático pra prevenir regressão.

- [x] **G0 (infra):** Criado `packages/bottega/scripts/smoke-composer.ts` — roda 15 slots com input mock realístico + Sharp local (zero custo Gemini), salva PNGs em `tmp/smoke/` pra inspeção visual. Adicionado script `npm run smoke`. Adicionado `tsx` como dev dep.
- [x] **G0.5 (parser tests):** Smoke roda 7 testes programáticos de `parseCotas` antes de gerar imagens — bloqueia build se algum input real falha. 7/7 passando incluindo caso real do owner ("23C x 7L centímetros")
- [x] **G1 (CRITICAL):** `parseCotas` refatorado em 4 padrões prioritários: palavras-chave → letra-sufixo (LACPH BR convention) → AxBxC → AxB. Aceita `cm` opcional, `centímetros`/`centimetros`, decimais com vírgula, `×` e `x`
- [x] **G2 (HIGH):** `BriefingTile.tsx` reescrito — número/título/tag agora ficam **abaixo** da imagem em legenda dedicada, não mais sobre a imagem (era position:absolute z-10, agora flex column gap-2)
- [x] **G3 (HIGH):** `shorten()` evoluído: limites motivacoesShort 28→50, comparativo 38→56. Stopwords pendurados (`para a`, `de um`, `em`) são removidos do fim antes do ellipsis
- [x] **G4 (MEDIUM):** Slot 3 badges recalibrados — y 720→540, x 320/1728→260/1740. Triângulo invertido empurra badges pras bordas, evita zona central onde Gemini coloca produto
- [x] **G5:** `npm run build` (526ms), `npm run lint` (zero), `npm run smoke` (15/15 + 7/7 parser) todos passam

---

### 🔧 Bloco H — Iter 2 do E2E (~30min) ✅

Iter 2 do E2E real (produto: Escultura Abaporu) expôs 2 bugs novos mais sutis:

- [x] **H1 (CRITICAL):** Bordas pretas (letterbox) em slots de anúncio. Causa: Gemini Image às vezes ignora `aspectRatio:'1:1'` e retorna PNG com letterbox preto embutido. Fix em `cropImage.ts`: `sharp.trim({ background: 'black', threshold: 12 })` antes do resize. Trim é no-op se imagem não tem letterbox
- [x] **H2 (CRITICAL):** Slot 3 badges com texto longo estourando círculo. Causa: usava `motivacoesShort` (50 chars, dimensionado pra slots 5/6) em badges circulares que comportam max ~22 chars. Fix: `slot-params.ts` agora aplica `shorten(label, 22)` específico no slot 3, sem regredir 50 chars dos slots 5/6
- [x] **H3 (bonus):** `shorten()` agora reserva 1 char pro ellipsis no orçamento. Antes "max 22" produzia 23 chars (22 + "…"); agora produz 22 (21 + "…"). Output garantido ≤ max
- [x] **H4 (smoke):** Adicionado `runTrimTests()` com mock letterbox 4:3 dentro de canvas 1:1 + caso clean. Adicionado `runBadgeLengthTests()` com motivações de 36-43 chars (caso real) validando que callouts saem ≤ 22 chars
- [x] **H5:** `npm run smoke` passa: 7 parser + 2 trim + 1 badge + 15 slots

---

### 🎨 Bloco I — Paridade visual Gumpinho (all-in, ~10.5h)

Owner forneceu pasta de referência Gumpinho real com 13 imagens (7 anúncio + 6 A+).
Análise comparativa identificou 7 mudanças pra alcançar paridade ~95%.

- [x] **I1 (HIGH, 2h):** Pills retangulares no slot 3 (substitui badges circulares). Ref: 04_Imagens/3.png + modulo-1.png — `drawPill` estendido com `iconKey` opcional + `measurePill` helper. 3 pills horizontais centralizadas no rodapé y:1820, padding 28×16, fontSize 32, weight 600. Limite shorten 22→30 chars (pills aceitam mais texto que badges circulares). Headline topo agora sans-bold 76pt (era serif 88pt). Prompt slot 3 agora pede TOP 15% + BOTTOM 18% livres (era 3 zonas circulares laterais). Smoke pill_tests passa: ≤ 30 chars validados
- [x] **I2 (HIGH, 1h):** `drawCallout` primitive (linha + ponto + label) pra apontar partes do produto. Ref: medidas.png + modulo-3.png — `drawCallout(opts)` aceita anchor/labelEnd/labelSide. Bonus: criei também `drawVerticalRuler` (caixa retangular outline + tickmarks + setas extremidades + label altura) — vai ser usado no Item 3 (slot 2 dimensões refatorado)
- [x] **I3 (HIGH, 2h):** Slot 2 dimensões refatorado — fundo claro neutro + 3 callouts apontadores + régua vertical. Ref: medidas.png — slot 2 reescrito do zero: headline sans-bold "Especificações Técnicas" topo, drawCallout pra largura/profundidade apontando produto à direita, drawVerticalRuler altura à direita (label centro), footer nome+capacidade. Prompt agora pede "neutral light studio backdrop, NO surface/marble/countertop/lifestyle — isolated catalog photo" — produto menor (45-55% width) com margens 22% laterais livres pra annotations
- [x] **I4 (HIGH, 1.5h):** Inverter hierarquia tipográfica — sans-serif bold dominante, serif italic só pra emoção. Ref: todas as 13 — anuncio-6 headline serif 100pt → sans-bold 84pt (slot é factual, não emocional). aplus-2 labels Antes/Depois 24pt → 38pt sans-bold gigante em 2 linhas (paridade modulo-2 Gumpinho), checks 18pt → 22pt. Slots emocionais (anuncio-4 "Qualidade e Confiança", anuncio-5 aspiracional, aplus-cta) MANTÊM serif italic — preserva estética Amalfi onde faz sentido
- [x] **I5 (MEDIUM, 2h):** Slot 4 comparativo split grande (não mini-canto). Ref: modulo-5.png — slot 4 reescrito: headline sans-bold "O Investimento Certo" topo, card "Comum" 40% esquerda (areia bg, label tinta-pill, silhueta abstrata, 3 X terracota), produto Amalfi 60% direita (Gemini renderiza), label "Curadoria Amalfi" pill ocre + 4 ✓ verdes com features. Prompt slot 4 agora pede "product on RIGHT 60%, LEFT 40% visually empty"
- [ ] **I6 (MEDIUM, 1h):** `drawSeal` octogonal premium dourado + aplicar em slots premium. Ref: 04_Imagens/3.png + modulo-1.png
- [ ] **I7 (LOW-MEDIUM, 1h):** aplus-cta com botão dourado destacado + 2 ícones rodapé (Garantia/Envio). Ref: modulo-6.png

---

## File List (esperado após implementação)

**Novos:**
- `packages/bottega/netlify/functions/_lib/composer/slots/aplus-7-premium.ts`
- `packages/bottega/netlify/functions/_lib/composer/slots/aplus-8-comparison.ts`
- `packages/bottega/src/lib/export/buildZip.ts`
- `packages/bottega/src/components/molecules/FaqAccordion.tsx`
- `packages/bottega/src/components/molecules/DestaquesList.tsx`

**Modificados:**
- `packages/bottega/package.json` (+jszip)
- `packages/bottega/src/types/anuncio.ts` (SlotKind +2, CriacaoResults +faq +destaques)
- `packages/bottega/netlify/functions/_lib/composer/constants.ts` (SLOT_DIMENSIONS update)
- `packages/bottega/netlify/functions/_lib/composer/slots/anuncio-3-lifestyle-callouts.ts` (fix 3 badges)
- `packages/bottega/netlify/functions/_lib/composer/slots/anuncio-5-aspiracional.ts` (fix placeholder)
- `packages/bottega/netlify/functions/_lib/composer/slots/anuncio-6-beneficios.ts` (fix sobreposição + placeholder)
- `packages/bottega/netlify/functions/_lib/composer/primitives.ts` (fix truncamento)
- `packages/bottega/netlify/functions/_lib/slot-params.ts` (regex cotas + extractors p/ premium/comparison/faq/destaques)
- `packages/bottega/netlify/functions/_lib/slot-prompts.ts` (prompts 2000×2000 + premium + comparison)
- `packages/bottega/netlify/functions/_lib/pipeline.ts` (faq+destaques+slots novos)
- `packages/bottega/src/lib/gemini/prompts.ts` (promptFaq, promptDestaques)
- `packages/bottega/src/lib/gemini/schemas.ts` (faqSchema, destaquesSchema)
- `packages/bottega/src/components/organisms/ResultsTabs.tsx` (abas FAQ/Destaques + botão zip)

---

## Riscos identificados

1. **Recalibrar coords ao escalar 1024→2000:** todas as primitives usam coords absolutas. Vou multiplicar por 2.0 onde fizer sentido, mas alguns elementos (padding margem, tamanhos de ícone) podem precisar ajuste manual.
2. **Bundle size com 2000px:** PNG output será ~4× maior. Conferir limite Netlify (250MB) e tempo de upload.
3. **Slot premium (1464×600) sem layout específico no blueprint do Marco:** vou propor layout baseado no aplus-1-header amplificado, mas pode precisar revisão dele.
4. **JSZip no client cresce bundle:** ~50KB minified. Aceitável.

---

## Change Log

| Data | Autor | Mudança |
|------|-------|---------|
| 2026-05-07 | @dev (Dex) | Story criada baseada em memória do projeto + leitura das specs V3 |

---

## Dev Agent Record

**Agent Model Used:** claude-opus-4-7[1m]
**Debug Log References:** —
**Completion Notes:**
- Commit consolidado `671026c` em vez de 5 commits temáticos. Razão: vários arquivos (pipeline.ts, types/anuncio.ts, slot-prompts.ts, slot-params.ts, ResultsTabs.tsx) acumularam mudanças de blocos diferentes — splittar exigiria `git add -p` interativo. Mensagem do commit estrutura cada bloco com seu escopo.
- FAQ não precisou de retrabalho: schema/geração/UI já existiam (descobertos durante exploração do Bloco D).
- Bloco D economizou ~30min porque só 7 Destaques precisava ser implementado.
- Bug do "4º badge" no slot 3 foi diagnosticado como **artefato Gemini** (modelo gerando elementos circulares decorativos extras no negative space), não bug de código. Fix via prompt anchor (NO_DECORATIVE_CIRCLES).
- ⚠️ Recalibração de coords ×2.0 (Bloco B) é aproximação: alguns elementos podem precisar ajuste fino no E2E. Estratégia escolhida: validar primeiro com Sarah, ajustar pontualmente onde feio.
