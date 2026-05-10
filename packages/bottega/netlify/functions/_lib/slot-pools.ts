/**
 * Slot Pools V4 — seleção dinâmica de slots por estilo + quantidade.
 *
 * Substitui SLOT_ORDER fixo (V3) por pools por categoria × estilo.
 * Pipeline V4 chama selectSlots(form) → retorna lista ordenada de SlotKind
 * baseada em estilo escolhido + quantidade pedida.
 *
 * Filosofia da seleção:
 *   - Pool ordenado por relevância do template pro estilo
 *   - Se pediu N e pool tem >= N templates: pega primeiros N
 *   - Se pediu N > pool.length: pega todo pool + repete topo (com instrução
 *     no prompt pro modelo variar ângulo/mood/perspectiva)
 *
 * Templates atuais (V3 baseline):
 *   Anúncio (7): capa, dimensoes, lifestyle-callouts, comparativo,
 *                aspiracional, beneficios, prova-final
 *   A+ (8): header, antes-depois, specs, casos-uso, validacao, cta,
 *           premium, comparison
 */

import type { CriacaoForm, EstiloImagem, SlotKind } from '../../../src/types/anuncio';

// ============================================================================
// POOLS — ordenados por afinidade com o estilo
// ============================================================================

const ANUNCIO_POOL_LIFESTYLE: SlotKind[] = [
  'anuncio-aspiracional',         // hero cinematic
  'anuncio-lifestyle-callouts',   // lifestyle com 3 pills
  'anuncio-capa',                 // foto produto puro
  'anuncio-beneficios',           // ambiente real
  'anuncio-prova-final',          // hero magazine cover
  'anuncio-dimensoes',            // técnico — fim do pool
  'anuncio-comparativo',          // técnico — fim do pool
];

const ANUNCIO_POOL_INFOGRAFICO: SlotKind[] = [
  'anuncio-capa',                 // foto produto puro (essencial)
  'anuncio-dimensoes',            // spec sheet
  'anuncio-comparativo',          // good vs bad
  'anuncio-beneficios',           // bullets visuais
  'anuncio-prova-final',          // selo/badge
  'anuncio-lifestyle-callouts',   // lifestyle suave
  'anuncio-aspiracional',         // aspiracional — fim
];

const ANUNCIO_POOL_MISTO: SlotKind[] = [
  'anuncio-capa',
  'anuncio-aspiracional',
  'anuncio-dimensoes',
  'anuncio-lifestyle-callouts',
  'anuncio-comparativo',
  'anuncio-beneficios',
  'anuncio-prova-final',
];

const APLUS_POOL_LIFESTYLE: SlotKind[] = [
  'aplus-header',                 // hero opener
  'aplus-casos-uso',              // 3-4 cenários reais
  'aplus-cta',                    // closing cinematic
  'aplus-premium',                // 1464×600 hero amplificado
  'aplus-validacao',              // social proof
  'aplus-antes-depois',           // antes/depois
  'aplus-specs',                  // técnico — fim
  'aplus-comparison',             // 220×220 — fim
];

const APLUS_POOL_INFOGRAFICO: SlotKind[] = [
  'aplus-specs',                  // tabela específica
  'aplus-antes-depois',           // comparativo visual
  'aplus-comparison',             // 220×220 grid Amazon
  'aplus-validacao',              // selo/badge
  'aplus-header',                 // hero
  'aplus-cta',                    // closing
  'aplus-premium',
  'aplus-casos-uso',              // lifestyle — fim
];

const APLUS_POOL_MISTO: SlotKind[] = [
  'aplus-header',
  'aplus-specs',
  'aplus-antes-depois',
  'aplus-casos-uso',
  'aplus-validacao',
  'aplus-cta',
  'aplus-premium',
  'aplus-comparison',
];

// ============================================================================
// SELEÇÃO
// ============================================================================

function poolFor(variante: 'anuncio' | 'aplus', estilo: EstiloImagem): SlotKind[] {
  if (variante === 'anuncio') {
    if (estilo === 'lifestyle') return ANUNCIO_POOL_LIFESTYLE;
    if (estilo === 'infografico') return ANUNCIO_POOL_INFOGRAFICO;
    return ANUNCIO_POOL_MISTO;
  }
  if (estilo === 'lifestyle') return APLUS_POOL_LIFESTYLE;
  if (estilo === 'infografico') return APLUS_POOL_INFOGRAFICO;
  return APLUS_POOL_MISTO;
}

