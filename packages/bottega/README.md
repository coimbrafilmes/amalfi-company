# Bottega · by Amalfi & Co.

Atelier digital de criação de anúncios Amazon BR — texto + imagem, gerados por Gemini 2.5 Flash + Imagen 4 via **Netlify Functions** (key server-side, nunca exposta no client), vestidos na identidade Amalfi & Co.

> *Pequenos objetos para uma vida costeira — escolhidos com cuidado, levados com calma.*

Clone funcional do GUMPINHO (`gerador-de-anucio10de10.netlify.app`), reconstruído sob a identidade visual Amalfi & Co. (Costa Amalfitana · Tinta + Mar + Terracota · DM Serif + Cormorant Italic + Inter).

---

## Arquitetura — segurança first

```
Browser (React/Vite)
  ↓ fetch
Netlify Function (Node)  ← API key vive aqui (process.env.GEMINI_API_KEY)
  ↓ @google/genai
Gemini Flash / Imagen 4
```

A key Gemini fica **só no servidor**, configurada no painel Netlify. O bundle JS público não tem nem 1 byte da key. O client só sabe falar com `/.netlify/functions/*`.

3 Functions:
- `gemini-text` — análise, keywords, títulos, descrição, briefings (qualquer chamada de texto)
- `gemini-image` — Imagen 4
- `smoke-test` — health check (`GET → ok|erro`)

---

## Quickstart

### 1. Dev local em **modo mock** (zero $)

```bash
cd packages/bottega
npm install
npm run dev          # http://localhost:5173
```

Mock = dados pré-cozidos realistas (tomada NBR 14136). Nenhuma chamada externa.

### 2. Dev local com **Functions reais**

Pra testar a integração Gemini ao vivo localmente, instale o Netlify CLI e use `netlify dev`:

```bash
npm install -g netlify-cli
cd packages/bottega
netlify dev          # roda Vite + Functions juntos em http://localhost:8888
```

Em `.env`, troque:
```diff
- VITE_USE_MOCK=true
+ VITE_USE_MOCK=false
```

A `GEMINI_API_KEY` do `.env` é lida pelas Functions (não vai pro bundle).

### 3. Smoke test direto à API (não passa pelas Functions)

```bash
node scripts/smoke-test.mjs
```

Validação simples ~$0 da `GEMINI_API_KEY`. Útil pra confirmar que a key tá viva antes de deployar.

---

## Deploy Netlify (entrega ao `@devops`)

1. Conectar o repositório ao Netlify.
2. Site settings → Build:
   - Base directory: `packages/bottega`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Site settings → Environment variables:
   - `GEMINI_API_KEY` = (a key)
   - `GEMINI_TEXT_MODEL` = `gemini-2.5-flash` (opcional)
   - `GEMINI_IMAGE_MODEL` = `imagen-4.0-generate-001` (opcional)
4. Site settings → Build configuration: confirma que vai ler `netlify.toml`.
5. Deploy → testa `/configuracoes` → botão "Verificar agora" → deve sair "✓ ok".

`netlify.toml` na raiz do pacote já cuida de:
- SPA redirect (`/* → /index.html`)
- Functions dir (`netlify/functions`)
- Headers de segurança (CSP, X-Frame-Options, etc.)
- Cache de assets

---

## Scripts

| Script | O que faz |
|--------|-----------|
| `npm run dev` | Vite dev (mock) |
| `npm run build` | `tsc -b && vite build` (out: `dist/`) |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |
| `node scripts/smoke-test.mjs` | Valida `GEMINI_API_KEY` direto na API |

Pra dev real (com Functions): `netlify dev` (CLI Netlify).

---

## Estrutura

```
packages/bottega/
├── netlify/
│   └── functions/      ← server-side proxy (Node)
│       ├── gemini-text.ts
│       ├── gemini-image.ts
│       └── smoke-test.ts
├── netlify.toml        ← build + redirects + headers
├── public/
│   └── _redirects      ← fallback SPA redirect
└── src/
    ├── components/     # Atomic Design
    │   ├── atoms/      (12)
    │   ├── molecules/  (10)
    │   └── organisms/  (8)
    ├── pages/          (4)
    ├── lib/
    │   ├── gemini/     # client orchestrator (chama Functions via fetch)
    │   ├── mocks/
    │   └── utils/
    ├── store/          # Zustand
    ├── styles/
    └── types/
```

