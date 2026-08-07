"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authz";

export async function toggleFavorite(songId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_songId: { userId, songId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { userId_songId: { userId, songId } } });
    revalidatePath("/songs");
    return { favorited: false };
  }

  await prisma.favorite.create({ data: { userId, songId } });
  revalidatePath("/songs");
  return { favorited: true };
}

export async function isFavorited(songId: string) {
  const session = await requireAuth();
  const favorite = await prisma.favorite.findUnique({
    where: { userId_songId: { userId: session.user.id, songId } },
  });
  return favorite !== null;
}

export async function listFavoriteSongIds() {
  const session = await requireAuth();
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { songId: true },
  });
  return favorites.map((f) => f.songId);
}
