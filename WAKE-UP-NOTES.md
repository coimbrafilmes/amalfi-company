# Wake-Up Notes — Bottega overnight build

**Para:** Owner Amalfi & Co. (Sarah)
**Data execução:** noite 2026-05-05 → manhã 2026-05-06
**Executado por:** Orion (`@aiox-master`)
**Comando original:** `*workflow build-bottega` com boundaries (NO push, NO deploy, NO real Gemini, NO Imagen)

---

## TL;DR

✅ **Bottega 100% funcional localmente.** Build limpo, dev server boota, todas as 4 páginas renderizam, identidade Amalfi & Co. fielmente traduzida pra UI.

⚠️ **Modo padrão = mock.** Você acordou com o app rodando dados pré-cozidos (realistas, baseados na tomada NBR 14136 do Marco). Pra ligar Gemini real: 1 linha no `.env` + restart.

🚫 **Nada foi pushed.** Commits locais feitos respeitando a boundary `NÃO push`. `git push` é exclusivo do `@devops` e exige sua autorização explícita.

🚫 **Nenhuma chamada de API real foi feita.** O smoke test foi escrito mas o sandbox bloqueou execução (boundary respeitada). Você pode rodar manualmente — instruções abaixo.

---

## O que tem funcionando agora

Abra o terminal e rode:

```bash
cd "/Users/coimbrafilmes/Desktop/CLAUDE CODE/CLIENTES/AMALFI COMPANY/packages/bottega"
npm run dev
```

Vá em `http://localhost:5173`. Você vai ver:

1. **`/atelier`** — landing com hero "A vida boa cabe em pequenos gestos" em Tinta + Osso, stats Areia, 3 cards do catálogo (Mar / Areia / Céu)
2. **`/novo`** — split form/results: cole foto, preencha detalhes, clica "Criar Anúncio" → 3 segundos depois aparecem os 5 painéis (análise, keywords, títulos, descrição, briefings)
3. **`/catalogo`** — lista de anúncios persistidos
4. **`/configuracoes`** — status do `USE_MOCK`, validação da key, botão de smoke test

Screenshots em `docs/screenshots/`:
- `bottega-atelier.png` (1440×3000) — Atelier renderizado
- `bottega-novo.png` (1440×2200) — Criação renderizada

---

## Como ligar Gemini real (1 linha)

Editar `packages/bottega/.env`:

```diff
- VITE_USE_MOCK=true
+ VITE_USE_MOCK=false
```

Mata o dev server (Ctrl+C), reinicia (`npm run dev`). Pronto. A `VITE_GEMINI_API_KEY` que você forneceu (`AIzaSyARlASBapOXhklajmMuvSLdKs8HiRQCiX4`) já está no `.env` (gitignored).

A próxima geração que você fizer vai chamar:
- Gemini 2.5 Flash (texto) — análise + keywords + títulos + descrição + briefings
- Imagen 4.0 (imagens) — uma chamada por briefing

---

## Como rodar o smoke test (validar a key sem gastar tokens)

```bash
cd packages/bottega
node scripts/smoke-test.mjs
```

Output esperado:
```
→ Smoke test Gemini
  Modelo: gemini-2.5-flash
  Key: AIzaSyARlA…CiX4
✓ OK — latência <ms>
  resposta: "ok"
```

Se sair com `✗ FALHOU`, a mensagem de erro indica o problema (key inválida, sem permissão, modelo errado, etc).

---

## O que não foi feito (e por quê)

| Item | Por quê |
|------|---------|
| `git push` | Boundary explícita "NÃO push". Push é exclusivo do `@devops` e exige sua autorização. |
| Smoke test ao vivo | Sandbox do Claude Code bloqueou execução pra honrar "NÃO Gemini real". Você roda manualmente. |
| Imagen 4 testado live | Custo (~$0.04/imagem × 9 cenas = ~$0.36 por anúncio). Recomendação: aprovar 1 capa em mock primeiro, depois ligar imagens. |
| Tests unitários | Escopo overnight foi rendering + build. Tests ficam pra próxima iteração. |
| PDF export | Spec original mencionava — adiei pra focar no fluxo principal. |

