import { parseCifra } from "@/lib/cifra/parser";
import { semitoneDiff, transposeLines } from "@/lib/cifra/transpose";

type CifraSong = { cifra: string; tomOriginal: string; tomAtual: string };

/** Aplica o tom do repertório (se houver) e devolve a música com as linhas já transpostas. */
export function buildDisplayLines<T extends CifraSong>(found: T, tomOverride?: string | null) {
  const song = tomOverride ? { ...found, tomAtual: tomOverride } : found;
  return { song, lines: transposeLines(parseCifra(song.cifra), semitoneDiff(song.tomOriginal, song.tomAtual)) };
}
