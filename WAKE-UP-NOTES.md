# Bottega · LIVE em produção

**Status:** ✅ **DEPLOYED e validado end-to-end em produção**
**URL:** **https://bottega-amalfi.netlify.app**
**Última atualização:** 2026-05-06 noite

---

## ✅ O que está funcionando agora

| Feature | Status | Observação |
|---------|--------|------------|
| Atelier (`/atelier`) | ✅ | Hero, stats reais, catálogo |
| Criação (`/novo`) | ✅ | Form completo + spinner com progresso por etapa |
| Catálogo (`/catalogo`) | ✅ | Lista anúncios persistidos |
| Configurações (`/configuracoes`) | ✅ | Smoke test do Gemini funciona |
| **Geração real Gemini** | ✅ | **Texto + imagens** end-to-end |
| Background Jobs (Netlify Functions) | ✅ | 15min runtime, polling com progresso |
| Blobs storage | ✅ | Status do job persiste |
| Imagen 4 | ✅ | 7/7 imagens geradas no último teste |
| API key segura | ✅ | Server-side, fora do bundle JS |

**Tempo de geração de 1 anúncio completo:** ~45 segundos (texto + 7 imagens).

---

## Arquitetura final

```
Browser
  ├── React 19 + Vite + Tailwind 3 (sem secrets, sem SDK)
  └── fetch /.netlify/functions/...
        │
        ▼
Netlify Functions (V2 syntax, Node 20)
  ├── job-create.ts        → cria job, dispara background, retorna jobId
  ├── job-status.ts        → polling endpoint, lê blob
  ├── gemini-anuncio-bg.ts → 15min runtime, executa pipeline
  └── smoke-test.ts        → health check
        │
        ├── @netlify/blobs → status do job (pending → running → done)
        └── @google/genai  → Gemini 2.5 Flash + Imagen 4 (key em env var)
```

---

## Configurações Netlify (já feitas)

- **Site:** `bottega-amalfi`
- **Repo:** `coimbrafilmes/amalfi-company` (público)
- **Branch produção:** `main`
- **Build:** `npm run build` em `packages/bottega/`
- **Env vars:** `GEMINI_API_KEY` (secret), `GEMINI_TEXT_MODEL=gemini-2.5-flash-lite`, `GEMINI_IMAGE_MODEL=imagen-4.0-generate-001`, `VITE_USE_MOCK=false`
- **Billing Gemini:** **Paid tier** ativo no projeto `gen-lang-client-0272318455`

---

## Decisões importantes feitas no caminho

| Decisão | Por quê |
|---------|---------|
| Background Functions em vez de sync | Free plan tem 10s timeout — Imagen leva 10-30s/imagem |
| Functions V2 (não V1) | V1 não recebe Blobs runtime context corretamente |
| Bundler `zisi` (default), não `esbuild` | Esbuild quebrava hooks de runtime do Netlify |
| `gemini-2.5-flash-lite` em vez de flash | Menos sobrecarga em horários de pico |
| Sem Google Search grounding | Search retornava texto conversacional + JSON malformado |
| Repo público | Free plan bloqueava builds em repo privado por contributor não-verificado |
| Billing Gemini ativado | Free tier do Gemini é só 20 req/dia, não cabe uso real |

---

## Custo real esperado

Com plan paid Gemini ativo:
- **Texto** (5 calls Flash + Flash-Lite por anúncio): ~$0.001-0.005 por anúncio (essencialmente $0)
- **Imagens** (7-12 imagens via Imagen 4): **~$0.30-0.40 por anúncio** (cobrado sempre)
- **Netlify**: Free plan suficiente pra ~125 GB de bandwidth/mês

**Estimativa Amalfi (escala atual ~10 SKUs):**
- 1-3 anúncios novos/mês: **~$1-2/mês**
- Re-gerações + ajustes: ~$5-10/mês

Em 100 anúncios/mês ficaria ~$40/mês — bem dentro do que faz sentido pra um negócio Amazon.

---

## Como usar daqui pra frente

### Gerar um anúncio
1. Vai em **https://bottega-amalfi.netlify.app/novo**
2. Preenche nome do produto (mín 3 chars), detalhes técnicos (mín 20 chars)
3. Clica "Criar anúncio"
4. Aguarda ~45-90s — spinner mostra cada etapa em tempo real
5. Quando concluir, 5 tabs com tudo prontinho. Anúncio salvo no `localStorage` do browser → aparece em `/atelier`.

### Iterar no código
1. Cria branch novo a partir de `main`: `git checkout -b feat/nova-feature`
2. Mexe, comita, push
3. Netlify gera um **deploy preview** automático com URL própria pra testar
4. Quando satisfeita, abre PR pro `main` e mergea
5. `main` faz auto-deploy pra produção

### Ajustar configurações
- **Trocar modelo Gemini:** Netlify dashboard → Site settings → Environment variables → editar `GEMINI_TEXT_MODEL` ou `GEMINI_IMAGE_MODEL`. Trigger manual redeploy.
- **Trocar API key:** mesma tela, editar `GEMINI_API_KEY`. NÃO commitar no código.
- **Voltar pra mock:** trocar `VITE_USE_MOCK=true` na mesma tela. Redeploy.

---

## Backlog (futuras features, não bloqueante)

- **Foto crua do produto como referência visual no Imagen** (hoje a foto serve só pra preview no form, não influencia geração de imagens)
- **Cost tracking** na UI (mostrar custo estimado por geração)
- **Regenerar painel individual** (só keywords, só títulos, etc)
- **Export PDF** do anúncio finalizado
- **ASIN tracking** integrado com Seller Central API
- **Vitest suite** (5-10 testes core)
- **Background scheduled function** pra limpeza de blobs antigos (TTL manual)

---

## Time que entregou

| Agente | Entregou |
|--------|----------|
| **Uma** (UX) | Brand identity Amalfi & Co. + design system + mockup aprovado |
| **Aria** (Architect) | Spec técnica original + spec Background Jobs |
| **Orion** (Master) | Overnight build inicial completa |
| **Marco** (Amazon BR) | Workflow de anúncio Amazon BR (paralelo, fora da web app) |
| **Dex** (Dev) | Audit fixes + arquitetura Background Jobs + retry budget + JSON sanitizer |
| **Gage** (DevOps) | Netlify setup + push + 12 deploys + validação E2E em produção |

---

🎉 **Bottega tá vivo. Bora gerar anúncios.**