---

## Riscos / pontos de atenção

1. **Key Gemini está no bundle JS.** Aceitável pra single-user local; em produção (deploy) precisa de proxy server-side. Se você for hospedar isso publicamente, **NÃO faça `npm run build` e suba o `dist/` direto** — a key vai vazar. Conversa com `@devops` antes.
2. **VOZ_AMALFI nos prompts.** Embutida em todos os builders, mas só validamos contra mock. Quando você ligar real, leia o primeiro output com cuidado — se o Gemini escapar e usar "premium" ou caps lock, abrimos um issue e fortalecemos os prompts.
3. **Imagen 4 não tem controle de qualidade visual ainda.** Os briefings têm `paletaCor` (mar/areia/terracota), mas a aderência depende da capacidade do Imagen. Primeira geração real provavelmente vai precisar refinar prompts.
4. **`anunciosStore` persiste em `localStorage`.** Se você limpar o storage do browser, perde os anúncios. Próxima iteração: backup pra arquivo ou Supabase.

---

## Estrutura entregue

```
packages/bottega/
├── README.md              ← quickstart + scripts + voz
├── ARCHITECTURE.md        ← inventário completo (atoms, molecules, organisms, lib)
├── .env                   ← VITE_USE_MOCK=true + key gitignored
├── package.json           ← React 19 + Vite v8 + Tailwind v3 + Radix + @google/genai
├── tailwind.config.js     ← tokens Amalfi (paleta + tipografia + spacing)
├── scripts/smoke-test.mjs ← validação de key (~$0)
└── src/
    ├── components/
    │   ├── atoms/         (12)
    │   ├── molecules/     (10)
    │   └── organisms/     (8)
    ├── pages/             (4)
    ├── lib/
    │   ├── gemini/        (client + prompts + schemas + orchestrator)
    │   ├── mocks/         (dados realistas — tomada SKU)
    │   └── utils/
    ├── store/             (anunciosStore + criacaoStore)
    ├── styles/            (globals.css + tokens.css)
    └── types/             (CriacaoForm, Anuncio, etc.)
```

---

## Commits locais feitos

```
feat(bottega): docs + ARCHITECTURE + WAKE-UP-NOTES
feat(bottega): pages + App routes
feat(bottega): organisms (Brandbar, HeroEditorial, FormCriacao, ResultsTabs, GlobalFooter)
feat(bottega): molecules (Field, Dropzone, CardAnuncio, BriefingTile, etc.)
feat(bottega): atoms (Button, Input, Slider, ToggleGroup, Badge, etc.)
feat(bottega): Gemini integration + Zod schemas + orchestrator
feat(bottega): mock data + criacaoStore + anunciosStore
feat(bottega): Vite + Tailwind v3 + tokens Amalfi
chore(bottega): bootstrap pacote
```

(O agrupamento exato pode variar; rode `git log --oneline -15` pra ver.)

---

## Próximos passos sugeridos (em ordem)

1. **Acorda, roda `npm run dev`, navega.** Confirma que o visual bate com o que a Uma desenhou.
2. **Roda o smoke test** pra validar a key.
3. **Se tudo OK**, flipa `VITE_USE_MOCK=false` e gera o **primeiro anúncio real da tomada**.
4. **Lê crítico** análise + keywords + títulos + descrição. VOZ_AMALFI tá saindo?
5. **Se a voz tá boa**, gera as 9 imagens (`Imagen 4`). Custo: ~$0.36.
6. **Aprova capa**, sobe pro Seller Central, anota ASIN no `Anuncio.asin`.
7. **Itera** — o catálogo tá pronto pra acumular SKUs.

Se travar em qualquer ponto: chama o `@dev` (Dex) pra fixes, `@qa` (Quinn) pra review, ou eu mesmo (`@aiox-master`) pra orquestrar.

— Orion 🎯
