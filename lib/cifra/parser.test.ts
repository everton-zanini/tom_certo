import { describe, expect, it } from "vitest";
import { extractObservacao, isChordLine, isChordToken, parseCifra } from "./parser";

describe("isChordToken", () => {
  it.each([
    "G",
    "D",
    "Em",
    "Em7",
    "C/G",
    "F#m",
    "Bb",
    "Asus4",
    "Dm7b5",
    "G/B",
    "A#m7",
  ])("recognizes %s as a chord", (token) => {
    expect(isChordToken(token)).toBe(true);
  });

  it.each(["Grande", "é", "o", "Senhor", "|", "x2", "%"])(
    "does not recognize %s as a chord",
    (token) => {
      expect(isChordToken(token)).toBe(false);
    }
  );
});

describe("isChordLine", () => {
  it("recognizes a pure chord line", () => {
    expect(isChordLine("G          D")).toBe(true);
  });

  it("recognizes a chord line with bar/filler tokens", () => {
    expect(isChordLine("| G | D | Em | C |")).toBe(true);
  });

  it("rejects a lyric line", () => {
    expect(isChordLine("Grande é o Senhor")).toBe(false);
  });

  it("rejects a blank line", () => {
    expect(isChordLine("   ")).toBe(false);
  });
});

describe("parseCifra", () => {
  it("pairs a chord line with the lyric line below it and preserves columns", () => {
    const raw = "G          D\nGrande é o Senhor";
    const parsed = parseCifra(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].lyrics).toBe("Grande é o Senhor");
    expect(parsed[0].chords).toEqual([
      { text: "G", column: 0 },
      { text: "D", column: 11 },
    ]);
  });

  it("handles a full example with multiple sections and blank lines", () => {
    const raw = ["G          D", "Grande é o Senhor", "", "Em         C", "Digno de louvor"].join(
      "\n"
    );
    const parsed = parseCifra(raw);
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toEqual({
      lyrics: "Grande é o Senhor",
      chords: [
        { text: "G", column: 0 },
        { text: "D", column: 11 },
      ],
    });
    expect(parsed[1]).toEqual({ lyrics: "", chords: [] });
    expect(parsed[2].lyrics).toBe("Digno de louvor");
  });

  it("treats a chord-only line with no lyric below as instrumental (empty lyrics)", () => {
    const raw = "| G | D | Em | C |";
    const parsed = parseCifra(raw);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].lyrics).toBe("");
    expect(parsed[0].chords.map((c) => c.text)).toEqual(["|", "G", "|", "D", "|", "Em", "|", "C", "|"]);
  });

  it("handles two consecutive chord lines without swallowing the second as lyrics", () => {
    const raw = "G   D\nEm   C\nletra aqui";
    const parsed = parseCifra(raw);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].lyrics).toBe("");
    expect(parsed[1].lyrics).toBe("letra aqui");
  });

  it("passes plain lyric-only lines through unchanged", () => {
    const raw = "Só letra, sem cifra";
    const parsed = parseCifra(raw);
    expect(parsed).toEqual([{ lyrics: "Só letra, sem cifra", chords: [] }]);
  });

  it("recognizes a standalone observation line between lyric lines", () => {
    const raw = "Grande é o Senhor\n> Repetir com calma\nDigno de louvor";
    const parsed = parseCifra(raw);
    expect(parsed).toHaveLength(3);
    expect(parsed[1]).toEqual({ lyrics: "Repetir com calma", chords: [], isObservacao: true });
    expect(parsed[0].isObservacao).toBeUndefined();
    expect(parsed[2].isObservacao).toBeUndefined();
  });

  it("does not swallow an observation line as the lyric under a chord line", () => {
    const raw = "G          D\n> Repetir com calma";
    const parsed = parseCifra(raw);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({ lyrics: "", chords: [{ text: "G", column: 0 }, { text: "D", column: 11 }] });
    expect(parsed[1]).toEqual({ lyrics: "Repetir com calma", chords: [], isObservacao: true });
  });

  it("recognizes an observation line at the very start or end of the text", () => {
    const raw = "> Entrada só com violão\nGrande é o Senhor\n> Fim";
    const parsed = parseCifra(raw);
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toEqual({ lyrics: "Entrada só com violão", chords: [], isObservacao: true });
    expect(parsed[2]).toEqual({ lyrics: "Fim", chords: [], isObservacao: true });
  });

  it("handles a bare '>' with no text after it", () => {
    const raw = ">";
    const parsed = parseCifra(raw);
    expect(parsed).toEqual([{ lyrics: "", chords: [], isObservacao: true }]);
  });
});

describe("extractObservacao", () => {
  it("extracts the text after '>' trimmed", () => {
    expect(extractObservacao("> Repetir com calma")).toBe("Repetir com calma");
    expect(extractObservacao("  >Repetir com calma  ")).toBe("Repetir com calma");
  });

  it("returns null for lines that don't start with '>'", () => {
    expect(extractObservacao("Grande é o Senhor")).toBeNull();
    expect(extractObservacao("G   D")).toBeNull();
  });
});
