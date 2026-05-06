import { z } from 'zod';

/** Schemas Zod pra validar respostas Gemini antes de aceitar. */

export const analiseSchema = z.object({
  persona: z.object({
    label: z.string(),
    descricao: z.string(),
    perfilDemografico: z.string(),
  }),
  dores: z.array(z.object({ titulo: z.string(), descricao: z.string() })).min(1),
  motivacoes: z.array(z.string()).min(1),
  janelaDeDecisao: z.string(),
  publicoSecundario: z.string().nullable().optional(),
});

export const keywordsSchema = z.object({
  total: z.number(),
  destaque: z.array(z.string()),
  flat: z.array(z.string()),
  grupos: z.array(z.object({ categoria: z.string(), termos: z.array(z.string()) })),
});

const tituloSchema = z.object({
  texto: z.string(),
  caracteres: z.number(),
  foco: z.enum(['produto', 'dor']),
});

export const titulosSchema = z.object({
  produto: z.array(tituloSchema),
  dor: z.array(tituloSchema),
});

export const descricaoSchema = z.object({
  description: z.string(),
  descriptionHTML: z.string(),
  amazonBulletPoints: z.array(z.string()),
  bulletPoints: z.array(z.string()),
  faq: z.array(z.object({ pergunta: z.string(), resposta: z.string() })),
});

export const briefingSchema = z.object({
  numero: z.number(),
  isCover: z.boolean(),
  estagio: z.enum(['capa', 'gancho', 'dor', 'mecanismo', 'prova', 'objecao', 'decisao', 'lifestyle', 'detalhe']),
  titulo: z.string(),
  prompt: z.string(),
  negativePrompt: z.string().optional(),
  overlayText: z.string().optional(),
  dataPoints: z.array(z.string()),
  paletaCor: z.enum(['areia', 'mar', 'ceu', 'terracota', 'ocre', 'osso-outline']).optional(),
});

export const briefingsSchema = z.array(briefingSchema);
