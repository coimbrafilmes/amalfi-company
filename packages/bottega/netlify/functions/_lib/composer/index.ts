/**
 * Composition layer entry point.
 * Roteia (slotKind, baseImage, params) pra função de composição específica.
 */

import { compose as composeAnuncioCapa } from './slots/anuncio-1-capa';
import { compose as composeAnuncioDimensoes } from './slots/anuncio-2-dimensoes';
import { compose as composeAnuncioLifestyleCallouts } from './slots/anuncio-3-lifestyle-callouts';
import { compose as composeAnuncioComparativo } from './slots/anuncio-4-comparativo';
import { compose as composeAnuncioAspiracional } from './slots/anuncio-5-aspiracional';
import { compose as composeAnuncioBeneficios } from './slots/anuncio-6-beneficios';
import { compose as composeAnuncioProvaFinal } from './slots/anuncio-7-prova-final';
import { compose as composeAplusHeader } from './slots/aplus-1-header';
import { compose as composeAplusAntesDepois } from './slots/aplus-2-antes-depois';
import { compose as composeAplusSpecs } from './slots/aplus-3-specs';
import { compose as composeAplusCasosUso } from './slots/aplus-4-casos-uso';
import { compose as composeAplusValidacao } from './slots/aplus-5-validacao';
import { compose as composeAplusCta } from './slots/aplus-6-cta';
import { compose as composeAplusPremium } from './slots/aplus-7-premium';
import { compose as composeAplusComparison } from './slots/aplus-8-comparison';
import type { SlotKind } from '../../../../src/types/anuncio';
import type { SlotParamsByKind } from './types';

export async function composeForSlot<K extends SlotKind>(
  slotKind: K,
  baseImage: Buffer,
  params: SlotParamsByKind[K],
): Promise<Buffer> {
  switch (slotKind) {
    case 'anuncio-capa':
      return composeAnuncioCapa(baseImage, params as SlotParamsByKind['anuncio-capa']);
    case 'anuncio-dimensoes':
      return composeAnuncioDimensoes(baseImage, params as SlotParamsByKind['anuncio-dimensoes']);
    case 'anuncio-lifestyle-callouts':
      return composeAnuncioLifestyleCallouts(baseImage, params as SlotParamsByKind['anuncio-lifestyle-callouts']);
    case 'anuncio-comparativo':
      return composeAnuncioComparativo(baseImage, params as SlotParamsByKind['anuncio-comparativo']);
    case 'anuncio-aspiracional':
      return composeAnuncioAspiracional(baseImage, params as SlotParamsByKind['anuncio-aspiracional']);
    case 'anuncio-beneficios':
      return composeAnuncioBeneficios(baseImage, params as SlotParamsByKind['anuncio-beneficios']);
    case 'anuncio-prova-final':
      return composeAnuncioProvaFinal(baseImage, params as SlotParamsByKind['anuncio-prova-final']);
    case 'aplus-header':
      return composeAplusHeader(baseImage, params as SlotParamsByKind['aplus-header']);
    case 'aplus-antes-depois':
      return composeAplusAntesDepois(baseImage, params as SlotParamsByKind['aplus-antes-depois']);
    case 'aplus-specs':
      return composeAplusSpecs(baseImage, params as SlotParamsByKind['aplus-specs']);
    case 'aplus-casos-uso':
      return composeAplusCasosUso(baseImage, params as SlotParamsByKind['aplus-casos-uso']);
    case 'aplus-validacao':
      return composeAplusValidacao(baseImage, params as SlotParamsByKind['aplus-validacao']);
    case 'aplus-cta':
      return composeAplusCta(baseImage, params as SlotParamsByKind['aplus-cta']);
    case 'aplus-premium':
      return composeAplusPremium(baseImage, params as SlotParamsByKind['aplus-premium']);
    case 'aplus-comparison':
      return composeAplusComparison(baseImage, params as SlotParamsByKind['aplus-comparison']);
    default:
      throw new Error(`Unknown slot kind: ${slotKind}`);
  }
}
