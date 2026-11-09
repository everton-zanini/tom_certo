"use server";

import { getPlaylist } from "@/services/playlist.actions";
import { getSongDisplayLines } from "@/services/song.actions";
import { isFavorited } from "@/services/favorite.actions";

/**
 * Combined fetch for the fullscreen performance view: called both for the initial
 * page load and from the client when the user jumps to the previous/next song,
 * so that navigating never unmounts the viewer (which would kick it out of fullscreen).
 */
export async function getPerformSongData(playlistId: string, songId: string) {
  const playlist = await getPlaylist(playlistId);
  const index = playlist.songs.findIndex((ps) => ps.songId === songId);
  const [{ song, lines }, favorited] = await Promise.all([
    getSongDisplayLines(songId, playlist.songs[index]?.tom),
    isFavorited(songId),
  ]);
  const prevSongId = index > 0 ? playlist.songs[index - 1].songId : null;
  const nextSongId = index >= 0 && index < playlist.songs.length - 1 ? playlist.songs[index + 1].songId : null;

  return { song, lines, favorited, prevSongId, nextSongId };
}
