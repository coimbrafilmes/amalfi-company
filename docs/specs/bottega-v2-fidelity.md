# Spec V2 — Bottega: Image Fidelity + Plain Text + 2 Abas

**Owner:** Sarah (Amalfi & Co.)
**Spec por:** @devops (Gage)
**Implementador:** @dev (Dex)
**Branch sugerido:** `feat/bottega-v2-fidelity` (a partir de `main`)
**Prazo:** sem hard deadline; estimado ~5-6h
**Status:** Ready for Dev

---

## Contexto

V1 (mergeada e em produção em https://bottega-amalfi.netlify.app) gera anúncios completos via Gemini Flash + Imagen 4, mas tem 3 limitações que Sarah identificou ao usar:

1. **Imagens não são fiéis ao produto real** — Imagen 4 é text-to-image only, "imagina" o produto. Sarah precisa **100% fidelidade**.
2. **`descriptionHTML` é inválido pra Amazon** — Amazon depreciou HTML em descriptions desde julho/2021. Hoje só plain text + `<br>`.
3. **Falta diferenciação de imagens por uso** — anúncio principal e A+ Content têm tamanhos diferentes na Amazon. Hoje gera tudo em 1024² genérico.

Esta V2 resolve os 3.

---

## Pedidos consolidados

### Pedido 1 — Image Fidelity (mudança de modelo)

- **Trocar `imagen-4.0-generate-001` por `gemini-2.5-flash-image`** (Nano Banana). Aceita até 3 imagens de referência como input + texto. Saída: imagem nova com fidelidade alta ao produto referenciado.
- **Form aceita até 3 fotos** de referência (não só 1). Cada foto vira referência pra cada chamada de geração.
- **TODAS as imagens são geradas** pelo modelo (incluindo a capa) — Sarah explicitamente NÃO quer "foto crua direto na capa", quer geração com referência.
- **Botão "Regenerar"** em cada tile com contador `1/1` (cada imagem pode ser regenerada uma vez no máximo).

### Pedido 2 — Plain text pra Description Amazon (não A+)

- Amazon **não aceita HTML em description** (deprecated jul/2021). Só plain text + `<br>` opcional pra line breaks.
- Mudança no schema:
  - `descricao.description`: continua plain text (já é) — agora **única fonte da verdade**
  - **`descricao.descriptionHTML`: REMOVER** (não tem mais uso)
- Bullets continuam plain text como já estão (Amazon aceita 5 bullets plain).
- A+ Content fica fora desta entrega — Amazon A+ não é HTML, é builder de módulos no Seller Central. Geramos só **imagens** pra A+.

### Pedido 3 — 2 Abas com tamanhos diferentes

| Aba | Quantidade | Tamanho | Estágio prompt |
|-----|-----------|---------|----------------|
| **Anúncio** | 7-9 imagens (configurável pelo slider, mantém comportamento atual) | **1024×1024** (nativo Gemini) | capa, gancho, dor, mecanismo, prova, objeção, decisão, lifestyle, detalhe |
| **Conteúdo A+** | **6 imagens** (fixo) | **970×600** (4:3 ratio crop após gerar 1024×768) | header, beneficio-1, beneficio-2, comparacao, lifestyle-amplo, detalhe-tecnico |

- Pipeline gera os 2 conjuntos em **paralelo** após briefings.
- ResultsTabs ganha 2 sub-abas dentro da tab "Briefings de Imagem" OU vira tab separada "A+ Content" entre Briefings e fim.

---

## Detalhes técnicos

### Modelo de imagem novo

```ts
import { GoogleGenAI, Modality } from '@google/genai';

const result = await client.models.generateContent({
  model: 'gemini-2.5-flash-image',
  contents: [
    { text: imagePrompt },
    ...refImages.map((base64) => ({
      inlineData: { mimeType: 'image/jpeg', data: base64 }
    }))
  ],
  config: {
    responseModalities: [Modality.IMAGE],
    imageConfig: { aspectRatio: '1:1' }, // ou '4:3' pra A+
  },
});

// Saída: result.candidates[0].content.parts[].inlineData.data (base64)
```

**Aspect ratios disponíveis no Gemini 2.5 Flash Image:** `1:1`, `4:3`, `3:4`, `16:9`, `9:16`. Para 970×600 não tem nativo — gerar `4:3` (1024×768) e cropar pra 970×600 server-side via Sharp.

### Form: Dropzone múltiplo

`src/components/molecules/Dropzone.tsx` evolui pra aceitar até 3 fotos:

```tsx
interface DropzoneProps {
  onFiles: (files: { file: File; base64: string }[]) => void;
  previews?: string[];
  maxFiles?: number; // default: 1, configurável pra 3
  maxSizeMB?: number;
}
```

Mostrar até 3 thumbnails dentro da zona quando preencher. Permitir remover individuais.

`CriacaoForm.fotoBase64` muda pra `fotosBase64?: string[]` (max 3). Schema migration na criação de `Anuncio`.

### Pipeline server-side

`netlify/functions/_lib/pipeline.ts` muda:

1. **Após análise de mercado**, fazer **1 call Gemini Vision** com as fotos:
   ```
   prompt: "Descreva visualmente este produto em detalhes técnicos pra IA gerar imagens fiéis: cor exata, formato, materiais, marcas, dimensões aparentes, ângulos, textura. Seja específico."
   contents: [text, ...fotos]
   ```
   Salva o output como `visualSpec` string.

2. **Briefings de imagem** prompts incorporam `visualSpec`:
   ```
   "...gere imagens FIÉIS ao produto descrito a seguir: ${visualSpec}..."
   ```

3. **Geração de imagens** (anúncio + A+ em paralelo):
   - Cada chamada `gemini-2.5-flash-image` recebe **as 3 fotos** + texto do briefing + visualSpec
   - Aspect ratio: anúncio = `1:1`, A+ = `4:3` + crop server-side via Sharp pra 970×600

4. **Briefings A+** novos: 6 estágios fixos, prompts construídos a partir da análise:
   - `aplus-header`: banner principal com produto destacado
   - `aplus-beneficio-1`: feature 1 destacada
   - `aplus-beneficio-2`: feature 2 destacada
   - `aplus-comparacao`: tabela visual de vantagens (sem comparar com marca de terceiro)
   - `aplus-lifestyle-amplo`: produto em uso real, ambiente brasileiro
   - `aplus-detalhe-tecnico`: zoom em detalhe relevante

### Schema mudanças

**Tipos novos em `src/types/anuncio.ts`:**

```ts
export type EstagioAPlus = 'aplus-header' | 'aplus-beneficio-1' | 'aplus-beneficio-2' | 'aplus-comparacao' | 'aplus-lifestyle-amplo' | 'aplus-detalhe-tecnico';

export interface BriefingAPlus {
  numero: number;
  estagio: EstagioAPlus;
  titulo: string;
  prompt: string;
  overlayText?: string;
  paletaCor?: string;
}

export interface ImagemGerada {
  briefingNumero: number;
  variante: 'anuncio' | 'aplus';   // NOVO — diferencia
  base64: string;
  largura: number;
  altura: number;
  modelUsado?: string;
  falhou?: boolean;
  regeneradaEm?: string;            // NOVO — ISO timestamp se foi regenerada
}

export interface CriacaoForm {
  nomeProduto: string;
  fotosBase64?: string[];           // CHANGED: array, max 3 (era fotoBase64 string)
  detalhesTecnicos: string;
  tituloAtual?: string;
  numeroImagens: number;            // só pra aba anúncio (A+ é fixo 6)
  estiloImagem: EstiloImagem;
}

export interface CriacaoResults {
  analise: AnaliseDeMercado;
  keywords: KeywordsResult;
  titulos: TitulosResult;
  descricao: DescricaoResult;       // descriptionHTML REMOVIDO do schema
  briefings: BriefingImagem[];     // anúncio (7-9)
  briefingsAPlus: BriefingAPlus[]; // NOVO — A+ (6 fixos)
  imagens?: ImagemGerada[];        // todas (anúncio + A+), filtra por variante
  visualSpec?: string;              // NOVO — descrição visual extraída pelas refs
  geradoEm: string;
  modoGeracao: 'mock' | 'real';
}
```

**Schema Zod em `pipeline.ts`:**
- Atualizar `descricaoSchema` removendo `descriptionHTML`
- Novo `briefingsAPlusSchema` (6 itens, estagios fixos)

**Persist migration v3 → v4:**
- Anúncios v3 não têm `briefingsAPlus` nem `imagens.variante` → migration popula com `briefingsAPlus: []` e marca cada imagem antiga como `variante: 'anuncio'`.
- `descriptionHTML` antigo é mantido se existir (read-only legacy) mas novos não geram.

### Regenerate per-image

Nova function: **`netlify/functions/regen-image.ts`** (V2 syntax):

**POST** body:
```json
{
  "form": CriacaoForm,
  "briefing": BriefingImagem | BriefingAPlus,
  "variante": "anuncio" | "aplus",
  "visualSpec": "...",
  "fotosBase64": ["...", "..."]
}
```

**Response 200:**
```json
{
  "base64": "...",
  "largura": 1024,
  "altura": 1024
}
```

Implementação: 1 call `gemini-2.5-flash-image` com refs + prompt do briefing + crop se A+.

**Client side:**
- `BriefingTile` ganha botão "↻ Regenerar" no canto inferior direito (só aparece se ainda não foi regenerada).
- Click → loading no tile → fetch `regen-image` → atualiza imagem no `criacaoStore.results.imagens` E no `anunciosStore.update(id, {...})` pro persist sobreviver.
- `ImagemGerada.regeneradaEm` set quando completa.
- Se `regeneradaEm` truthy, botão desaparece.
- Limite **1× por imagem** — enforcement client + server (server checa se passar `regeneradaEm` no payload, recusa).

### UI — 2 sub-abas em "Briefings de Imagem"

Em `ResultsTabs.tsx`, dentro do `Tabs.Content value="briefings"`:

```
[ Anúncio · 1024×1024 ] [ Conteúdo A+ · 970×600 ]
```

Sub-abas com Radix `Tabs.Root` aninhado. Cada sub-aba renderiza grid próprio:
- Aba Anúncio: 7-9 BriefingTiles
- Aba A+: 6 BriefingTiles (mesmo componente, paleta diferente)

Manter contagem "X de Y renderizadas" por sub-aba.

### Plain text na descrição

`promptDescricao` muda:
- Remove pedido de `descriptionHTML`
- Pede `description`: texto plain pt-BR, **separadores `\n\n` entre parágrafos**, sem qualquer tag HTML, **máx 2000 chars** (limite Amazon)
- Bullets: 5 bullets plain text, sem prefixo numérico/símbolo (Amazon adiciona o "•" automaticamente)

`ResultsTabs.tsx` na aba Descrição:
- Remove o painel "HTML A+" (não existe mais)
- Adiciona painel "Pré-visualização Amazon" mostrando como vai aparecer (parágrafos quebrados)

---

## Acceptance Criteria

- [ ] **AC1:** Form aceita upload de até 3 fotos. Mostra previews. Permite remover individuais.
- [ ] **AC2:** Dropzone valida tamanho (10MB cada) e tipo (PNG/JPG/WEBP/HEIC). Mensagem clara em erro.
- [ ] **AC3:** Pipeline server faz 1 call Gemini Vision pra extrair `visualSpec` antes de gerar imagens.
- [ ] **AC4:** Imagens do anúncio (7-9) são geradas com `gemini-2.5-flash-image` recebendo as 3 fotos + texto + visualSpec.
- [ ] **AC5:** Imagens A+ (6 fixos, estágios `aplus-*`) geradas com mesmo modelo, aspect ratio `4:3`, croped pra 970×600 via Sharp.
- [ ] **AC6:** Pipeline gera anúncio + A+ em **paralelo** após briefings.
- [ ] **AC7:** ResultsTabs mostra 2 sub-abas em Briefings de Imagem com contagens próprias.
- [ ] **AC8:** Cada tile tem botão "Regenerar" funcional, com limite 1× per imagem (server enforce).
- [ ] **AC9:** Description gerada é **plain text válido pra Amazon**, sem `<` ou `>` (validação Zod).
- [ ] **AC10:** `descriptionHTML` removido do schema novo. Backward-compat: anúncios antigos persistidos não crasham UI.
- [ ] **AC11:** Schema migration v3→v4 popula `briefingsAPlus: []` e `imagens[].variante: 'anuncio'` em registros antigos.
- [ ] **AC12:** Build limpo (`npm run build`), lint zero erros.
- [ ] **AC13:** 1 anúncio completo gerado E2E em produção em < 4min (13 imagens vs 7 atuais).
- [ ] **AC14:** Custo aproximado por geração: ~$0.50 (validado via primeiro teste real).

## Não-objetivos

- A+ Content em si (texto/módulos, structure JSON pra A+ Manager) — só geramos imagens.
- Upload da foto como capa direta (Sarah explicitamente pediu pra **gerar** a capa também).
- Upscale pra 2000×2000 (Sarah aceitou 1024×1024 nesta versão).
- Retry budget de regenerar (1× é fixo — depois disso a Sarah pode tentar de novo gerando do zero).
- PDF export.

## Riscos / pontos de atenção

1. **Latência:** Gemini Flash Image é mais rápido (5-10s/img) mas com 13 imagens em paralelo, pode bater rate limit. Implementar pequena janela (Promise.allSettled em chunks de 5) se necessário.
2. **Sharp em Netlify Functions:** Sharp tem binários nativos. Garantir que está no `external_node_modules` do `netlify.toml` ou usar `sharp` via Layer. Alternativa: pré-instalar via build hook.
3. **Tamanho do payload:** 3 fotos base64 no body do `job-create` pode ficar grande (~3MB). Pode bater limite de body do Netlify Function (default 1MB? checar). Se sim: upload pro Blobs primeiro, passa só keys.
4. **Cost increase:** ~$0.50/anúncio vs $0.40. Quase imperceptível pra Sarah (10 SKUs/mês = $5/mês). Mas se for usar pra teste 50× = $25.

## Files List esperado

**Novos:**
- `packages/bottega/netlify/functions/regen-image.ts`
- `packages/bottega/netlify/functions/_lib/cropImage.ts` (helper Sharp)
- `packages/bottega/src/components/molecules/DropzoneMulti.tsx` (ou refactor do existente)

**Modificados:**
- `packages/bottega/package.json` (+ `sharp`)
- `packages/bottega/netlify.toml` (sharp em external_node_modules)
- `packages/bottega/netlify/functions/_lib/pipeline.ts` (Vision call + Gemini Image + 2 conjuntos paralelos)
- `packages/bottega/netlify/functions/_lib/jobs.ts` (job pode ter resultado parcial em regenerate? talvez não, regen é atomic)
- `packages/bottega/src/lib/gemini/prompts.ts` (descricao sem HTML, novos prompts A+)
- `packages/bottega/src/lib/gemini/schemas.ts` (sem descriptionHTML, novo briefingsAPlusSchema)
- `packages/bottega/src/types/anuncio.ts` (CriacaoForm.fotosBase64 array, ImagemGerada.variante, etc)
- `packages/bottega/src/store/anunciosStore.ts` (migration v3→v4, partialize já existe)
- `packages/bottega/src/store/criacaoStore.ts` (regenerate function que chama regen-image)
- `packages/bottega/src/components/organisms/FormCriacao.tsx` (Dropzone múltiplo)
- `packages/bottega/src/components/organisms/ResultsTabs.tsx` (2 sub-abas em briefings, remove HTML A+ panel da descrição)
- `packages/bottega/src/components/molecules/BriefingTile.tsx` (botão regenerar + estado loading)
- `packages/bottega/src/lib/mocks/index.ts` (mocks atualizados)

## Notas pro Dex

- Mantenha `withRetry` (5 tentativas + backoff 2/5/10/20s) — funciona bem.
- O `extractJson` robusto (commit `7d88147`) continua válido pra responses de Gemini Flash text.
- Search grounding está OFF (commit `5f127ec`) — não reativar, dá problema.
- Functions estão em V2 syntax (commit `a743228`) — manter pra todas novas Functions.
- Bundler default `zisi`, não esbuild — não trocar.
- Backward-compat com persistidos é importante — anúncios v3 já existem em browsers de Sarah.

— Gage 🚀
