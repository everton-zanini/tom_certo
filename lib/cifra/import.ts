import { isChordLine } from "./parser";

type MetadataKey = "artista" | "titulo" | "tomOriginal";

const METADATA_PATTERNS: Array<{ key: MetadataKey; regex: RegExp }> = [
  { key: "artista", regex: /^artista:\s*(.+)$/i },
  { key: "titulo", regex: /^m[uú]sica:\s*(.+)$/i },
  { key: "tomOriginal", regex: /^tom:\s*([A-G](?:#|b)?m?)\b/i },
];

export type ImportedSong = {
  titulo: string;
  artista: string;
  tomOriginal: string;
  cifra: string;
};

/**
 * Parses a .txt cifra export (metadata header like "Artista:"/"Música:"/"Tom:"
 * followed by a chord-over-lyric body already compatible with parseCifra) into
 * the fields SongForm expects. Only the labeled header lines are stripped from
 * the body; everything else is left untouched.
 */
export function parseImportedSongText(raw: string, fallbackTitulo = ""): ImportedSong {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  let headerEnd = lines.length;
  for (let i = 0; i < lines.length; i++) {
    if (isChordLine(lines[i])) {
      headerEnd = i;
      break;
    }
  }

  const metadata: Partial<Record<MetadataKey, string>> = {};
  const bodyLines: string[] = [];

  lines.forEach((line, i) => {
    if (i < headerEnd) {
      const trimmed = line.trim();
      const match = METADATA_PATTERNS.find((p) => p.regex.test(trimmed));
      if (match) {
        const result = trimmed.match(match.regex);
        metadata[match.key] = result![1].trim();
        return;
      }
    }
    bodyLines.push(line);
  });

  const cifra = bodyLines.join("\n").replace(/^\n+/, "").replace(/\n+$/, "");

  return {
    titulo: metadata.titulo || fallbackTitulo,
    artista: metadata.artista || "",
    tomOriginal: metadata.tomOriginal || "",
    cifra,
  };
}
