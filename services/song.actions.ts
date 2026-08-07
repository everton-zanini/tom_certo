"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/authz";
import { songSchema, type SongFilters } from "@/types/schemas/song.schema";
import { parseCifra } from "@/lib/cifra/parser";
import { transposeLines, semitoneDiff } from "@/lib/cifra/transpose";

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