/** Pega N do pool, repetindo topo se N > pool.length. */
function pickN(pool: SlotKind[], n: number): SlotKind[] {
  if (n <= pool.length) return pool.slice(0, n);
  // Caso N > pool: completa com repetições do topo
  const result: SlotKind[] = [...pool];
  const remaining = n - pool.length;
  for (let i = 0; i < remaining; i++) {
    result.push(pool[i % pool.length]);
  }
  return result;
}

/** Quantidade efetiva de anúncio (com fallback V3 → V4). */
function effectiveNumeroAnuncio(form: CriacaoForm): number {
  if (typeof form.numeroAnuncio === 'number' && form.numeroAnuncio > 0) {
    return form.numeroAnuncio;
  }
  // Fallback V3: numeroImagens incluía anúncio + aplus juntos
  if (typeof form.numeroImagens === 'number' && form.numeroImagens > 0) {
    // V3 era 7+6=13 ou 7+8=15 — assume metade pra anúncio
    return Math.min(7, Math.max(6, Math.round(form.numeroImagens / 2)));
  }
  return 7; // default sane
}

/** Quantidade efetiva de A+ (com fallback V3 → V4). */
function effectiveNumeroAplus(form: CriacaoForm): number {
  if (typeof form.numeroAplus === 'number' && form.numeroAplus > 0) {
    return form.numeroAplus;
  }
  if (typeof form.numeroImagens === 'number' && form.numeroImagens > 0) {
    return Math.min(6, Math.max(3, Math.round(form.numeroImagens / 2)));
  }
  return 5;
}

/** Estilo efetivo de anúncio (com fallback V3 → V4). */
function effectiveEstiloAnuncio(form: CriacaoForm): EstiloImagem {
  return form.estiloAnuncio ?? form.estiloImagem ?? 'misto';
}

/** Estilo efetivo de A+ (com fallback V3 → V4). */
function effectiveEstiloAplus(form: CriacaoForm): EstiloImagem {
  return form.estiloAplus ?? form.estiloImagem ?? 'misto';
}

export interface SlotSelection {
  /** Slots a renderizar, em ordem (anúncio primeiro, depois A+). */
  slots: SlotKind[];
  /** Lista ordenada só de anúncio. */
  anuncioSlots: SlotKind[];
  /** Lista ordenada só de A+. */
  aplusSlots: SlotKind[];
  /** Estilo aplicado em cada anúncio slot. */
  estiloAnuncio: EstiloImagem;
  /** Estilo aplicado em cada A+ slot. */
  estiloAplus: EstiloImagem;
}

/**
 * Função central: dado um form V4, retorna a lista de slots a renderizar.
 *
 * Garantias:
 *   - anuncioSlots.length === effectiveNumeroAnuncio(form)
 *   - aplusSlots.length === effectiveNumeroAplus(form)
 *   - slots = [...anuncioSlots, ...aplusSlots]
 */
export function selectSlots(form: CriacaoForm): SlotSelection {
  const estiloAnuncio = effectiveEstiloAnuncio(form);
  const estiloAplus = effectiveEstiloAplus(form);
  const numAnuncio = effectiveNumeroAnuncio(form);
  const numAplus = effectiveNumeroAplus(form);

  const anuncioSlots = pickN(poolFor('anuncio', estiloAnuncio), numAnuncio);
  const aplusSlots = pickN(poolFor('aplus', estiloAplus), numAplus);

  return {
    slots: [...anuncioSlots, ...aplusSlots],
    anuncioSlots,
    aplusSlots,
    estiloAnuncio,
    estiloAplus,
  };
}

/**
 * Mapping slot → estilo aplicado nesse slot específico, baseado na variante.
 * Pipeline usa pra escolher prompt do estilo certo.
 */
export function estiloForSlot(slot: SlotKind, selection: SlotSelection): EstiloImagem {
  const isAnuncio = selection.anuncioSlots.includes(slot);
  return isAnuncio ? selection.estiloAnuncio : selection.estiloAplus;
}
