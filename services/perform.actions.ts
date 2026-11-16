"use server";

import { getPlaylist } from "@/services/playlist.actions";
import { listFavoriteSongIds } from "@/services/favorite.actions";
import { buildDisplayLines } from "@/lib/cifra/display";

/**
 * Carrega o repertório inteiro (todas as músicas já transpostas + favoritos) numa
 * única chamada ao abrir o modo apresentação. Anterior/Próxima passam a ser só
 * troca de estado no cliente: sem rede, sem espera e sem desmontar o viewer
 * (desmontar sairia da tela cheia).
 */
export async function getPerformPlaylistData(playlistId: string) {
  const [playlist, favoriteIds] = await Promise.all([getPlaylist(playlistId), listFavoriteSongIds()]);
  const favorites = new Set(favoriteIds);

  return playlist.songs.map((ps) => {
    const { song, lines } = buildDisplayLines(ps.song, ps.tom);
    return {
      song: {
        id: song.id,
        titulo: song.titulo,
        artista: song.artista,
        tomAtual: song.tomAtual,
        linkYoutube: song.linkYoutube,
      },
      lines,
      favorited: favorites.has(song.id),
    };
  });
}

export type PerformSong = Awaited<ReturnType<typeof getPerformPlaylistData>>[number];
