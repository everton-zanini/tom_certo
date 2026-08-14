"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/authz";
import { songSchema, songsPageInputSchema, type SongFilters } from "@/types/schemas/song.schema";
import { parseCifra } from "@/lib/cifra/parser";
import { transposeLines, semitoneDiff } from "@/lib/cifra/transpose";
import { extractCfsEntries, inflateCfsEntry, parseCfsText } from "@/lib/cifra/cfs-import";

function tagConnections(tags: string[]) {
  return tags.map((nome) => ({
    tag: { connectOrCreate: { where: { nome }, create: { nome } } },
  }));
}

export async function createSong(input: unknown) {
  await requireRole("ADMIN");
  const data = songSchema.parse(input);

  const song = await prisma.song.create({
    data: {
      titulo: data.titulo,
      artista: data.artista || null,
      ministerio: data.ministerio || null,
      tomOriginal: data.tomOriginal,
      tomAtual: data.tomAtual || data.tomOriginal,
      capo: data.capo ?? 0,
      bpm: data.bpm,
      genero: data.genero || null,
      observacoes: data.observacoes || null,
      linkYoutube: data.linkYoutube || null,
      cifra: data.cifra,
      tags: { create: tagConnections(data.tags ?? []) },
    },
  });

  revalidatePath("/songs");
  return song;
}

export type BulkImportResult = {
  imported: number;
  skipped: { arquivo: string; motivo: string }[];
};

/** Bulk-imports a backup .zip of .cfs cifras, skipping entries that fail to parse or already exist. */
export async function bulkImportSongsFromZip(formData: FormData): Promise<BulkImportResult> {
  await requireRole("ADMIN");

  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("Nenhum arquivo enviado");

  const zipBuffer = Buffer.from(await file.arrayBuffer());
  const entries = await extractCfsEntries(zipBuffer);

  const result: BulkImportResult = { imported: 0, skipped: [] };

  for (const entry of entries) {
    try {
      const parsed = parseCfsText(inflateCfsEntry(entry.buffer), entry.name);
      if ("error" in parsed) {
        result.skipped.push({ arquivo: entry.name, motivo: parsed.error });
        continue;
      }

      const existing = await prisma.song.findFirst({
        where: { titulo: parsed.titulo, artista: parsed.artista || null },
        select: { id: true },
      });
      if (existing) {
        result.skipped.push({ arquivo: entry.name, motivo: "já existente" });
        continue;
      }

      const data = songSchema.parse({
        titulo: parsed.titulo,
        artista: parsed.artista,
        tomOriginal: parsed.tomOriginal,
        observacoes: parsed.observacoes,
        cifra: parsed.cifra,
      });

      await prisma.song.create({
        data: {
          titulo: data.titulo,
          artista: data.artista || null,
          tomOriginal: data.tomOriginal,
          tomAtual: data.tomOriginal,
          observacoes: data.observacoes || null,
          cifra: data.cifra,
        },
      });
      result.imported++;
    } catch (error) {
      result.skipped.push({
        arquivo: entry.name,
        motivo: error instanceof Error ? error.message : "erro desconhecido",
      });
    }
  }

  if (result.imported > 0) revalidatePath("/songs");
  return result;
}

export async function updateSong(id: string, input: unknown) {
  await requireRole("ADMIN");
  const data = songSchema.parse(input);

  const song = await prisma.song.update({
    where: { id },
    data: {
      titulo: data.titulo,
      artista: data.artista || null,
      ministerio: data.ministerio || null,
      tomOriginal: data.tomOriginal,
      tomAtual: data.tomAtual || data.tomOriginal,
      capo: data.capo ?? 0,
      bpm: data.bpm,
      genero: data.genero || null,
      observacoes: data.observacoes || null,
      linkYoutube: data.linkYoutube || null,
      cifra: data.cifra,
      tags: {
        deleteMany: {},
        create: tagConnections(data.tags ?? []),
      },
    },
  });

  revalidatePath("/songs");
  revalidatePath(`/songs/${id}`);
  return song;
}

export async function deleteSong(id: string) {
  await requireRole("ADMIN");
  try {
    await prisma.song.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("Não é possível excluir: esta música está em uso em um ou mais repertórios.");
    }
    throw error;
  }
  revalidatePath("/songs");
}

export async function getSong(id: string) {
  await requireAuth();
  return prisma.song.findUniqueOrThrow({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
}

/** Lightweight list for the library screen — no cifra body, filtered/sorted client-side. */
export async function listSongs(filters?: SongFilters) {
  await requireAuth();
  return prisma.song.findMany({
    where: {
      artista: filters?.artista || undefined,
      ministerio: filters?.ministerio || undefined,
      tomAtual: filters?.tom || undefined,
      genero: filters?.genero || undefined,
    },
    select: {
      id: true,
      titulo: true,
      artista: true,
      ministerio: true,
      tomAtual: true,
      genero: true,
      linkYoutube: true,
      tags: { select: { tag: { select: { nome: true } } } },
    },
    orderBy: { titulo: "asc" },
  });
}

const SONGS_PAGE_SIZE = 20;

/** Paginated + server-side search (título, artista e cifra) for the public songs library screen. */
export async function listSongsPage(input?: unknown) {
  await requireAuth();
  const { query, artista, ministerio, tom, genero, page } = songsPageInputSchema.parse(input ?? {});
  const q = query?.trim();

  const where: Prisma.SongWhereInput = {
    artista: artista || undefined,
    ministerio: ministerio || undefined,
    tomAtual: tom || undefined,
    genero: genero || undefined,
    ...(q
      ? {
          OR: [
            { titulo: { contains: q, mode: "insensitive" } },
            { artista: { contains: q, mode: "insensitive" } },
            { cifra: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const results = await prisma.song.findMany({
    where,
    select: {
      id: true,
      titulo: true,
      artista: true,
      ministerio: true,
      tomAtual: true,
      genero: true,
      linkYoutube: true,
      tags: { select: { tag: { select: { nome: true } } } },
    },
    orderBy: { titulo: "asc" },
    skip: (page - 1) * SONGS_PAGE_SIZE,
    take: SONGS_PAGE_SIZE + 1,
  });

  return { songs: results.slice(0, SONGS_PAGE_SIZE), hasMore: results.length > SONGS_PAGE_SIZE };
}

export async function listDistinctArtistas() {
  await requireAuth();
  const rows = await prisma.song.findMany({
    where: { artista: { not: null } },
    distinct: ["artista"],
    select: { artista: true },
    orderBy: { artista: "asc" },
  });
  return rows.map((r) => r.artista as string);
}

/** Ephemeral preview — does not persist, used by the +/- semitone controls in the viewer. */
export async function transposeSongPreview(id: string, semitones: number) {
  await requireAuth();
  const song = await prisma.song.findUniqueOrThrow({ where: { id } });
  return transposeLines(parseCifra(song.cifra), semitones);
}

export async function setSongCurrentKey(id: string, tom: string) {
  await requireRole("ADMIN");
  const song = await prisma.song.update({ where: { id }, data: { tomAtual: tom } });
  revalidatePath(`/songs/${id}`);
  return song;
}

/** Parses+transposes a song's cifra from its original key to its current working key. */
export async function getSongDisplayLines(id: string) {
  await requireAuth();
  const song = await prisma.song.findUniqueOrThrow({ where: { id } });
  const semitones = semitoneDiff(song.tomOriginal, song.tomAtual);
  return { song, lines: transposeLines(parseCifra(song.cifra), semitones) };
}
