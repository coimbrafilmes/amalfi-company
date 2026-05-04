# Regras Técnicas Amazon BR

> Knowledge Base do agente Marco. **TODA** geração de conteúdo deve ser validada contra estas regras antes de entregar ao owner.

---

## 📏 Limites de Caracteres

### Título
- **Padrão**: 200 caracteres (incluindo espaços)
- **Categorias específicas**: alguns nichos aceitam até 250 (Casa = 200)
- **Mobile-first**: primeiros 60-80 chars são o que aparece em busca mobile — colocar **keyword principal + diferencial** no início
- **Recomendado**: 180-198 chars (margem de segurança)

### Bullet Points
- **Máximo por bullet**: 1.000 caracteres
- **Recomendado**: 200-250 chars por bullet (mobile-first; bullets longos são truncados)
- **Quantidade**: exatamente 5 bullets (Amazon mostra os 5 antes da descrição)
- **Estrutura ideal**: `**HEADLINE EM CAPS**: descrição com benefício específico.`

### Descrição (Product Description)
- **Máximo**: 2.000 caracteres
- **Aceita HTML básico**: `<br>`, `<b>`, `<i>`, `<ul>`, `<li>`, `<p>`
- **NÃO aceita**: tabelas complexas, JavaScript, CSS, links externos
- **Recomendado**: 1.500-1.900 chars

### Backend Keywords (Search Terms)
- **Máximo**: 250 BYTES (não chars — bytes UTF-8)
- **Caracteres acentuados** (á, ç) = 2 bytes
- **Sem repetir** palavras do título (Amazon ignora duplicatas)
- **Sem vírgulas** (separar com espaço)
- **Sem aspas, sem pontuação**
- **Tudo minúsculo** (case insensitive)
- **Inclui erros comuns de digitação** se relevante
- **Sinônimos e variações** (luminária / luminaria / abajur / candeeiro)

### Bullets vs Descrição vs Backend
- **Bullets** = features/benefícios visíveis (cliente lê)
- **Descrição** = expansão de benefícios + uso (cliente lê)
- **Backend** = SEO interno Amazon (cliente NÃO vê — keywords puras)

---

## 🚫 Palavras/Frases Proibidas

### Proibidas em qualquer lugar do listing
- "**Garantia eterna**", "**Vida útil ilimitada**" → claims absolutos
- "**100% efetivo**", "**Cura**", "**Milagre**" → claims médicos
- "**Melhor do mundo**", "**Único**", "**Insuperável**" → superlatives sem prova
- "**Best seller**", "**Amazon's Choice**", "**Top vendido**" → badges são definidos pela Amazon, não pelo seller
- "**Promoção**", "**Oferta limitada**", "**Black Friday**" → tudo sobre preço/promoção é via Seller Central, não no listing
- "**Importado**", "**Original**", "**Importado dos EUA**" — restrito (suspensão se mentir)

### Comparativos diretos com marcas concorrentes
- ❌ "Melhor que Philips"
- ❌ "Concorrente da Tramontina"
- ✅ "Compatível com Philips" (ok se for verdade)

### Símbolos e formatação
- ❌ Emojis no título (Casa = não permitido)
- ❌ `™ ® © $ € £` no título
- ❌ Caracteres não-ASCII problemáticos (preferir vírgula a en-dash `–`)
- ✅ Letras acentuadas (à, é, ç) — permitidas e indexadas
- ✅ Números, vírgulas, hífen comum (-)

### Linkagem e contato
- ❌ URLs (qualquer link externo)
- ❌ Email, telefone, redes sociais
- ❌ Menção a "fora da Amazon"

---

## 🖼️ Image Policy (Crítico)

### Imagem #1 — HERO (a principal)
- **OBRIGATÓRIO**: foto real do produto
- **Fundo**: branco puro `#FFFFFF` (RGB 255,255,255)
- **Produto**: ocupando **85%+** do frame
- **Sem**: texto, logos, watermarks, badges, infográficos, mãos segurando
- **Sem**: pessoas, animais, sombras dramáticas
- **Resolução mínima**: 1.000×1.000 px (recomendado 2.000×2.000)
- **Formato**: JPG ou PNG (PNG preferido pra preservar fundo limpo)
- **Color mode**: sRGB
- **NÃO PODE ser 100% gerada por IA** — Amazon detecta e penaliza

