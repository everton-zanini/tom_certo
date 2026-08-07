export type ShareSong = { titulo: string; artista: string | null; linkYoutube: string | null };
export type SharePlaylist = { nome: string; data: Date; songs: ShareSong[] };

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function buildPlaylistMessage(playlist: SharePlaylist): string {
  const lines = [
    `🎵 *${playlist.nome}* — ${formatDate(playlist.data)}`,
    "",
    ...playlist.songs.map((song, i) => {
      const line = `${i + 1}. ${song.titulo}${song.artista ? ` - ${song.artista}` : ""}`;
      return song.linkYoutube ? `${line}\n   ${song.linkYoutube}` : line;
    }),
  ];
  return lines.join("\n");
}

export function buildNamesOnly(playlist: SharePlaylist): string {
  return playlist.songs
    .map((song, i) => `${i + 1}. ${song.titulo}${song.artista ? ` - ${song.artista}` : ""}`)
    .join("\n");
}

export function buildLinksOnly(playlist: SharePlaylist): string {
  return playlist.songs
    .filter((song) => song.linkYoutube)
    .map((song) => song.linkYoutube)
    .join("\n");
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
