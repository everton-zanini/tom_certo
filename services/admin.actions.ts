"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function getAdminStats() {
  await requireRole("ADMIN");
  const [songs, playlists, users] = await Promise.all([
    prisma.song.count(),
    prisma.playlist.count(),
    prisma.user.count({ where: { active: true } }),
  ]);
  return { songs, playlists, users };
}
