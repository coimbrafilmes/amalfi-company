# Bottega by Amalfi & Co. — Spec Técnico

> **Author**: @aiox-master (Orion) atuando em modo orquestrador.
> **Data**: 2026-05-06
> **Status**: aprovado pra build (autônomo overnight).
> **Classe**: STANDARD (escopo médio, integration média, infrastructure baixa).

---

## 1. Visão Geral

Bottega é a plataforma SaaS interna single-user da Amalfi & Co. — clone-evolução do Gumpinho. Gera anúncios Amazon BR completos via Gemini + Imagen.

**Não** é multi-tenant. **Não** tem auth. **Não** tem billing. É ferramenta de operação do owner (Sarah Mendes) pro catálogo Casa.

## 2. Stack Definitiva

| Camada | Tech | Versão | Por quê |
|---|---|---|---|
| Build tool | Vite | 5.x | Mais rápido, melhor DX |
| Framework | React | 18.3.x | Default da maioria; suporta hooks modernos |
| Linguagem | TypeScript | 5.4+ | Strict mode, type safety |
| Styling | Tailwind CSS | 3.4.x | v4 ainda tem rough edges em alguns plugins; v3 estável + tokens prontos |
| State | Zustand | 4.5.x | API simples, persistência built-in via middleware |
| Routing | React Router | 6.x | Padrão da comunidade |
| Forms | React Hook Form + Zod | latest | Validação tipada |
| AI Client | @google/genai | 1.x | SDK oficial Google |
| UI primitives | Radix UI (parcial) | latest | Slider, Tabs, Dialog (acessibilidade grátis) |
| Background removal | @imgly/background-removal | latest | Roda local, free, pra processar foto hero |
| Persistência | localStorage + JSON export | nativo | Single-user offline-first |

## 3. Estrutura de Pasta

```
packages/bottega/
├── public/
│   └── favicon.svg                    # Monograma A·co. (ainda criar SVG)
├── src/
│   ├── main.tsx                       # Entry
│   ├── App.tsx                        # Router shell
│   ├── styles/
│   │   ├── tokens.css                 # ← copiado de docs/brand/tokens/tokens.css
│   │   └── globals.css                # Reset + base
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Eyebrow.tsx
│   │   │   ├── Display.tsx
│   │   │   ├── Editorial.tsx
│   │   │   ├── BodyText.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── ToggleGroup.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   └── Dot.tsx
│   │   ├── molecules/
│   │   │   ├── Stat.tsx
│   │   │   ├── Lockup.tsx
│   │   │   ├── MonogramaA.tsx
│   │   │   ├── Field.tsx
│   │   │   ├── Dropzone.tsx
│   │   │   ├── KeywordChip.tsx
│   │   │   ├── TabItem.tsx
│   │   │   ├── CardAnuncio.tsx
│   │   │   ├── BriefingTile.tsx
│   │   │   └── TituloListItem.tsx
│   │   └── organisms/
│   │       ├── Brandbar.tsx
│   │       ├── HeroEditorial.tsx
│   │       ├── StatsRow.tsx
│   │       ├── CatalogoSection.tsx
│   │       ├── FormCriacao.tsx
│   │       ├── ResultsTabs.tsx
│   │       ├── ResultsBlock.tsx
│   │       └── GlobalFooter.tsx
│   ├── pages/
│   │   ├── AtelierPage.tsx
│   │   └── CriacaoPage.tsx
│   ├── store/
│   │   ├── anunciosStore.ts           # Zustand: lista de anúncios + persistência
│   │   └── criacaoStore.ts            # Zustand: form em edição + resultados gerados
│   ├── lib/
│   │   ├── gemini/
│   │   │   ├── client.ts              # GoogleGenAI initializer
│   │   │   ├── analise.ts             # gerarAnaliseDeMercado()
│   │   │   ├── keywords.ts            # gerarKeywords()
│   │   │   ├── titulos.ts             # gerarTitulos()
│   │   │   ├── descricao.ts           # gerarDescricaoCompleta()
│   │   │   ├── briefings.ts           # gerarBriefings()
│   │   │   ├── imagens.ts             # gerarImagens() (Imagen)
│   │   │   ├── orchestrator.ts        # gerarTudo() encadeia as 5 etapas
│   │   │   ├── schemas.ts             # Zod schemas pra validar respostas
│   │   │   └── prompts.ts             # Prompt templates
│   │   ├── mocks/
│   │   │   ├── mockAnalise.ts
│   │   │   ├── mockKeywords.ts
│   │   │   ├── mockTitulos.ts
│   │   │   ├── mockDescricao.ts
│   │   │   ├── mockBriefings.ts
│   │   │   └── index.ts               # gerarMockTudo() — espelha a interface
│   │   └── utils/
│   │       ├── env.ts                 # USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
│   │       └── slug.ts
│   └── types/
│       └── anuncio.ts
├── .env.example                        # Template
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js                 # ← copiado de docs/brand/tokens/
├── postcss.config.js
├── README.md
├── ARCHITECTURE.md
└── CHANGELOG.md
```

