# Bottega — Architecture

> Espelha a spec em `docs/architecture/bottega-spec.md` com o estado real após refactor do `@dev` (Dex) sobre a overnight build do Orion.

## Princípios

1. **Atomic Design.** Atoms → Molecules → Organisms → Pages.
2. **Tokens first.** Sem cor/font/spacing hardcoded.
3. **Server-side proxy.** Key Gemini fica em Netlify Functions, nunca no client.
4. **Mock-first toggle.** `VITE_USE_MOCK=true` por default; Functions chamadas só quando `false`.
5. **Zod no boundary.** Toda resposta Gemini com `.min()` + `.max()` explícitos.
6. **Persist com migration.** Schema versionado, `migrate(state, version)` cuida de upgrades.
7. **Graceful degradation.** Imagem que falha não derruba o fluxo; é marcada `falhou:true`.

---

## Topologia

```
┌─────────────────────────────────────────────────────┐
│  Browser (React + Vite bundle)                      │
│  Sem @google/genai, sem GEMINI_API_KEY              │
├─────────────────────────────────────────────────────┤
│           ↓ fetch /.netlify/functions/*             │
├─────────────────────────────────────────────────────┤
│  Netlify Functions (Node 20, esbuild)               │
│  process.env.GEMINI_API_KEY (Netlify secrets)       │
│  - gemini-text  (POST)                              │
│  - gemini-image (POST)                              │
│  - smoke-test   (GET)                               │
├─────────────────────────────────────────────────────┤
│           ↓ @google/genai SDK                       │
├─────────────────────────────────────────────────────┤
│  Google AI Platform                                 │
│  - Gemini 2.5 Flash (texto + Google Search)         │
│  - Imagen 4.0       (imagens)                       │
└─────────────────────────────────────────────────────┘
```

---

## Layers (frontend)

```
┌─────────────────────────────────────────────────────┐
│  Pages (4)              ← rotas + composição        │
├─────────────────────────────────────────────────────┤
│  Organisms (8)          ← seções de página          │
├─────────────────────────────────────────────────────┤
│  Molecules (10)         ← combos de atoms           │
├─────────────────────────────────────────────────────┤
│  Atoms (12)             ← primitives                │
├─────────────────────────────────────────────────────┤
│  Lib (gemini · mocks · utils)                       │
├─────────────────────────────────────────────────────┤
│  Store (Zustand)        ← anunciosStore + criacaoStore │
├─────────────────────────────────────────────────────┤
│  Types (domain)                                     │
└─────────────────────────────────────────────────────┘
```

---

## Components inventory

### Atoms (12)
Eyebrow · Display · Editorial · BodyText · Button (5×3) · Input · Textarea · Slider · ToggleGroup · Badge · Avatar · Dot.

### Molecules (10)
Stat · Lockup · MonogramaA · Field · **Dropzone (com validação tipo+tamanho)** · KeywordChip · TabItem · CardAnuncio · **BriefingTile (com flag failed)** · TituloListItem.

### Organisms (8)
Brandbar · HeroEditorial · StatsRow · CatalogoSection · **FormCriacao (validação nome+detalhes)** · ResultsTabs · ResultsBlock · GlobalFooter.

### Pages (4)
**AtelierPage** · **CriacaoPage (useRef pra dedup save)** · **CatalogoPage** · **ConfiguracoesPage (usa Function smoke-test)**.

---

## Lib · Gemini (client side)

### `orchestrator.ts`
Não importa mais `@google/genai`. Em vez disso:
- `callTextFn(prompt, useSearch)` → POST `/.netlify/functions/gemini-text` com AbortController/timeout
- `callImageFn(prompt, negative)` → POST `/.netlify/functions/gemini-image`, retorna null em erro (graceful)
- `extractJson(text, kind)` → try-catch com `cause` + preview do payload bruto
- `geminiJson(kind, prompt, validator, useSearch)` → wrapper que combina text fn + extract + Zod validate

`gerarTudoReal(form)`:
1. `gerarAnalise` (com Search)
2. `Promise.all([keywords, titulos, descricao])` — paralelo
3. `gerarBriefings`
4. `gerarImagens` (paralelo, falhas isoladas)

`smokeTestGeminiViaFn()` → GET `/.netlify/functions/smoke-test`.

