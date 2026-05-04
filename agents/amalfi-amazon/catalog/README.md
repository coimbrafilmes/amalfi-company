# Catálogo Amalfi — Índice

> Índice de todos os SKUs Amalfi cadastrados no agente `@amalfi-amazon`.
> Cada SKU tem um arquivo dedicado nesta pasta com ficha técnica completa.

---

## 📊 Resumo

- **Total de SKUs cadastrados**: 0
- **Última atualização**: 2026-05-04 (cadastro vazio — bootstrap)

---

## 📋 Lista de SKUs

| ASIN | SKU ID | Nome Interno | Categoria | Status | Última Atualização |
|---|---|---|---|---|---|
| _(catálogo vazio — cadastre o primeiro SKU com `*generate-listing`)_ | | | | | |

---

## 🗂️ Convenções

### Formato do nome do arquivo
- ASIN como nome: `{ASIN}.md` (ex: `B0GPRBSRSN.md`)
- Se SKU ainda não tem ASIN: `pending-{slug}.md` (ex: `pending-luminaria-touch.md`)
- Após go-live, renomear pra ASIN

### Status dos SKUs
- `active` — ativo e vendendo
- `paused` — pausado (sem estoque, sem investimento)
- `discontinued` — descontinuado (não retomar)

### Categorias Amazon BR mais comuns (para consistência)
- Iluminação > Abajures
- Iluminação > Luminárias
- Decoração > Vasos e Plantas
- Decoração > Quadros e Pinturas
- Banho > Toalhas
- Banho > Tapetes
- Cozinha > Utensílios
- Cama Mesa e Banho > Roupa de Cama

(adicionar conforme catálogo cresce)

---

## 🔄 Manutenção do Índice

Este arquivo é atualizado automaticamente pelo agente sempre que:
- Um novo SKU é cadastrado (`*generate-listing` num produto novo)
- Um SKU é atualizado (`*update-sku`)
- Um SKU muda de status

Para forçar atualização manual: `*list-catalog` (mostra estado atual + sincroniza este README).

---

_Última sincronização automática: 2026-05-04 (criado vazio)_