---

## Stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS 3** com tokens Amalfi
- **Zustand** (persist em localStorage, key `bottega.anuncios`, version 2 com migration)
- **React Router 7**
- **Radix UI** (Slider, Tabs, ToggleGroup, Dialog, Tooltip)
- **Zod 4** — runtime validation com bounds explícitos
- **@netlify/functions** — TypeScript handlers
- **@google/genai** — só no lado servidor, nunca no client
- **clsx**

---

## Pipeline de geração (`gerarTudoReal`)

1. **Análise de mercado** (Gemini Flash + Google Search) — persona, dores, motivações, janela
2. **Em paralelo** (3 chamadas):
   - Keywords (50 termos / 5 grupos / Google Search)
   - Títulos (5 produto + 5 dor)
   - Descrição (description, HTML A+, 5 bullets Amazon, FAQ)
3. **Briefings de imagem** (Gemini Flash) — N cenas
4. **Imagens** (Imagen 4) — 1 chamada por briefing, paralelo, graceful (falhas individuais não derrubam o fluxo)

Todo retorno passa por **Zod com `.min()` + `.max()`** antes de virar tipo TS.

---

## Bug fixes aplicados (vs. versão overnight)

| Severidade | Fix |
|-----------|-----|
| CRITICAL | API key migrada do client pra Netlify Functions |
| CRITICAL | Dropzone valida tipo + tamanho (10 MB) |
| CRITICAL | `criacaoStore.generate` com guard de race condition |
| CRITICAL | `extractJson` com try-catch + cause + preview |
| CRITICAL | Schemas Zod com `.max()` em todos arrays |
| HIGH | FormCriacao valida nome (3+) e detalhes técnicos (20+) |
| HIGH | Timeout (90s texto / 120s imagem) com AbortController |
| HIGH | Imagens falhadas marcadas `falhou:true` com badge na tile |
| HIGH | `anunciosStore` com `migrate` versioning (v1→v2) |
| HIGH | `vite.config.ts` com `outDir + target` configurados |
| HIGH | `_redirects` SPA pra evitar 404 em `/novo` em produção |
| MEDIUM | ESLint `argsIgnorePattern: '^_'` global, sem `disable-next-line` |
| MEDIUM | CardAnuncio dead code removido (`isLight` span) |
| MEDIUM | CriacaoPage usa `useRef` pra deduplicar saves no anunciosStore |

---

## VOZ Amalfi (embutida nos prompts)

- **NÃO usar:** "PROMOÇÃO IMPERDÍVEL", "premium soft touch", caps lock, exclamações
- **USAR:** linguagem editorial calma, italic Cormorant pra ênfase, pt-BR coloquial culto
- **Tom:** "A vida boa cabe em pequenos gestos."
- **Referência:** `docs/brand/01-direction-amalfi-editorial.md`

---

## Páginas

| Rota | Componente | O que mostra |
|------|-----------|--------------|
| `/atelier` | AtelierPage | Hero + stats + grid de cards |
| `/novo` | CriacaoPage | Form (Areia) + Results (Tinta) |
| `/catalogo` | CatalogoPage | Lista completa |
| `/configuracoes` | ConfiguracoesPage | Status modo + smoke test via Function |

---

## Limitações conhecidas

- **Imagen 4 ainda não foi testado live** — Function pronta, lógica pronta, mas custo (~$0.04/imagem × 9 cenas = ~$0.36 por anúncio) tornou prudente esperar primeiro mock OK + smoke test OK antes de queimar tokens. `@devops` pode validar pós-deploy.
- **Sem testes unitários** — escopo atual focou em rendering correto + build limpo + paridade funcional. Vitest fica pra próxima sprint.
- **HEIC não converte client-side** — Dropzone aceita HEIC e envia base64. Gemini Vision aceita HEIC nativamente, então funciona mesmo sem conversão. Se em algum momento precisar exibir preview HEIC no Safari/Chrome desktop, precisamos converter.
- **Sem cost tracking** — futuro: log do custo estimado por geração na UI.

---

*Atualizado: 2026-05-06 · Dex (full-stack) refatorou da overnight build do Orion.*
