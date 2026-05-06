# Wake-Up Notes — Bottega ready for Netlify

**Para:** Sarah (Amalfi & Co.) + `@devops` (Gage) pra deploy
**Última atualização:** 2026-05-06 manhã
**Trabalho feito por:** `@dev` (Dex), revisando e refatorando a overnight build do Orion

---

## TL;DR

✅ **Auditoria completa feita** — 5 CRITICAL + 7 HIGH + 8 MEDIUM identificados e corrigidos.
✅ **Arquitetura Netlify-ready** — Gemini saiu do client, virou server-side via Netlify Functions. Key 100% segura, `grep` no bundle confirma 0 ocorrências.
✅ **Build passa limpo** — `tsc -b && vite build` em ~570ms, lint 0 erros.
✅ **3 Functions prontas** — `gemini-text`, `gemini-image`, `smoke-test`.
✅ **netlify.toml** com SPA redirect + headers de segurança + esbuild de Functions.
🟡 **Geração real ainda não validada ao vivo** — bloqueado pelo sandbox; `@devops` valida pós-deploy.
🟡 **Deploy em si** — minha boundary para. `@devops` (Gage) é quem conecta repo + configura env + dispara.

---

## O que mudou desde o WAKE-UP-NOTES anterior

### Arquitetura de segurança
**Antes:** `VITE_GEMINI_API_KEY` no `.env` ia pro bundle JS público. Qualquer um abrindo DevTools no Netlify deployado veria a key.
**Depois:** A key fica em `process.env.GEMINI_API_KEY` (sem `VITE_`), lida só pelas Netlify Functions server-side. Client chama `/.netlify/functions/gemini-text` etc via fetch.

```
Browser ─fetch─▶ Netlify Function ─SDK─▶ Gemini
   ↑                  ↑
sem key          key vive aqui
```

### Bug fixes aplicados (todos do audit do Explore agent)

| Severidade | Antes | Depois |
|-----------|-------|--------|
| CRITICAL | Key no bundle | Server-side proxy |
| CRITICAL | Dropzone aceita 50 MB sem aviso | Validação tipo + 10 MB max |
| CRITICAL | Click duplo no "Criar" duplicava jobs | Guard de race no store |
| CRITICAL | `JSON.parse` sem catch crashava tudo | try-catch com `cause` + preview |
| CRITICAL | Zod `.min(1)` sem `.max()` aceitava 1000 itens | bounds explícitos em todos schemas |
| HIGH | Form validava só `nomeProduto` | Valida nome (3+) e detalhes técnicos (20+) |
| HIGH | Sem timeout — geração travava infinito | AbortController 90s/120s |
| HIGH | Imagem falhada renderizava em branco | Badge "falhou" + contador "X de Y renderizadas" |
| HIGH | Persist sem migration | `version: 2` + `migrate(state, v)` |
| HIGH | `vite.config.ts` vazio | outDir, target, sourcemap configurados |
| HIGH | Rotas `/novo` quebravam em produção | `_redirects` SPA + `netlify.toml` redirect |
| MEDIUM | `eslint-disable-next-line` em `useEffect` | `useRef` pra dedup save no store |
| MEDIUM | Variável morta `isLight` no CardAnuncio | Removida |
| MEDIUM | ConfiguracoesPage usava `client.ts` (deletado) | Usa Function smoke-test |

---

## Arquivos novos/mudados (resumo)

**Novos:**
- `packages/bottega/netlify/functions/gemini-text.ts`
- `packages/bottega/netlify/functions/gemini-image.ts`
- `packages/bottega/netlify/functions/smoke-test.ts`
- `packages/bottega/netlify.toml`
- `packages/bottega/public/_redirects`

**Removidos:**
- `packages/bottega/src/lib/gemini/client.ts` (substituído por Functions)

**Mudados (refactor profundo):**
- `src/lib/gemini/orchestrator.ts` — fetch Functions em vez de SDK direto
- `src/lib/gemini/schemas.ts` — bounds `.max()` em tudo
- `src/lib/utils/env.ts` — sem mais `GEMINI_API_KEY`
- `src/store/criacaoStore.ts` — race guard, factory de form
- `src/store/anunciosStore.ts` — version 2, migrate callback
- `src/components/molecules/Dropzone.tsx` — validação tipo + tamanho
- `src/components/molecules/BriefingTile.tsx` — flag `failed` + badge
- `src/components/molecules/CardAnuncio.tsx` — dead code removido
- `src/components/organisms/FormCriacao.tsx` — validação dupla
- `src/components/organisms/ResultsTabs.tsx` — contador OK/falhou
- `src/pages/CriacaoPage.tsx` — `useRef` dedup
- `src/pages/ConfiguracoesPage.tsx` — usa Function
- `src/types/anuncio.ts` — `ImagemGerada.falhou?`
- `vite.config.ts` — config production
- `eslint.config.js` — `^_` ignore pattern
- `package.json` — adiciona `@netlify/functions ^5.2.0`
- `.env` + `.env.example` — sem prefix VITE_ na key

---

