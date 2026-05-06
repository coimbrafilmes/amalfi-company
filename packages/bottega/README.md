# Bottega · by Amalfi & Co.

Atelier digital de criação de anúncios Amazon BR — texto + imagem, gerados por Gemini 2.5 Flash + Imagen 4, vestidos na identidade Amalfi & Co.

> *Pequenos objetos para uma vida costeira — escolhidos com cuidado, levados com calma.*

Clone funcional do GUMPINHO (`gerador-de-anucio10de10.netlify.app`), reconstruído sob a identidade visual do Amalfi & Co. (Costa Amalfitana · Tinta + Mar + Terracota · DM Serif + Cormorant Italic + Inter).

---

## Quickstart

```bash
cd packages/bottega
npm install
npm run dev
```

Abra `http://localhost:5173`.

### Modo de geração

Por padrão o app roda em **mock** — todas as gerações usam dados pré-cozidos (realistas, baseados na tomada NBR 14136 do Marco). Zero custo, zero rede, ideal pra dev e demo.

Pra ligar o **Gemini real**, edite `.env`:

```diff
- VITE_USE_MOCK=true
+ VITE_USE_MOCK=false
```

Depois reinicie o dev server. A `VITE_GEMINI_API_KEY` já está provisionada no `.env` local.

### Smoke test (validar a key sem gastar tokens)

```bash
node scripts/smoke-test.mjs
```

Faz uma chamada mínima ao Gemini 2.5 Flash com o prompt `"Responda apenas com a palavra 'ok'."`. Custa ~0 tokens (free tier). Sai com código `0` se a key for válida.

---

## Scripts

| Script | O que faz |
|--------|-----------|
| `npm run dev` | Vite dev server (porta 5173) |
| `npm run build` | `tsc -b && vite build` (saída `dist/`) |
| `npm run preview` | Serve `dist/` localmente |
| `npm run lint` | ESLint |
| `node scripts/smoke-test.mjs` | Valida `VITE_GEMINI_API_KEY` |

---

## Estrutura

```
src/
├── components/        # Atomic Design (Brad Frost)
│   ├── atoms/        # 12 — Button, Input, Slider, Badge, etc.
│   ├── molecules/    # 10 — Field, Dropzone, Lockup, CardAnuncio, etc.
│   └── organisms/    # 8 — Brandbar, HeroEditorial, FormCriacao, ResultsTabs, GlobalFooter
├── pages/            # 4 — Atelier, Criacao, Catalogo, Configuracoes
├── lib/
│   ├── gemini/       # client + prompts + schemas + orchestrator
│   ├── mocks/        # dados mockados (tomada SKU)
│   └── utils/        # cn, env, slug
├── store/            # Zustand (anunciosStore persistido + criacaoStore)
├── styles/           # globals.css + tokens.css (Amalfi)
└── types/            # domain types (CriacaoForm, Anuncio, etc.)
```

Tokens de design em **3 formatos**:
- `src/styles/tokens.css` (CSS custom properties)
- `tailwind.config.js` (Tailwind tokens)
- `docs/brand/tokens/tokens.json` (W3C DTCG bundle)

---

## Stack

- **React 19** + **TypeScript** + **Vite v8**
- **Tailwind CSS v3** (escolhido sobre v4 por estabilidade ESM)
- **Zustand** (com `persist` middleware — chave `bottega.anuncios`)
- **React Router v6**
- **Radix UI** (Slider, Tabs, ToggleGroup) — primitives sem estilo, tokens nossos
- **`@google/genai`** SDK pra Gemini Flash + Imagen 4
- **Zod** schemas pra runtime validation das respostas do Gemini
- **clsx** pra composição de classes

---

## Pipeline de geração (`gerarTudoReal`)

1. **Análise de mercado** (Gemini Flash) — persona, dores, motivações, janela de decisão
2. **Em paralelo** (3 chamadas concorrentes):
   - Keywords agrupadas (50 termos, 5 grupos)
   - Títulos (5 produto + 5 dor)
   - Descrição completa (description, HTML, 5 bullets Amazon, FAQ)
3. **Briefings de imagem** (Gemini Flash) — 7-12 cenas com prompt + overlay + paletaCor
4. **Imagens** (Imagen 4) — uma chamada por briefing

Tudo passa por **Zod schemas** (`lib/gemini/schemas.ts`) antes de virar tipo `CriacaoResults`. Erros retornam graciosamente com fallback pro último mock.

---

## VOZ Amalfi (embutida nos prompts)

Regras embedadas em todos os prompt builders:

- **NÃO usar:** "PROMOÇÃO IMPERDÍVEL", "premium soft touch", "incrível", caps lock, exclamações
- **USAR:** linguagem editorial calma, italic Cormorant pra ênfase, pt-BR coloquial culto
- **Tom:** "A vida boa cabe em pequenos gestos."
- **Referência:** `docs/brand/01-direction-amalfi-editorial.md`

---

## Páginas

| Rota | Componente | O que mostra |
|------|-----------|--------------|
| `/atelier` | `AtelierPage` | Hero editorial + stats + grid de cards do catálogo |
| `/novo` | `CriacaoPage` | Form à esquerda (Areia) + Results à direita (Tinta) |
| `/catalogo` | `CatalogoPage` | Lista completa de anúncios persistidos |
| `/configuracoes` | `ConfiguracoesPage` | Status `USE_MOCK` + key check + botão smoke test |

---

## State

- **`anunciosStore`** (Zustand + persist) — array de `Anuncio`, salvo em `localStorage` com chave `bottega.anuncios`, version 1
- **`criacaoStore`** — estado da geração ativa (form, results, loading, error). Toggle mock vs real via `VITE_USE_MOCK`. Rotaciona `loadingMessage` a cada 1.2s.

---

## Limitações conhecidas

- **Imagen 4 não foi testado live** — código pronto, key tem permissão, mas custo por imagem é alto (~$0.04). Recomendação: rodar mock primeiro, ligar imagens depois quando o owner aprovar uma capa.
- **Smoke test não roda dentro do Claude Code** — o sandbox bloqueia chamadas externas. Rode manualmente no terminal.
- **Sem testes unitários** — escopo overnight focou em rendering correto + build limpo. Tests ficam pra próxima iteração.
- **HEIC upload não converte** — Dropzone aceita PNG/JPG/HEIC mas só base64-encoda; o Gemini Vision aceita HEIC nativamente, então a foto crua passa direto.

---

## Próximos passos sugeridos

1. Owner liga `VITE_USE_MOCK=false` e gera o primeiro anúncio real (tomada).
2. Validar VOZ_AMALFI saindo correta nos títulos e descrição.
3. Aprovar uma capa, ligar Imagen 4 pras 9 cenas.
4. Subir o anúncio gerado pro Seller Central, anotar ASIN no `Anuncio.asin`.
5. Iterar sobre keywords/títulos baseado em métricas reais do anúncio.

---

*Built overnight — 2026-05-05 → 2026-05-06.*
*Design: Uma. Code: Orion. Brand: Amalfi & Co. (Sarah Mendes).*
