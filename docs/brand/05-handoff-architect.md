# Handoff — Bottega by Amalfi & Co.
## Para @architect (Aria) começar o spec técnico

> **De**: @ux-design-expert (Uma) → **Para**: @architect (Aria)
> **Data**: 2026-05-06
> **Status**: visual aprovado pelo owner. Pronto pra Aria fazer spec técnico.

---

## 🎯 O que é a Bottega

Plataforma SaaS interna do owner Amalfi & Co. (seller Amazon BR, categoria Casa). Clone-evolução do **Gumpinho** (`gerador-de-anucio10de10.netlify.app`) — gera anúncios Amazon completos via IA Gemini. Vai operar **single-user offline-first** (não é SaaS multi-tenant — é ferramenta interna do owner).

**Operação atual**: ~10 SKUs curva A. Volume baixo, exigência alta.

**Posicionamento**: "Bottega" = atelier italiano. Não é "ferramenta produtiva gritante" — é "espaço de criação editorial calmo". Cada anúncio gerado é um *atto* curado.

---

## 📦 Material que você (Aria) já tem disponível

| Artefato | Caminho | O que é |
|---|---|---|
| **Brandbook oficial** | `/Users/coimbrafilmes/Downloads/Amalfi Co. — Manual de Marca.pdf` | 18 páginas. Fonte de verdade absoluta da identidade |
| **Mockup HTML aprovado** | `docs/brand/04-bottega-interface-v1.html` | High-fidelity, 2 telas (Atelier + Novo Anúncio), abre no browser |
| **Tokens CSS** | `docs/brand/tokens/tokens.css` | Custom properties prontas pra :root |
| **Tokens Tailwind** | `docs/brand/tokens/tailwind.config.js` | Config completo Tailwind v3/v4 |
| **Tokens DTCG JSON** | `docs/brand/tokens/tokens.json` | Format W3C, plug-and-play em Style Dictionary |
| **Memória do projeto** | `~/.claude/projects/.../memory/project_brand_direction.md` | Contexto completo da marca |
| **Análise GUMPINHO** | conversa anterior + `/tmp/gumpinho-analysis/bundle.js` | Tech stack, prompts Gemini extraídos, fluxo da plataforma de referência |
| **API key Gemini** | `.env` (linha `GEMINI_API_KEY=AIza...`) | Já configurada — gitignored |

---

## 🧩 Inventário Atômico (Brad Frost / Atomic Design)

Pra você desenhar a arquitetura de componentes, aqui está o que identifiquei no mockup:

### Atoms (12)

| Componente | Tokens consumidos | Notas |
|---|---|---|
| `Eyebrow` | `eyebrow` font, `letter-spacing-eyebrow`, `text-secondary` | CAPS 11px sempre |
| `Display` | `font-display`, `font-size-display-*` | Headlines com DM Serif |
| `Editorial` | `font-editorial` italic | Cormorant para frases-conceito (NUNCA texto longo) |
| `BodyText` | `font-ui` light 300 | Inter Light pra sensação arejada |
| `Button` (variants: primary, ghost, terra, inverse) | tokens cor + button | CAPS 11px tracking 0.18em sempre |
| `Input` | `border-default`, `font-ui` | Sem border-radius |
| `Textarea` | mesmo Input | min-height 110px |
| `Slider` | `mar` (fill), `terracota` (handle) | Custom (Range API ou Radix) |
| `Toggle` (group) | tokens primary | 3 opções: Lifestyle/Infográfico/Misto |
| `Badge` | `terracota` bg + `osso` fg | "Novo", status |
| `Avatar` | `tinta` bg + `osso` fg | Inicial em DM Serif |
| `Dot` (status indicator) | `mar` ou `terracota` | 6×6px circular |

### Molecules (10)

| Componente | Composto de | Notas |
|---|---|---|
| `Stat` | Eyebrow + DisplayValue + Editorial delta | Linha vertical separadora |
| `Lockup` | DisplayWord + EditorialWord | "Bottega by Amalfi & Co." |
| `MonogramaA` | Display "A" + meta "·co.·" | Circular, terracota bg |
| `Field` | Label + Input/Textarea + Hint editorial | Hint em italic |
| `Dropzone` | Title + sub italic + drag handler | Border dashed |
| `KeywordChip` | text + border | Variant "accent" com terracota |
| `TabItem` | num italic + text caps | Active state com underline terracota |
| `CardAnuncio` | Media + body + meta | Hover state suave |
| `BriefingTile` | num display + title editorial + tag | Variants por cor da paleta secundária |
| `TituloListItem` | numeral italic + title display + char count meta | Lista ordenada |

