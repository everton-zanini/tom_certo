export type ChordToken = { text: string; column: number };
export type ParsedLine = { lyrics: string; chords: ChordToken[] };

const CHORD_QUALITY =
  "maj7|maj9|maj|min7|min9|min|dim7b5|dim7|dim|aug|sus2|sus4|sus|add9|add11|m7b5|m7b9|m9|m7|m6|m11|m13|m|6|7|9|11|13|2";

const CHORD_TOKEN = new RegExp(
  `^[A-G](#|b)?(${CHORD_QUALITY})?(\\/[A-G](#|b)?)?$`
);

const FILLER_TOKEN = /^(\|+|-+|x\d+|\(x?\d+\)|%|n\.?c\.?\.?)$/i;

export function isChordToken(token: string): boolean {
  return CHORD_TOKEN.test(token);
}

function isFillerToken(token: string): boolean {
  return FILLER_TOKEN.test(token);
}

export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const tokens = trimmed.split(/\s+/);
  let chordCount = 0;
  for (const token of tokens) {
    if (isChordToken(token)) {
      chordCount++;
      continue;
    }
    if (isFillerToken(token)) continue;
    return false;
  }
  return chordCount > 0;
}

function extractTokensWithColumns(line: string): ChordToken[] {
  return [...line.matchAll(/\S+/g)].map((m) => ({ text: m[0], column: m.index }));
}

/**
 * Parses raw monospaced cifra text (chord line directly above its lyric line,
 * as pasted from sites like Cifra Club) into a line-by-line structure that
 * preserves each chord's original column so it can be rendered/repositioned
 * without depending on padding with spaces.
 */
export function parseCifra(raw: string): ParsedLine[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const result: ParsedLine[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isChordLine(line)) {
      const chords = extractTokensWithColumns(line);
      const next = lines[i + 1];
      if (next !== undefined && !isChordLine(next)) {
        result.push({ lyrics: next, chords });
        i += 2;
      } else {
        result.push({ lyrics: "", chords });
        i += 1;
      }
    } else {
      result.push({ lyrics: line, chords: [] });
      i += 1;
    }
  }

  return result;
}
