# Bottega — Architecture

> Espelha a spec em `docs/architecture/bottega-spec.md` com o que foi de fato implementado.

## Princípios

1. **Atomic Design.** Atoms → Molecules → Organisms → Pages. Sem componentes "soltos".
2. **Tokens first.** Nenhuma cor/font/spacing hardcoded. Tudo vem de `tokens.css` e `tailwind.config.js`.
3. **Mock-first, real-on-toggle.** Default seguro (mock); 1 linha no `.env` flipa pra Gemini real.
4. **Zod no boundary.** Toda resposta do Gemini passa por schema Zod antes de virar tipo TS.
5. **Persist mínimo.** Só `Anuncio[]` é persistido. Estado da geração ativa é volátil.

---

## Layers

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

| Componente | Responsabilidade |
|-----------|------------------|
| `Eyebrow` | Caption uppercase tracked, Inter 500 11px |
| `Display` | DM Serif título grande |
| `Editorial` | Cormorant italic para ênfase |
| `BodyText` | Inter 400 corpo de texto |
| `Button` | 5 variants (primary, secondary, ghost, link, terra) × 3 sizes (sm, md, lg) |
| `Input` | forwardRef, border-tinta-15 → focus mar |
| `Textarea` | forwardRef, mesmo estilo do Input |
| `Slider` | Radix Slider com track tinta-15 e thumb terracota |
| `ToggleGroup` | Radix ToggleGroup (estilo das imagens: lifestyle/info/misto) |
| `Badge` | tones: terra, mar, neutral |
| `Avatar` | círculo Tinta com inicial Osso |
| `Dot` | bullet colorido inline (mar/terracota) |

### Molecules (10)

| Componente | Composição |
|-----------|-----------|
| `Stat` | Display number + Eyebrow label (12 / 487 / 94 no Atelier) |
| `Lockup` | "Bottega *by* Amalfi & Co." em 3 variants (brandbar/footer/inline) |
| `MonogramaA` | Círculo terracota + DM Serif "A" + Cormorant "·co.·" |
| `Field` | Label (Eyebrow) + Input/Textarea + helper (italic Cormorant) |
| `Dropzone` | drag-and-drop com FileReader → base64 |
| `KeywordChip` | pill terracota-outlined, click pra copiar |
| `TabItem` | Radix Tabs.Trigger com underline terracota no active |
| `CardAnuncio` | media bg paleta + body Osso + meta com Dot |
| `BriefingTile` | numerado, com paletaCor de fundo, prompt em Cormorant italic |
| `TituloListItem` | número + texto + char-count + foco badge |

### Organisms (8)

| Componente | Função |
|-----------|--------|
| `Brandbar` | sticky top, Lockup + nav React Router (active = underline terracota) |
| `HeroEditorial` | bg Tinta + Osso text + blur radial `aquarela-mar` + CTA terracota |
| `StatsRow` | 3 Stats em row, bg Areia |
| `CatalogoSection` | grid de CardAnuncio (mistura persisted + samples) |
| `FormCriacao` | form completo (6 campos) com validation + submit |
| `ResultsTabs` | Radix Tabs com 5 panels: análise/keywords/títulos/descrição/briefings |
| `ResultsBlock` | wrapper editorial pros painéis |
| `GlobalFooter` | Lockup footer + 3 nav cols + MonogramaA terra |

### Pages (4)

| Page | Layout |
|------|--------|
| `AtelierPage` | Brandbar + Hero + StatsRow + CatalogoSection + Footer |
| `CriacaoPage` | Brandbar + split (Form 50% Areia / Results 50% Tinta) + Footer |
| `CatalogoPage` | Brandbar + lista filtrável + Footer |
| `ConfiguracoesPage` | Brandbar + status panel (USE_MOCK + HAS_VALID_KEY + smoke button) |

---

## Lib · Gemini

### `client.ts`
- `getGeminiClient()` — singleton cached, lê `VITE_GEMINI_API_KEY`
- `smokeTestGemini()` — chamada mínima de validação (~$0)