### Organisms (8)

| Componente | Composto de | Notas |
|---|---|---|
| `Brandbar` | Lockup + Nav + Avatar | Sticky, border bottom |
| `HeroEditorial` | Eyebrow + H1 mixed (display+editorial) + lede + actions + meta | Bg Tinta + manchas aquarela |
| `StatsRow` | 3× Stat | Bg Areia |
| `CatalogoSection` | Section header + grid 3× CardAnuncio | Bg Osso |
| `FormCriacao` | 6× Field + Slider + Toggle + Actions | Coluna esquerda (480px) |
| `ResultsTabs` | TabItem nav + TabPanel content | Coluna direita (Tinta dark) |
| `ResultsBlock` | Eyebrow + Headline + Text + content | Reutilizado em todas as tabs |
| `GlobalFooter` | Lockup + Cols + Monograma | Encerramento |

### Templates (2)

- `TemplateAtelier` — dashboard layout (Brandbar + Hero + Stats + Catalogo + Footer)
- `TemplateCriacao` — split form/results layout (Brandbar + grid 480/auto + Footer)

### Pages (futuras)

- `/atelier` — dashboard
- `/novo` — criação de anúncio
- `/anuncio/:id` — visualização/edição
- `/catalogo` — listagem completa
- `/colecoes-keywords` — palavras-chave salvas
- `/configuracoes` — settings + API key

---

## ❓ Perguntas abertas pra Aria responder no spec

### 1. Stack técnica
- **Confirma**: Vite + React 18 + TypeScript + Tailwind v4? Ou prefere algo diferente (Next.js? SvelteKit?)
- Single-page ou multi-page? Sugestão: SPA com React Router (menor complexidade pra single-user offline-first)
- Estado global: Zustand (simples)? Context (nativo)? Jotai (atomic)?

### 2. Integração Gemini
- Cliente: `@google/genai` SDK oficial (mesmo do GUMPINHO)? Ou REST direto?
- **Atenção**: GUMPINHO embeda a chave no front (vimos no bundle). Pra single-user **interno** isso é aceitável (a key tá em `.env` e o app só roda local/Netlify privado). Mas se um dia for compartilhado, precisa proxy backend. Confirme a estratégia.
- Modelos a usar: Gemini 2.5 Flash (texto) + Imagen 4 (imagem)? Confirmar.

### 3. Persistência
- Opções:
  - **(a)** localStorage simples — anúncios + briefings ficam só no navegador. Simples. Risco: perde se trocar de browser.
  - **(b)** Filesystem via OPFS / Origin Private File System — moderno, mais robusto.
  - **(c)** Supabase free tier — sync entre dispositivos. Mas adiciona complexidade.
  - **(d)** Export/import JSON manual — usuário baixa snapshot.
- Recomendação minha: começa em **(a)** + **(d)** pra MVP, considera (c) se owner usar de múltiplos devices.

### 4. Geração de imagem
- Imagen 4 via Gemini API: ok confirma?
- Tamanhos: 1024×1024 default. Owner vai precisar upscale pra 2000×2000 (regra Amazon). Sharp (server) ou client-side com canvas?
- O hero (foto real do produto) **NÃO pode ser IA** (regra Amazon). Suporte upload de foto real pelo usuário, depois processamento (background remove + fundo branco). Sugestão: integrar `@imgly/background-removal` (roda local, free).

### 5. Export de bundle
- GUMPINHO exporta ZIP via JSZip. Replicar?
- Sugestão alternativa: além do ZIP, gerar **PDF + HTML editorial** (igual o `render.sh` que o Marco já usa). Aproveita pipeline existente.

### 6. Roteamento e navegação
- React Router v6+? TanStack Router? Hash router (mais simples pra deploy estático)?

### 7. Forms
- React Hook Form + Zod pra validação? Ou nativo?

### 8. Component library
- Headless UI / Radix UI pra primitives (Slider, Tabs, Dialog, Toggle)? Ou tudo custom?
- **Recomendo Radix** — não vem com estilo, encaixa perfeito nos nossos tokens, accessibility de graça.

### 9. Deploy
- Netlify free (sugestão owner)? Vercel? Cloudflare Pages?
- Build output: `dist/` SPA estática. Qualquer um serve.