## Como Sarah valida agora

### Opção A — modo mock (zero $, sem internet pra Gemini)
```bash
cd packages/bottega
npm install
npm run dev
# http://localhost:5173 — todas as 4 páginas funcionais com dados pré-cozidos
```

### Opção B — modo real local (precisa Netlify CLI)
```bash
npm install -g netlify-cli
cd packages/bottega
# Edita .env: VITE_USE_MOCK=false
netlify dev
# http://localhost:8888 — Vite + Functions juntos com a key real
```

### Opção C — smoke test direto (sem UI, validar key)
```bash
cd packages/bottega
node scripts/smoke-test.mjs
# saída esperada: ✓ OK — latência <ms> · resposta: "ok"
```

---

## Handoff pro `@devops` (Gage) — passos pra produção

### 1. Conectar Netlify ao repo
- Site → New from Git → escolhe o repositório
- **Base directory:** `packages/bottega`
- **Build command:** `npm run build`
- **Publish directory:** `dist` (relativo ao base)

### 2. Configurar env vars (Site settings → Environment variables)
| Variável | Valor | Obrigatória |
|----------|-------|-------------|
| `GEMINI_API_KEY` | (a key — `AIza…CiX4`) | sim |
| `GEMINI_TEXT_MODEL` | `gemini-2.5-flash` | não (default) |
| `GEMINI_IMAGE_MODEL` | `imagen-4.0-generate-001` | não (default) |

⚠️ **NÃO usar prefixo `VITE_`** nessas. Elas têm que ficar só no servidor.

### 3. Confirmar `netlify.toml` é lido
- Build → Build configuration → deve mostrar "Build settings from netlify.toml"

### 4. Disparar deploy + validar
1. Trigger deploy
2. Build deve passar em ~3min (com `npm install` + `tsc` + `vite build` + bundle Functions)
3. Acessar URL pública → `/configuracoes` → "Verificar agora" → tem que sair "✓ OK"
4. Voltar pra `/atelier`, ir em `/novo`, preencher e gerar 1 anúncio real
5. Conferir as imagens em `Briefings`. Se algum tile aparecer com badge "falhou", checa log da Function `gemini-image` no painel

### 5. Limites Netlify a observar
- Functions têm timeout de 10s no plano free, 26s no Pro. **Imagen 4 pode demorar 15-25s por imagem.** Verificar se o plano da Sarah suporta. Se for free, pode precisar paralelizar/streamar de outro jeito ou rodar imagens via background functions (15min timeout).
- **Bandwidth:** cada anúncio com 9 imagens em base64 ≈ 1-3 MB de payload total. Free tier comporta dezenas/centenas de gerações/dia.

---

## Riscos / pontos de atenção

1. **Imagen 4 timeout em Functions free.** Se o plano Netlify for free (10s timeout), imagens VÃO falhar. Solução: upgrade pra Pro OU mover Imagen pra background function. `@devops` valida e me avisa se precisa.
2. **Custo Imagen.** ~$0.04/imagem × 9 = $0.36 por anúncio. 100 anúncios/mês = $36. Verificar com Sarah se cabe no orçamento.
3. **Foto crua não vira referência visual nas imagens geradas.** Hoje a foto que Sarah upa fica só no form/preview/cartão. As imagens são geradas do zero pelo Imagen via prompt. Se ela quiser que a tomada gerada SEJA a tomada dela, precisa Gemini Vision lendo a foto + injetando descrição visual no prompt do briefing. Backlog futuro.
4. **Sem testes unitários ainda.** O build limpo não é garantia de comportamento correto em runtime. Recomendação: depois do deploy, fazer 5-10 gerações reais e revisar manualmente cada saída.

---

## O que ficou no backlog (próxima sprint)

- **Foto-aware Imagen** (Vision lê foto → enriquece prompt do briefing)
- **Cost tracker** na UI (logs por geração)
- **Vitest** suite (5-10 testes core: orchestrator, schemas, store)
- **Export PDF** funcional (hoje só tem botão decorativo)
- **Regenerar painel individual** (só keywords, só títulos, etc.)
- **ASIN tracking** integrado com Seller Central

---

## Status final

| Camada | Status |
|--------|--------|
| Code review | ✅ feito |
| Bugs CRITICAL | ✅ todos corrigidos |
| Bugs HIGH | ✅ todos corrigidos |
| Bugs MEDIUM | ✅ todos corrigidos |
| Arquitetura segura | ✅ key server-side |
| Build production | ✅ limpo |
| Lint | ✅ 0 erros |
| Functions compilam | ✅ esbuild OK |
| Dev server boota | ✅ HTTP 200 |
| netlify.toml | ✅ pronto |
| `_redirects` | ✅ pronto |
| Smoke test ao vivo | 🟡 pra `@devops` validar pós-deploy |
| Geração real end-to-end | 🟡 pra `@devops` validar pós-deploy |
| Deploy Netlify | 🟡 entrega ao `@devops` |
| `git push` | 🚫 minha boundary — `@devops` |

---

— Dex, sempre construindo 🔨
