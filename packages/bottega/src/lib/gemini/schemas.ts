import { z } from 'zod';

/**
 * Schemas Zod pra validar respostas Gemini antes de aceitar.
 * Bounds explícitos protegem contra alucinação.
 *
 * V3: removido briefingsSchema (pipeline gera briefings server-side por SlotKind)
 *     e descriptionHTML (Amazon não aceita HTML em descriptions).
 */

const shortText = z.string().min(1).max(2_000);

export const analiseSchema = z.object({
  persona: z.object({
    label: shortText,
    descricao: shortText,
    perfilDemografico: shortText,
  }),
  dores: z.array(z.object({ titulo: shortText, descricao: shortText })).min(2).max(5),
  motivacoes: z.array(shortText).min(3).max(7),
  janelaDeDecisao: shortText,
  publicoSecundario: z.string().max(2_000).nullable().optional(),
});

export const keywordsSchema = z.object({
  total: z.number().int().min(20).max(80),
  destaque: z.array(shortText).min(3).max(15),
  flat: z.array(shortText).min(20).max(80),
  grupos: z
    .array(
      z.object({
        categoria: shortText,
        termos: z.array(shortText).min(1).max(20),
      }),
    )
    .min(2)
    .max(8),
});

const tituloSchema = z.object({
  texto: shortText,
  caracteres: z.number().int().min(10).max(300),
  foco: z.enum(['produto', 'dor']),
});

export const titulosSchema = z.object({
  produto: z.array(tituloSchema).min(3).max(8),
  dor: z.array(tituloSchema).min(3).max(8),
});

/**
 * Descrição plain text Amazon-compatible.
 * Amazon depreciou HTML em descriptions desde julho/2021.
 */
const plainTextNoHtml = z
  .string()
  .min(50)
  .max(3_500)
  .refine((s) => !/<[a-z][^>]*>/i.test(s), {
    message: 'description deve ser plain text (Amazon não aceita tags HTML)',
  });

export const descricaoSchema = z.object({
  description: plainTextNoHtml,
  amazonBulletPoints: z.array(shortText).min(3).max(7),
  bulletPoints: z.array(shortText).min(3).max(7),
  faq: z.array(z.object({ pergunta: shortText, resposta: shortText })).min(2).max(8),
});

/**
 * 7 Destaques — bullets curtos punchy pra usar como copy de conversão (carousel
 * Amazon, listing principal, social). Cada um até 80 chars (mobile-first).
 * Schema exige exatamente 7 itens — paridade com Gumpinho.
 */
const destaqueText = z.string().min(8).max(80);
export const destaquesSchema = z.object({
  destaques: z.array(destaqueText).length(7),
});