## 4. State Architecture

### `anunciosStore.ts` (Zustand + persist middleware)
```typescript
interface AnunciosStore {
  anuncios: Anuncio[];
  current: string | null;
  add(a: Anuncio): void;
  update(id: string, patch: Partial<Anuncio>): void;
  remove(id: string): void;
  setCurrent(id: string | null): void;
}
// Persiste em localStorage chave 'bottega.anuncios'
```

### `criacaoStore.ts` (Zustand, transient)
```typescript
interface CriacaoStore {
  form: CriacaoForm;
  results: CriacaoResults | null;
  status: 'idle' | 'gerando' | 'concluido' | 'erro';
  setField<K>(k: K, v: CriacaoForm[K]): void;
  generate(): Promise<void>;   // chama lib/gemini/orchestrator OR lib/mocks
  reset(): void;
}
```

## 5. Toggle Mock vs Real

```typescript
// src/lib/utils/env.ts
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
// default = true (segurança)
// flip pra false → chamadas reais
```

```typescript
// src/lib/gemini/orchestrator.ts
export async function gerarTudo(input: CriacaoForm) {
  if (USE_MOCK) return await import('../mocks').then(m => m.gerarMockTudo(input));
  // chamadas reais Gemini sequenciais
  const analise = await gerarAnaliseDeMercado(input);
  const keywords = await gerarKeywords(input, analise);
  const titulos = await gerarTitulos(input, keywords);
  const descricao = await gerarDescricaoCompleta(input, analise);
  const briefings = await gerarBriefings(input, analise);
  const imagens = await gerarImagens(briefings);  // Imagen
  return { analise, keywords, titulos, descricao, briefings, imagens };
}
```

## 6. Prompts (sintetizados do bundle GUMPINHO + tom Amalfi)

Cada função em `lib/gemini/*.ts` tem seu prompt em `prompts.ts`. Princípios:
- pt-BR
- "Tom de copy de venda" pro conteúdo do anúncio Amazon (vende, segue regras Amazon BR)
- Brand filter: nunca "PROMOÇÃO IMPERDÍVEL", "premium soft touch", "best seller"
- JSON estruturado em todas as respostas (com `responseSchema` Gemini)
- Google Search grounding nas etapas de análise + keywords

## 7. Persistência de Imagens

Imagens geradas via Imagen vêm como base64. Strategy:
- Mock: usa data-URI placeholders (gradients da paleta)
- Real: salva base64 no localStorage por enquanto (MVP). Em fase futura: IndexedDB ou OPFS.

## 8. Acessibilidade

WCAG AA mínimo. Já garantido no brandbook:
- Tinta sobre Osso = 13.2 (AAA)
- Mar sobre Osso = 7.1 (AAA)
- Terracota sobre Osso = 3.9 (AA Large)

Botões e tabs com ARIA labels apropriados. Foco visível em Tinta.

## 9. Build & Run

```bash
cd packages/bottega
npm install
npm run dev          # localhost:5173
npm run build        # dist/
npm run preview      # serve dist/
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

## 10. Boundaries (overnight build)

- ❌ Sem `git push`
- ❌ Sem deploy Netlify/Vercel
- ❌ Sem chamada Imagen ($)
- ❌ Sem chamada Gemini real além de 1 smoke test (Flash, free tier)
- ✅ Mocks completos pra navegação visual end-to-end
- ✅ Integração Gemini/Imagen escrita 100%, gated pelo `VITE_USE_MOCK`
- ✅ Commits locais convencionais

## 11. Open issues pra fase 2 (pós wake-up)

- Brand Story / A+ Content (requer Brand Registry — owner não tem hoje)
- Multi-device sync (Supabase opcional)
- Auto-publicação no Seller Central (Amazon SP-API — fora do scope inicial)
- Login multi-user (não necessário no MVP single-user)

---

_Spec aprovado por @aiox-master. Próximo passo: bootstrap do projeto (Fase 2)._