### `prompts.ts`
5 builders + `buildImagenPrompt`. VOZ_AMALFI embutida (proibe "PROMOÇÃO IMPERDÍVEL", "premium soft touch", caps, exclamações).

### `schemas.ts`
Zod com bounds explícitos pra resistir a Gemini alucinando arrays gigantes.

---

## Lib · Mocks

`gerarMockTudo()` retorna `CriacaoResults` realista (tomada NBR 14136). Usado quando `USE_MOCK=true`. `LOADING_MESSAGES` rotacionados a cada 1.2s no spinner.

---

## State management

### `anunciosStore`
- Persist com `version: 2`, `migrate` callback
- v1 → v2: adiciona `falhou` em todas as imagens persistidas (`falhou: !img.base64`)
- Storage: `localStorage` chave `bottega.anuncios`

### `criacaoStore`
- `formInicial()` agora é factory (sem state compartilhado entre resets)
- `generate()` checa `status === 'gerando'` no início — race condition fixed
- `clearInterval` em `finally` (não duplica)

---

## Netlify Functions (server side)

Todas em TypeScript, transpilação esbuild via `[functions] node_bundler = "esbuild"` no `netlify.toml`.

### `gemini-text.ts`
- POST `{ prompt, useSearch?, model? }`
- Valida prompt obrigatório, max 50k chars
- `Promise.race` com timeout 90s
- Retorna `{ text, latencyMs }` ou `{ error, latencyMs }` HTTP 502
- Sem cache (`Cache-Control: no-store`)

### `gemini-image.ts`
- POST `{ prompt, negativePrompt?, aspectRatio? }`
- Valida prompt max 4k chars
- Timeout 120s
- Retorna `{ base64, modelUsado, latencyMs }`
- Aspect ratio default `1:1`

### `smoke-test.ts`
- GET → `{ ok, latencyMs, sample, error? }`
- Sempre HTTP 200 (UI consome o `ok`)

---

## Tokens

### Paleta (60-25-15 + secundárias)

| Token | Hex | Papel |
|-------|-----|------|
| osso | `#F8F4EE` | bg principal (60%) |
| areia | `#E8DFD2` | bg secundário (25%) |
| tinta | `#1F2A3A` | text + bg dark (15%) |
| mar | `#2D5D7B` | accent links/focus |
| terracota | `#C47855` | CTA |
| ceu | `#A8C0CF` | sub |
| ocre | `#D4A876` | sub |

### Tipografia

| Token | Família |
|-------|---------|
| display | DM Serif Display |
| editorial | Cormorant Garamond Italic |
| ui | Inter |

---

## Build pipeline

```
npm run build
├─ tsc -b              # ~150ms
└─ vite build          # ~570ms
   └─ output: dist/
      ├─ index.html             1 kB
      ├─ assets/index.css      24 kB (gzip 6kB)
      ├─ assets/orchestrator…  76 kB (gzip 22kB) ← lazy chunk só quando USE_MOCK=false
      └─ assets/index.js      313 kB (gzip 100kB) ← React + Router + Radix + Zustand
```

Bundle client **não contém** `GoogleGenAI` nem a key (validado via grep).

---

## Deploy Netlify

`netlify.toml`:
- `base = "packages/bottega"` (monorepo)
- `publish = "dist"`
- `command = "npm run build"`
- `functions = "netlify/functions"`
- `node_bundler = "esbuild"`
- `external_node_modules = ["@google/genai"]`
- SPA redirect `/* → /index.html`
- Headers: X-Frame-Options DENY, Referrer-Policy strict-origin

Env vars no painel Netlify:
- `GEMINI_API_KEY` (obrigatória)
- `GEMINI_TEXT_MODEL` (opcional, default `gemini-2.5-flash`)
- `GEMINI_IMAGE_MODEL` (opcional, default `imagen-4.0-generate-001`)

---

## Não implementado (backlog explícito)

- **Tests.** Vitest + RTL configurados, sem suite escrita.
- **Cost tracking** por geração na UI.
- **Foto crua usada como referência visual no Imagen** (gap funcional vs. ideal: hoje a foto serve só pra preview no form, não influencia geração de imagens).
- **Export PDF** do anúncio finalizado (botão existe na UI mas não faz nada).
- **Edit/regenerar** painéis individuais (regenerar só keywords, p.ex.).
- **ASIN integration** com Seller Central API (campo existe no tipo, sem fluxo).
- **i18n** — hardcoded pt-BR.