### `prompts.ts`
5 builders + 1 helper, todos com VOZ_AMALFI embutida:
- `promptAnalise(form)` → análise de mercado
- `promptKeywords(form, analise)` → 50 termos agrupados
- `promptTitulos(form, analise, keywords)` → 5 produto + 5 dor
- `promptDescricao(form, analise, keywords, titulos)` → desc + bullets + FAQ
- `promptBriefings(form, analise)` → N cenas (numeroImagens do form)
- `buildImagenPrompt(briefing)` → prompt final pra Imagen 4

### `schemas.ts`
Zod schemas espelhando os tipos em `types/anuncio.ts`. Cada schema valida o JSON parseado da resposta do Gemini.

### `orchestrator.ts`
`gerarTudoReal(form)`:
1. `await` análise
2. `Promise.all([keywords, titulos, descricao])` — paralelo
3. `await` briefings
4. `Promise.all(briefings.map(gerarImagem))` — paralelo
5. Retorna `CriacaoResults` com `modoGeracao: 'real'`

`extractJson()` lida com Gemini ocasionalmente envelopar JSON em markdown ```json blocks.

---

## State management

### `anunciosStore`
```ts
interface AnunciosState {
  anuncios: Anuncio[];
  add(a: Anuncio): void;
  update(id: string, patch: Partial<Anuncio>): void;
  remove(id: string): void;
}
```
- Middleware: `persist`
- Storage key: `bottega.anuncios`
- Version: 1

### `criacaoStore`
```ts
interface CriacaoState {
  form: CriacaoForm | null;
  results: CriacaoResults | null;
  loading: boolean;
  loadingMessage: string;
  error: string | null;
  generate(form: CriacaoForm): Promise<void>;
  reset(): void;
}
```
- `generate()` checa `USE_MOCK` e `HAS_VALID_KEY`, escolhe mock vs real
- Rotaciona `loadingMessage` (array em `mocks/index.ts`) a cada 1.2s
- Não persiste — só vive durante a sessão

---

## Tokens

### Paleta (60-25-15 + secundárias)

| Token | Hex | Papel |
|-------|-----|------|
| `--color-osso` | `#F8F4EE` | bg principal (60%) |
| `--color-areia` | `#E8DFD2` | bg secundário (25%) |
| `--color-tinta` | `#1F2A3A` | text + bg dark (15%) |
| `--color-mar` | `#2D5D7B` | accent links/focus |
| `--color-terracota` | `#C47855` | CTA + acento |
| `--color-ceu` | `#A8C0CF` | sub-tom |
| `--color-ocre` | `#D4A876` | sub-tom |

Plus alphas: `tinta-08`, `tinta-15`, `tinta-65`.

### Typography

| Token | Família | Uso |
|-------|---------|-----|
| `--font-display` | DM Serif Display | títulos grandes |
| `--font-editorial` | Cormorant Garamond Italic | ênfase, voz |
| `--font-ui` | Inter | UI, eyebrows, body |

Escala: display-xl (96px) → display-l (72) → display-m (48) → display-s (32) → editorial-xl/l/m → h1/h2/h3 → lede → body-lg/body → eyebrow → button → caption → meta.

### Spacings

`section: 80px`, `section-lg: 120px`, `section-xl: 160px`. Resto via Tailwind default.

---

## Build pipeline

```
npm run build
├─ tsc -b              # type check (strict)
└─ vite build          # bundle (Rollup)
   └─ output: dist/    # 1 HTML + 1 JS chunk + 1 CSS chunk
```

Tempos atuais (M1 Mac): tsc ~150ms, vite ~550ms, total ~700ms · 176 modules.

---

## Não implementado (escopo futuro)

- **Tests.** Vitest + RTL configurados na infra, mas sem suite. Próxima iteração.
- **i18n.** Hardcoded pt-BR — sem framework de tradução.
- **Auth.** Single-user local. Sem login/multi-tenant.
- **Server-side.** 100% client. Key Gemini exposta no bundle (aceitável pra single-user; em produção teria proxy).
- **PDF export.** Spec original mencionava PDF do anúncio finalizado. Adiar.
- **ASIN integration.** Campo `Anuncio.asin` existe mas não há integração com Seller Central API.
