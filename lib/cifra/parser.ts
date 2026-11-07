export type ChordToken = { text: string; column: number };
export type BlockKind = "pre-refrao" | "refrao" | "verso" | "ponte" | "interludio";
export type ParsedLine = {
  lyrics: string;
  chords: ChordToken[];
  isObservacao?: boolean;
  /** Section the line belongs to, set by the block delimiters (see BLOCK_DEFS). */
  block?: BlockKind;
  /** First line of its block; the renderer shows the block title here. */
  blockStart?: boolean;
};

export const BLOCK_DEFS: readonly { kind: BlockKind; titulo: string; open: string; close: string }[] = [
  { kind: "pre-refrao", titulo: "Pré-Refrão", open: "/*", close: "*/" },
  { kind: "refrao", titulo: "Refrão", open: "/#", close: "#/" },
  { kind: "verso", titulo: "Verso", open: "/&", close: "&/" },
  { kind: "ponte", titulo: "Ponte", open: "/$", close: "$/" },
  { kind: "interludio", titulo: "Interlúdio", open: "/@", close: "@/" },
];

const CHORD_QUALITY =
  "7M|M7|M9|M|maj7|maj9|maj|min7|min9|min|dim7b5|dim7|dim|aug|sus2|sus4|sus|add9|add11|m7b5|m7b9|m9|m7|m6|m11|m13|m|4|6|7|9|11|13|2";

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

/** Lines starting with ">" are musician observations/instructions, not sung lyrics. */
export function extractObservacao(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith(">")) return null;
  return trimmed.slice(1).trim();
}

type SourceLine = { text: string; block?: BlockKind; blockStart?: boolean };

/**
 * Removes block delimiters and tags each remaining line with its block.
 * Inside an open block only its own closer counts; an unclosed block runs to the end.
 * Lines left empty by delimiter removal are dropped.
 */
function extractBlocks(lines: string[]): SourceLine[] {
  const result: SourceLine[] = [];
  let open: (typeof BLOCK_DEFS)[number] | null = null;
  let pendingStart = false;

  for (const line of lines) {
    const startedInBlock = open;
    let text = "";
    let hadDelimiter = false;
    let touchedBlock = open !== null;
    let kind = open?.kind;
    let i = 0;
    while (i < line.length) {
      if (open === null) {
        const def = BLOCK_DEFS.find((d) => line.startsWith(d.open, i));
        if (def) {
          open = def;
          kind = kind ?? def.kind;
          touchedBlock = true;
          pendingStart = true;
          hadDelimiter = true;
          i += def.open.length;
          if (text.trim() === "" && line[i] === " ") i += 1;
          continue;
        }
      } else if (line.startsWith(open.close, i)) {
        open = null;
        hadDelimiter = true;
        i += 2;
        continue;
      }
      text += line[i];
      i += 1;
    }

    if (hadDelimiter) text = text.trimEnd();
    if (hadDelimiter && text.trim() === "") {
      if (open === null && startedInBlock === null) pendingStart = false;
      continue;
    }

    const entry: SourceLine = { text };
    if (touchedBlock && kind) {
      entry.block = kind;
      if (pendingStart) {
        entry.blockStart = true;
        pendingStart = false;
      }
    }
    result.push(entry);
  }

  return result;
}

/**
 * Parses raw monospaced cifra text (chord line directly above its lyric line,
 * as pasted from sites like Cifra Club) into a line-by-line structure that
 * preserves each chord's original column so it can be rendered/repositioned
 * without depending on padding with spaces.
 */
export function parseCifra(raw: string): ParsedLine[] {
  // Zero-width chars come along when pasting from some sites; JS \s/trim() don't strip them,
  // which would make a chord token like "​D" fail to match.
  const normalized = raw.replace(/[​-‍﻿]/g, "").replace(/\r\n/g, "\n");
  const lines = extractBlocks(normalized.split("\n"));
  const result: ParsedLine[] = [];

  let i = 0;
  while (i < lines.length) {
    const { text: line, block, blockStart } = lines[i];
    const observacao = extractObservacao(line);
    if (observacao !== null) {
      result.push({ lyrics: observacao, chords: [], isObservacao: true, ...tag(block, blockStart) });
      i += 1;
      continue;
    }
    if (isChordLine(line)) {
      const chords = extractTokensWithColumns(line);
      const next = lines[i + 1];
      if (next !== undefined && !isChordLine(next.text) && extractObservacao(next.text) === null) {
        result.push({
          lyrics: next.text,
          chords,
          ...tag(block ?? next.block, blockStart || (block === undefined && next.blockStart)),
        });
        i += 2;
      } else {
        result.push({ lyrics: "", chords, ...tag(block, blockStart) });
        i += 1;
      }
    } else {
      result.push({ lyrics: line, chords: [], ...tag(block, blockStart) });
      i += 1;
    }
  }

  return result;
}

function tag(block?: BlockKind, blockStart?: boolean): Pick<ParsedLine, "block" | "blockStart"> {
  if (!block) return {};
  return blockStart ? { block, blockStart: true } : { block };
}
