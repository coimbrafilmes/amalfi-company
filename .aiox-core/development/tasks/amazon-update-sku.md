# amazon-update-sku

**Task ID:** amazon-update-sku
**Version:** 1.0.0
**Created:** 2026-05-04
**Agent:** @amalfi-amazon (Marco)

---

## Purpose

Atualizar ficha técnica de um SKU já cadastrado no catálogo Amalfi. Útil quando: especificações mudaram, preço foi ajustado, fornecedor trocou, status alterou (active → paused → discontinued), ou owner quer corrigir algum campo.

---

## Inputs

```yaml
inputs:
  - name: sku_identifier
    type: string
    required: true
    description: ASIN ou sku_id ou slug do produto
    example: "B0GPRBSRSN" or "AMALFI-001"
  
  - name: fields_to_update
    type: object
    required: false
    description: Campos específicos a atualizar; se ausente, abre elicitação interativa
    example: '{ "price": "R$ 89.90", "stock": 15, "status": "active" }'
```

---

## Outputs

```yaml
outputs:
  - name: updated_catalog_entry
    type: file
    path: "agents/amalfi-amazon/catalog/{asin_or_slug}.md"
    persisted: true
  
  - name: chat_confirmation
    type: text
    persisted: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] SKU existe no catálogo (catalog/{identifier}.md)
    blocker: true
    error_message: "SKU não encontrado. Use *list-catalog pra ver SKUs cadastrados, ou *generate-listing pra cadastrar novo."
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Arquivo do catálogo atualizado
    blocker: true
  
  - [ ] Timestamp de updated_at atualizado
    blocker: true
  
  - [ ] Histórico do SKU mantém registro da mudança
    blocker: false
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Arquivo YAML do catálogo válido após update
    blocker: true
  
  - [ ] Pelo menos 1 campo modificado
    blocker: true
```

---

## Process

### Step 1: Localizar SKU

```
1. Tentar match direto: catalog/{identifier}.md
2. Se não, buscar por sku_id no frontmatter de todos arquivos
3. Se não, buscar por slug no nome do arquivo
4. Se ainda não, FALHAR com instrução
```

### Step 2: Ler Estado Atual

```
1. Carregar arquivo do catálogo
2. Parsear frontmatter YAML
3. Apresentar AO OWNER estado atual:

📦 SKU: {nome}
   ASIN: {asin}
   Status: {status}
   Preço: R$ {price}
   Estoque: {stock}
   ...
```

### Step 3: Branch — Update Específico vs Interativo

#### Se fields_to_update fornecido:
```
Aplicar mudanças diretamente. Pular Step 4.
```

#### Se NÃO fornecido (interativo):
```
Apresentar checklist:

Quais campos atualizar? (responda os números separados por vírgula)
1. Status (active/paused/discontinued)
2. Preço atual
3. Custo de aquisição
4. Estoque atual
5. Modalidade (FBA/FBM)
6. Performance (vendas/ACoS/etc)
7. Especificações técnicas
8. Outro (especifique)

Ou cole direto: "preço=89.90 estoque=15 status=active"
```

### Step 4: Aplicar Mudanças

```
1. Validar cada campo:
   - Status: active | paused | discontinued
   - Preço: número positivo
   - Estoque: inteiro ≥ 0
   - Modalidade: FBA | FBM
   - Performance: campos numéricos válidos

2. Atualizar frontmatter YAML do catálogo
3. Atualizar updated_at = now()
4. Atualizar versão se for mudança significativa
```

### Step 5: Adicionar ao Histórico

```
Adicionar entrada na seção "Histórico de Versões" do arquivo:

- v{N}.{M} ({date}): atualização — {campos modificados}
```

### Step 6: Confirmar ao Owner

```
✅ SKU {asin} atualizado em catalog/{file}.md.
   Mudanças: {lista de campos modificados}
   Updated_at: {date}
```

---

## Error Handling

```yaml
errors:
  - error: SKU não encontrado
    fallback: listar SKUs próximos (fuzzy match), pedir confirmação
  
  - error: campo inválido (ex: preço negativo)
    fallback: rejeitar mudança, pedir valor válido
  
  - error: arquivo do catálogo corrompido (YAML inválido)
    fallback: avisar owner e abortar; pedir intervenção manual
```

---

## Performance

```yaml
expected_duration: 30 segundos a 2 minutos (depende do modo)
expected_cost: ~R$ 0.05 por update
```

---

_Task v1.0.0 — criada por @aiox-master pra @amalfi-amazon._
