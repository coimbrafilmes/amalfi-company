import { z } from 'zod';

/**
 * Schemas Zod pra validar respostas Gemini antes de aceitar.
 * Bounds explícitos protegem contra alucinação (Gemini retornar 1000 itens).
 */

const shortText = z.string().min(1).max(2_000);
const mediumText = z.string().min(1).max(8_000);

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
 * Descrição Amazon-compatible.
 * Amazon depreciou HTML em descriptions desde julho/2021 — só plain text.
 * `description` deve ter \n\n entre parágrafos, sem tags HTML.
 */
const plainTextNoHtml = z
  .string()
  .min(50)
  .max(3_500)
  .refine((s) => !/<[a-z][^>]*>/i.test(s), {
    message: 'description deve ser plain text (sem tags HTML — Amazon não aceita)',
  });

export const descricaoSchema = z.object({
  description: plainTextNoHtml,
  amazonBulletPoints: z.array(shortText).min(3).max(7),
  bulletPoints: z.array(shortText).min(3).max(7),
  faq: z.array(z.object({ pergunta: shortText, resposta: shortText })).min(2).max(8),
});

// === Briefings: Anúncio (1024x1024) ===
export const briefingSchema = z.object({
  numero: z.number().int().min(1).max(20),
  isCover: z.boolean(),
  estagio: z.enum(['capa', 'gancho', 'dor', 'mecanismo', 'prova', 'objecao', 'decisao', 'lifestyle', 'detalhe']),
  titulo: shortText,
  prompt: z.string().min(20).max(4_000),
  negativePrompt: z.string().max(1_500).optional(),
  overlayText: z.string().max(80).optional(),
  dataPoints: z.array(shortText).min(0).max(10),
  paletaCor: z.enum(['areia', 'mar', 'ceu', 'terracota', 'ocre', 'osso-outline']).optional(),
});

export const briefingsSchema = z.array(briefingSchema).min(1).max(15);

// === Briefings: A+ Content (970x600) ===
export const briefingAPlusSchema = z.object({
  numero: z.number().int().min(1).max(6),
  estagio: z.enum([
    'aplus-header',
    'aplus-beneficio-1',
    'aplus-beneficio-2',
    'aplus-comparacao',
    'aplus-lifestyle-amplo',
    'aplus-detalhe-tecnico',
  ]),
  titulo: shortText,
  prompt: z.string().min(20).max(4_000),
  negativePrompt: z.string().max(1_500).optional(),
  overlayText: z.string().max(120).optional(),
  paletaCor: z.enum(['areia', 'mar', 'ceu', 'terracota', 'ocre', 'osso-outline']).optional(),
});

export const briefingsAPlusSchema = z.array(briefingAPlusSchema).length(6);

// Exporta tipos inferidos
export type AnaliseSchema = z.infer<typeof analiseSchema>;
export type KeywordsSchema = z.infer<typeof keywordsSchema>;
export type TitulosSchema = z.infer<typeof titulosSchema>;
export type DescricaoSchema = z.infer<typeof descricaoSchema>;

// suppress unused mediumText — ainda exportável
export const _mediumText = mediumText;
