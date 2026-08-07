import { z } from "zod";

const tomRegex = /^[A-G](#|b)?m?$/;

export const songSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório").max(200),
  artista: z.string().max(200).optional().or(z.literal("")),
  ministerio: z.string().max(200).optional().or(z.literal("")),
  tomOriginal: z.string().regex(tomRegex, "Tom inválido (ex: G, Am, F#)"),
  tomAtual: z.string().regex(tomRegex, "Tom inválido (ex: G, Am, F#)").optional().or(z.literal("")),
  capo: z.coerce.number().int().min(0).max(11).optional(),
  bpm: z.coerce.number().int().min(20).max(300).optional(),
  genero: z.string().max(100).optional().or(z.literal("")),
  observacoes: z.string().max(2000).optional().or(z.literal("")),
  linkYoutube: z.string().url("URL inválida").optional().or(z.literal("")),
  cifra: z.string().min(1, "Cifra é obrigatória").max(20000),
  tags: z.array(z.string().min(1).max(50)).optional().default([]),
});

export type SongInput = z.infer<typeof songSchema>;

export const songFiltersSchema = z.object({
  query: z.string().optional(),
  artista: z.string().optional(),
  ministerio: z.string().optional(),
  tom: z.string().optional(),
  genero: z.string().optional(),
});

export type SongFilters = z.infer<typeof songFiltersSchema>;