### Imagens #2 a #7
- **Permitido**: lifestyle (produto em uso), infográficos, comparativos, gráficos, dimensões
- **Permitido**: texto sobreposto (em #2-7, NUNCA na #1)
- **Recomendado**: pelo menos 1 lifestyle + 1 infográfico + 1 dimensões
- **Mesma resolução**: 1.000×1.000 mínimo

### Vídeo (opcional, slot extra)
- 15-90 segundos
- MP4, MOV, AVI
- Recomendado: hero + benefícios + uso real

### Aspect Ratio
- **Hero**: quadrado 1:1 obrigatório
- **Outras**: 1:1 preferido; 4:5 aceito
- **Vídeo**: 16:9 ou 1:1

---

## 🏷️ A+ Content (Enhanced Brand Content)

### Pré-requisito
- **Brand Registry obrigatório** (registro de marca no INPI ou via Amazon IP Accelerator)
- **Owner Amalfi NÃO tem** (decisão consciente — modelo revenda sem marca própria)
- **Implicação**: A+ Content NÃO está disponível pro owner

### Por que ainda gerar conteúdo A+?
- Caso owner mude de ideia futuramente, conteúdo já está pronto
- Marcar claramente como "FUTURO/OPCIONAL — requer Brand Registry"

### 7 Módulos disponíveis (referência)
1. Banner principal
2. Imagem + texto justaposto
3. Comparativo (4 colunas)
4. Imagem técnica + bullets
5. Logo + storytelling
6. Múltiplas imagens (galeria)
7. FAQ visual

---

## 📂 Browse Nodes (Categorização Amazon BR)

### Estrutura típica para Casa
```
Casa
├── Iluminação
│   ├── Abajures
│   ├── Luminárias de Mesa
│   ├── Luminárias de Chão
│   └── Luminárias de Parede
├── Decoração
│   ├── Vasos e Plantas Artificiais
│   ├── Quadros
│   └── Esculturas
├── Cozinha
│   ├── Utensílios
│   └── Organizadores
├── Banho
│   ├── Toalhas
│   ├── Tapetes
│   └── Acessórios
└── Cama Mesa e Banho
    ├── Lençóis
    ├── Edredons
    └── Travesseiros
```

### Como descobrir Browse Node ID
- Seller Central → Catalog → Add Products → Search categories
- Ou usar URL pattern: `amazon.com.br/b?node={ID}` pra validar

### Categoria errada = morte do listing
- Listing em categoria errada = ranking ruim mesmo com tudo otimizado
- Sempre confirmar com owner antes de usar Browse Node sugerido

---

## 💰 Variações (Parent/Child SKUs)

### Quando criar variações
- Mesmo produto em **cores diferentes**
- Mesmo produto em **tamanhos/quantidades diferentes**
- Mesmo produto com **voltagens diferentes** (110/220/bivolt)

### Quando NÃO criar variações
- Produtos genuinamente diferentes (não criar "abajur grande" + "abajur pequeno" como variação se forem produtos distintos)
- Material muito diferente (metal vs plástico)

### Estrutura
- **Parent ASIN**: pai (não vende, só agrupa)
- **Child ASINs**: variações reais (cada um com estoque, preço próprio)

---

## 🇧🇷 Specifics Brasil

### Voltagem (CRÍTICO)
- BR tem 110V e 220V (varia por estado)
- **Bivolt** é diferencial competitivo forte
- **NUNCA omitir** voltagem em produtos elétricos
- **NUNCA chutar** — confirmar com owner

### Fiscal
- Owner deve emitir NF-e (responsabilidade do owner, não do agente)
- Sem CST/NCM no listing — fica no Seller Central

### Idioma
- **pt-BR fluente, não traduzido**
- Evitar anglicismos desnecessários ("delivery" → "entrega", "wireless" → "sem fio")
- Mas manter termos consagrados ("touch", "LED", "USB")

### Hábitos de consumo
- Brasileiros valorizam: garantia (mesmo que Amazon ofereça padrão), assistência técnica, manual em português
- Brasileiros buscam: "barato", "promoção", "frete grátis" (mas não no listing — Seller Central)

---

## ✅ Checklist Pré-Publicação

Antes de aprovar um listing pra ir ao Seller Central:

- [ ] Título ≤ 200 chars
- [ ] Título começa com keyword principal
- [ ] Sem caracteres proibidos no título
- [ ] 5 bullets (não 4, não 6)
- [ ] Cada bullet com headline em CAPS + descrição
- [ ] Cada bullet ≤ 250 chars (recomendado)
- [ ] Descrição ≤ 2.000 chars
- [ ] Backend keywords ≤ 250 bytes
- [ ] Sem palavras proibidas
- [ ] Hero #1 será foto real (briefing claro)
- [ ] 7 imagens briefadas
- [ ] Browse Node sugerido (validar com owner)
- [ ] Voltagem mencionada se aplicável
- [ ] Sem URLs, emails, telefones

---

## 🆕 Updates Recentes (Amazon BR)

> Atualizar conforme Amazon mudar regras. Última revisão: 2026-05-04.

- 2025: Amazon BR aumentou limite de caracteres em algumas categorias
- 2025: Brand Story disponível mesmo sem A+ completo (mas ainda requer Brand Registry)
- 2026: Imagens com IA detectada automaticamente — hero deve ser real

---

_Mantido por @amalfi-amazon (Marco). Atualizar quando Amazon mudar políticas._
