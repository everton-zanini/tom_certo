import { isChordToken, type ParsedLine } from "./parser";

const SHARP_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_SCALE = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const NOTE_TO_INDEX: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const CHORD_PARTS = /^([A-G](?:#|b)?)([^/]*)(?:\/([A-G](?:#|b)?))?$/;

function shiftNote(note: string, semitones: number, preferFlat: boolean): string {
  const index = NOTE_TO_INDEX[note];
  if (index === undefined) return note;
  const shifted = ((index + semitones) % 12 + 12) % 12;
  return (preferFlat ? FLAT_SCALE : SHARP_SCALE)[shifted];
}

/** Transposes a single chord token (e.g. "Em7", "C/G", "F#m", "Asus4") by N semitones. */
export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0 || !isChordToken(chord)) return chord;
  const match = chord.match(CHORD_PARTS);
  if (!match) return chord;
  const [, root, quality, bass] = match;
  const preferFlat = root.includes("b");
  const newRoot = shiftNote(root, semitones, preferFlat);
  const newBass = bass ? shiftNote(bass, semitones, bass.includes("b")) : undefined;
  return newRoot + quality + (newBass ? `/${newBass}` : "");
}

/** Transposes every chord token across parsed lines, leaving lyrics and filler tokens untouched. */
export function transposeLines(lines: ParsedLine[], semitones: number): ParsedLine[] {
  if (semitones === 0) return lines;
  return lines.map((line) => ({
    lyrics: line.lyrics,
    chords: line.chords.map((chord) => ({
      ...chord,
      text: transposeChord(chord.text, semitones),
    })),
  }));
}

function rootOf(tone: string): string | undefined {
  const match = tone.trim().match(/^[A-G](#|b)?/);
  return match?.[0];
}

/** Number of semitones between two key names (e.g. "G" -> "A" is 2), ignoring quality suffixes. */
export function semitoneDiff(from: string, to: string): number {
  const a = rootOf(from);
  const b = rootOf(to);
  if (!a || !b) return 0;
  const ai = NOTE_TO_INDEX[a];
  const bi = NOTE_TO_INDEX[b];
  if (ai === undefined || bi === undefined) return 0;
  return ((bi - ai) % 12 + 12) % 12;
}
