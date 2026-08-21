import { describe, expect, it } from "vitest";
import { parseCifra } from "./parser";
import { semitoneDiff, transposeChord, transposeLines } from "./transpose";

describe("transposeChord", () => {
  it("transposes a simple major chord up", () => {
    expect(transposeChord("G", 2)).toBe("A");
  });

  it("transposes a simple major chord down", () => {
    expect(transposeChord("A", -2)).toBe("G");
  });

  it("wraps around the octave", () => {
    expect(transposeChord("B", 2)).toBe("C#");
    expect(transposeChord("C", -1)).toBe("B");
  });

  it("preserves quality/extension suffixes", () => {
    expect(transposeChord("Em7", 2)).toBe("F#m7");
    expect(transposeChord("F#m", 1)).toBe("Gm");
    expect(transposeChord("Asus4", 2)).toBe("Bsus4");
    expect(transposeChord("Dm7b5", 1)).toBe("D#m7b5");
  });

  it("transposes both root and bass note in slash chords", () => {
    expect(transposeChord("C/G", 2)).toBe("D/A");
  });

  it("prefers flats when the original chord used a flat", () => {
    expect(transposeChord("Bb", 1)).toBe("B");
    expect(transposeChord("Bb", -1)).toBe("A");
    expect(transposeChord("Bb", -2)).toBe("Ab");
  });

  it("leaves non-chord/filler tokens unchanged", () => {
    expect(transposeChord("|", 2)).toBe("|");
    expect(transposeChord("x2", 2)).toBe("x2");
  });

  it("returns the same chord when semitones is 0", () => {
    expect(transposeChord("G", 0)).toBe("G");
  });
});

describe("transposeLines", () => {
  it("transposes every chord in parsed lines while leaving lyrics untouched", () => {
    const raw = "G          D\nGrande é o Senhor";
    const parsed = parseCifra(raw);
    const transposed = transposeLines(parsed, 2);
    expect(transposed[0].lyrics).toBe("Grande é o Senhor");
    expect(transposed[0].chords.map((c) => c.text)).toEqual(["A", "E"]);
    // original column positions are preserved even though chord text length changed
    expect(transposed[0].chords.map((c) => c.column)).toEqual([0, 11]);
  });

  it("is a no-op when semitones is 0", () => {
    const parsed = parseCifra("G   D\nletra");
    expect(transposeLines(parsed, 0)).toBe(parsed);
  });

  it("correctly transposes an instrumental bar line", () => {
    const parsed = parseCifra("| G | D | Em | C |");
    const transposed = transposeLines(parsed, 2);
    expect(transposed[0].chords.map((c) => c.text)).toEqual([
      "|",
      "A",
      "|",
      "E",
      "|",
      "F#m",
      "|",
      "D",
      "|",
    ]);
  });

  it("preserves isObservacao and leaves observation lines untouched", () => {
    const raw = "G   D\nGrande é o Senhor\n> Repetir com calma";
    const parsed = parseCifra(raw);
    const transposed = transposeLines(parsed, 2);
    expect(transposed[1].isObservacao).toBe(true);
    expect(transposed[1].lyrics).toBe("Repetir com calma");
    expect(transposed[1].chords).toEqual([]);
  });
});

describe("semitoneDiff", () => {
  it("computes the distance between two keys", () => {
    expect(semitoneDiff("G", "A")).toBe(2);
    expect(semitoneDiff("C", "B")).toBe(11);
    expect(semitoneDiff("G", "G")).toBe(0);
  });

  it("ignores quality suffixes on the key names", () => {
    expect(semitoneDiff("Am", "Cm")).toBe(3);
  });
});
