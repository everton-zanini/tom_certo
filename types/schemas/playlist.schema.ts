import { z } from "zod";
import { NOTA_CORES, type NotaCorValue } from "@/lib/nota-colors";

const notaCorValues = NOTA_CORES.map((c) => c.value) as [NotaCorValue, ...NotaCorValue[]];

export const playlistSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(200),
  data: z.coerce.date(),
  culto: z.string().max(200).optional().or(z.literal("")),
  descricao: z.string().max(2000).optional().or(z.literal("")),
});

export type PlaylistInput = z.infer<typeof playlistSchema>;

export const playlistSongNotesSchema = z.object({
  playlistId: z.string().min(1),
  songId: z.string().min(1),
  notas: z.string().max(1000),
  cor: z.enum(notaCorValues).nullable().optional(),
});
