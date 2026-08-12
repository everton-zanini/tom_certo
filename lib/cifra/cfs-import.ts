import { inflateSync } from "zlib";
import JSZip from "jszip";
import { isChordLine } from "./parser";

export type ParsedCfsSong = {
  titulo: string;
  artista: string;
  tomOriginal: string;
  cifra: string;
  observacoes: string;
};

export type CfsEntry = { name: string; buffer: Buffer };

const HEADER_KEY = /^\s*(fonte|url|tamanho|velocidade|colunas|tom|afina[cç][aã]o|intro)\s*:\s*(.*)$/i;
const NOTE_PREFIX = /^([A-G](?:#|b)?m?)/;

/** Some .cfs entries have no `tom:` header at all — fall back to the first chord in the body. */
function guessKeyFromBody(cifra: string): string | null {
  for (const line of cifra.split("\n")) {
    if (!isChordLine(line)) continue;
    const token = line.trim().split(/\s+/)[0];
    const match = token.match(NOTE_PREFIX);
    if (match) return match[1];
  }
  return null;
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function splitArtistTitle(line: string): { artista: string; titulo: string } {
  const idx = line.indexOf(" - ");
  if (idx === -1) return { artista: "", titulo: line.trim() };
  return { artista: line.slice(0, idx).trim(), titulo: line.slice(idx + 3).trim() };
}

/** Extracts every `.cfs` entry from an uploaded backup zip, still zlib-compressed. */
export async function extractCfsEntries(zipBuffer: Buffer): Promise<CfsEntry[]> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const entries: CfsEntry[] = [];
  for (const [name, entry] of Object.entries(zip.files)) {
    if (entry.dir || !name.toLowerCase().endsWith(".cfs")) continue;
    entries.push({ name, buffer: await entry.async("nodebuffer") });
  }
  return entries;
}

/** Each .cfs entry is a raw zlib-deflate stream wrapping UTF-8 cifra text. */
export function inflateCfsEntry(buffer: Buffer): string {
  return inflateSync(buffer).toString("utf-8");
}

/**
 * Parses an inflated .cfs cifra: first line "Artista - Título", a metadata
 * header (fonte/url/tamanho/velocidade/colunas/tom/afinação/intro, blank-line
 * delimited from the title and loosely from the body), then the chord-over-
 * lyric body. Returns an error instead of throwing so a bad file in a batch
 * doesn't abort the rest of the import.
 */
export function parseCfsText(raw: string, fallbackFilename: string): ParsedCfsSong | { error: string } {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  if (!lines[0]?.trim()) return { error: "arquivo vazio" };

  const { artista, titulo: tituloFromHeader } = splitArtistTitle(lines[0]);
  const fallbackTitulo = fallbackFilename.replace(/\.[^.]+$/, "");

  const metadata: Record<string, string> = {};
  let lastKey: string | null = null;
  let bodyStart = lines.length;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(HEADER_KEY);
    if (match) {
      const key = stripAccents(match[1].toLowerCase());
      metadata[key] = match[2].trim();
      lastKey = key;
      continue;
    }
    if (!line.trim()) {
      const next = lines[i + 1];
      if (next !== undefined && HEADER_KEY.test(next)) continue;
      bodyStart = i + 1;
      break;
    }
    if (lastKey === "intro") {
      metadata.intro = `${metadata.intro}\n${line}`;
      continue;
    }
    bodyStart = i;
    break;
  }

  const cifra = lines
    .slice(bodyStart)
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
  if (!cifra.trim()) return { error: "cifra vazia" };

  const tomRaw = metadata.tom ?? "";
  let tomOriginal: string;
  let tomExtra = "";
  let tomGuessed = false;

  if (tomRaw) {
    const tomMatch = tomRaw.match(NOTE_PREFIX);
    if (!tomMatch) return { error: `tom não reconhecido: "${tomRaw}"` };
    tomOriginal = tomMatch[1];
    tomExtra = tomRaw.slice(tomMatch[0].length).trim();
  } else {
    const guessed = guessKeyFromBody(cifra);
    if (!guessed) return { error: "tom não encontrado no cabeçalho nem no corpo da cifra" };
    tomOriginal = guessed;
    tomGuessed = true;
  }

  const observacoes = [
    metadata.fonte && `Fonte: ${metadata.fonte}`,
    metadata.url && `URL: ${metadata.url}`,
    tomExtra && `Tom: ${tomRaw}`,
    metadata.afinacao && `Afinação: ${metadata.afinacao}`,
    metadata.intro && `Intro: ${metadata.intro}`,
    tomGuessed && "Tom detectado automaticamente a partir do primeiro acorde da cifra — confira antes de usar.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    titulo: tituloFromHeader || fallbackTitulo,
    artista,
    tomOriginal,
    cifra,
    observacoes,
  };
}
