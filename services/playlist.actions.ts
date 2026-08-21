"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/authz";
import { playlistSchema, playlistSongNotesSchema } from "@/types/schemas/playlist.schema";
import { buildLinksOnly, buildNamesOnly, buildPlaylistMessage } from "@/lib/share/build-message";

export async function createPlaylist(input: unknown) {
  const session = await requireRole("ADMIN");
  const data = playlistSchema.parse(input);

  const playlist = await prisma.playlist.create({
    data: {
      nome: data.nome,
      data: data.data,
      culto: data.culto || null,
      descricao: data.descricao || null,
      responsavelId: session.user.id,
    },
  });

  revalidatePath("/playlists");
  return playlist;
}

export async function updatePlaylist(id: string, input: unknown) {
  await requireRole("ADMIN");
  const data = playlistSchema.parse(input);

  const playlist = await prisma.playlist.update({
    where: { id },
    data: {
      nome: data.nome,
      data: data.data,
      culto: data.culto || null,
      descricao: data.descricao || null,
    },
  });

  revalidatePath("/playlists");
  revalidatePath(`/playlists/${id}`);
  return playlist;
}

export async function deletePlaylist(id: string) {
  await requireRole("ADMIN");
  await prisma.playlist.delete({ where: { id } });
  revalidatePath("/playlists");
}

export async function addSongToPlaylist(playlistId: string, songId: string) {
  await requireRole("ADMIN");
  const last = await prisma.playlistSong.findFirst({
    where: { playlistId },
    orderBy: { ordem: "desc" },
  });
  const playlistSong = await prisma.playlistSong.create({
    data: { playlistId, songId, ordem: (last?.ordem ?? -1) + 1 },
  });
  revalidatePath(`/playlists/${playlistId}/edit`);
  return playlistSong;
}

export async function removeSongFromPlaylist(playlistId: string, songId: string) {
  await requireRole("ADMIN");
  await prisma.playlistSong.delete({ where: { playlistId_songId: { playlistId, songId } } });
  revalidatePath(`/playlists/${playlistId}/edit`);
}

export async function reorderPlaylistSongs(playlistId: string, orderedSongIds: string[]) {
  await requireRole("ADMIN");
  await prisma.$transaction(
    orderedSongIds.map((songId, ordem) =>
      prisma.playlistSong.update({
        where: { playlistId_songId: { playlistId, songId } },
        data: { ordem },
      })
    )
  );
  revalidatePath(`/playlists/${playlistId}/edit`);
}

export async function updatePlaylistSongNotes(input: unknown) {
  await requireRole("ADMIN");
  const { playlistId, songId, notas, cor } = playlistSongNotesSchema.parse(input);
  await prisma.playlistSong.update({
    where: { playlistId_songId: { playlistId, songId } },
    data: { notas, cor: cor ?? null },
  });
  revalidatePath(`/playlists/${playlistId}/edit`);
  revalidatePath(`/playlists/${playlistId}`);
  revalidatePath("/songs/notas");
}

export async function listPlaylistSongNotesAdmin() {
  await requireRole("ADMIN");
  return prisma.playlistSong.findMany({
    where: { OR: [{ notas: { not: null } }, { cor: { not: null } }] },
    orderBy: [{ playlist: { data: "desc" } }, { ordem: "asc" }],
    include: {
      song: { select: { titulo: true, artista: true } },
      playlist: { select: { nome: true, data: true } },
    },
  });
}

export async function publishPlaylist(id: string) {
  await requireRole("ADMIN");
  const playlist = await prisma.playlist.update({ where: { id }, data: { visibility: "PUBLISHED" } });
  revalidatePath("/playlists");
  revalidatePath(`/playlists/${id}`);
  return playlist;
}

const PLAYLISTS_PAGE_SIZE = 12;

export async function listPlaylists(filters?: {
  upcoming?: boolean;
  date?: Date;
  page?: number;
}) {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";
  const page = filters?.page && filters.page > 0 ? filters.page : 1;

  const dateRange = filters?.date
    ? (() => {
        const start = new Date(filters.date!.toDateString());
        return { gte: start, lt: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
      })()
    : filters?.upcoming
      ? { gte: new Date(new Date().toDateString()) }
      : undefined;

  const where = {
    data: dateRange,
    OR: isAdmin ? undefined : [{ visibility: "PUBLISHED" as const }, { responsavelId: session.user.id }],
  };

  const [playlists, total] = await Promise.all([
    prisma.playlist.findMany({
      where,
      orderBy: { data: filters?.upcoming ? "asc" : "desc" },
      include: { _count: { select: { songs: true } } },
      skip: (page - 1) * PLAYLISTS_PAGE_SIZE,
      take: PLAYLISTS_PAGE_SIZE,
    }),
    prisma.playlist.count({ where }),
  ]);

  return {
    playlists,
    page,
    totalPages: Math.max(1, Math.ceil(total / PLAYLISTS_PAGE_SIZE)),
  };
}

export async function getPlaylist(id: string) {
  await requireAuth();
  return prisma.playlist.findUniqueOrThrow({
    where: { id },
    include: {
      responsavel: { select: { name: true } },
      songs: { orderBy: { ordem: "asc" }, include: { song: true } },
    },
  });
}

async function getPlaylistForShare(playlistId: string) {
  const playlist = await prisma.playlist.findUniqueOrThrow({
    where: { id: playlistId },
    include: { songs: { orderBy: { ordem: "asc" }, include: { song: true } } },
  });
  return {
    nome: playlist.nome,
    data: playlist.data,
    songs: playlist.songs.map((ps) => ({
      titulo: ps.song.titulo,
      artista: ps.song.artista,
      linkYoutube: ps.song.linkYoutube,
    })),
  };
}

export async function generateWhatsAppShareText(playlistId: string) {
  await requireAuth();
  const playlist = await getPlaylistForShare(playlistId);
  return {
    mensagem: buildPlaylistMessage(playlist),
    apenasNomes: buildNamesOnly(playlist),
    apenasLinks: buildLinksOnly(playlist),
  };
}