### 10. CI/CD
- GitHub Actions pra deploy automático? Ou push manual no Netlify CLI?

### 11. Estrutura de pasta
- `packages/bottega/` (monorepo) ou `apps/bottega/` (Turborepo) ou root direto?
- Considerando que é projeto Amalfi e a Bottega é parte dele, sugiro `packages/bottega/` mantendo o repo monorepo.

### 12. Workflow de geração (5 etapas Gemini)

GUMPINHO sequencia (visto no bundle decompilado):
1. **Análise de mercado** — Gemini 2.5 Flash + Google Search grounding → JSON estruturado
2. **50 keywords SEO** — Gemini + Google Search → keyword groups
3. **10 títulos** (5 produto + 5 dor) — Gemini → JSON ordenado
4. **Descrição + Bullets + FAQ + HTML A+** — Gemini → estrutura rica
5. **7-12 briefings de imagem** com narrativa de conversão (GANCHO → DOR → MECANISMO → PROVA → OBJEÇÕES → DECISÃO) — Gemini → array de briefs
6. **Render imagens** — Imagen 4 — paralelo

Confirma essa sequência ou propõe outra? Tem alguma etapa que você quer paralelizar pra reduzir tempo total?

### 13. Tom da copy gerada
A Bottega gera anúncios pro **Amazon BR** — ou seja, a copy precisa **vender no marketplace** (palavras de busca BR, padrão Amazon, mobile-first). MAS a interface da Bottega segue o tom **editorial sereno Amalfi** (sem CAPS, sem urgência).

A copy gerada PARA O ANÚNCIO deve ser híbrida: **fundamentalmente Amazon BR** (vende), mas com um filtro de honestidade Amalfi (sem "PROMOÇÃO IMPERDÍVEL", sem "premium soft touch"). Quer que eu (Uma) escreva esse system prompt junto com o Marco antes de você fechar o spec?

---

## 🎨 Constraints visuais não-negociáveis (vêm do brandbook)

- ❌ **Zero cantos arredondados** (border-radius: 0 default, exceções raras 2px, e só circle pra A·co.)
- ❌ **Zero gradientes** em UI (apenas em "manchas aquarela" decorativas no hero)
- ❌ **Zero sombras** em logo/typography (só shadow muito sutil em modais se precisar)
- ❌ **Zero cores fora da paleta** (especialmente vermelho saturado, neon, cores quentes agressivas)
- ❌ **Zero CAPS LOCK** em copy editorial (só em eyebrows e botões)
- ✅ **Sempre Display + Editorial juntos** em headlines de impacto (ex: "A vida boa <em>cabe em pequenos gestos</em>")
- ✅ **Mín. 32px de respiro** entre seções
- ✅ **Inter Light 300** em texto corrido (sensação arejada)
- ✅ **Tracking 0.18em** em CAPS (eyebrows, botões)
- ✅ **Combinações 60-25-15** Tinta · Mar · Terracota (não desbalancear)

---

## 📈 Critérios de complexidade (pra você classificar)

Pelos 5 dimensions do AIOX:
- **Scope**: ~25-40 arquivos React + tokens. Médio.
- **Integration**: 2 APIs externas (Gemini text + Imagen). Médio.
- **Infrastructure**: Netlify free + GitHub. Baixo.
- **Knowledge**: React + Tailwind = stack comum. Médio (Gemini é novo pro time).
- **Risk**: app interno single-user, não crítico, não trata dados sensíveis externos. Baixo.

**Estimativa minha**: classe **STANDARD** (score 9-15) — passa pelas 6 fases do Spec Pipeline, não precisa de revision cycle.

**Tempo total estimado** (pode revisar): 8-15h de trabalho do @dev distribuído em 3-5 stories.

---

## ✅ Próximo passo concreto

Owner deve invocar:

```
@architect
```

E em seguida pedir:

```
*assess
```

Você (Aria) avalia complexidade dos requisitos (este doc), gera `complexity.json` e aí sequencia: research (já feito por mim e analyst), spec.md, critique, implementation.yaml.

**Eu (Uma) fico de plantão** caso você precise de mais detalhe visual em qualquer ponto. Marco também tá disponível se precisar do system prompt da copy de anúncio.

---

_Handoff preparado por @ux-design-expert (Uma) em 2026-05-06._
_Próximo agente: @architect (Aria)._
