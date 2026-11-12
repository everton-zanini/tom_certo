import { describe, expect, it } from "vitest";
import { extractObservacao, extractObservacaoSecundaria, isChordLine, isChordToken, parseCifra } from "./parser";

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
    "F#4",
    "G4",
    "G7M",
    "BM",
    "CM7",
    "F7M(2)/C",
    "G5(9/11)",
    "B7(b9)",
    "F#7(13-)",
    "Em7(11)/B",
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
  it("recognizes a chord line containing a 4 chord", () => {
    expect(isChordLine("F# F#4 F#")).toBe(true);
  });

  it("recognizes a chord line with 7M and M qualities", () => {
    expect(isChordLine("G7M BM F#m7")).toBe(true);
    expect(isChordLine("G7M   A   Bm   F#m7")).toBe(true);
  });

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

  it("recognizes a secondary observation line starting with '<'", () => {
    const parsed = parseCifra("Grande é o Senhor\n< Só teclado\n> Repetir");
    expect(parsed[1]).toEqual({
      lyrics: "Só teclado",
      chords: [],
      isObservacao: true,
      observacaoSecundaria: true,
    });
    expect(parsed[2]).toEqual({ lyrics: "Repetir", chords: [], isObservacao: true });
  });

  it("does not swallow a secondary observation under a chord line", () => {
    const parsed = parseCifra("G          D\n< Só teclado");
    expect(parsed).toHaveLength(2);
    expect(parsed[0].lyrics).toBe("");
    expect(parsed[1].observacaoSecundaria).toBe(true);
  });

  it("tags a secondary observation inside a block", () => {
    const parsed = parseCifra("/#\n< Só teclado\n#/");
    expect(parsed).toEqual([
      {
        lyrics: "Só teclado",
        chords: [],
        isObservacao: true,
        observacaoSecundaria: true,
        block: "refrao",
        blockStart: true,
      },
    ]);
  });
});

describe("extractObservacaoSecundaria", () => {
  it("extracts the text after '<' trimmed", () => {
    expect(extractObservacaoSecundaria("< Só teclado")).toBe("Só teclado");
    expect(extractObservacaoSecundaria("  <Só teclado  ")).toBe("Só teclado");
  });

  it("returns null for lines that don't start with '<'", () => {
    expect(extractObservacaoSecundaria("> Repetir")).toBeNull();
    expect(extractObservacaoSecundaria("G   D")).toBeNull();
  });
});

describe("parseCifra zero-width chars", () => {
  it("recognizes chord lines prefixed with zero-width spaces", () => {
    const parsed = parseCifra("​D\n​Eu sei\n​E      D/F#\n​Certamente");
    expect(parsed.map((l) => l.chords.map((c) => c.text))).toEqual([["D"], ["E", "D/F#"]]);
    expect(parsed[0].lyrics).toBe("Eu sei");
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

describe("parseCifra blocks", () => {
  it.each([
    ["/*", "*/", "pre-refrao"],
    ["/#", "#/", "refrao"],
    ["/&", "&/", "verso"],
    ["/$", "$/", "ponte"],
    ["/@", "@/", "interludio"],
  ])("tags lines between %s and %s as %s", (open, close, kind) => {
    const parsed = parseCifra(`antes\n${open}\nlinha 1\nlinha 2\n${close}\ndepois`);
    expect(parsed).toEqual([
      { lyrics: "antes", chords: [] },
      { lyrics: "linha 1", chords: [], block: kind, blockStart: true },
      { lyrics: "linha 2", chords: [], block: kind },
      { lyrics: "depois", chords: [] },
    ]);
  });

  it("accepts delimiters on the same line as the text", () => {
    const parsed = parseCifra("/# Aleluia */ nao fecha #/\nfora");
    expect(parsed).toEqual([
      { lyrics: "Aleluia */ nao fecha", chords: [], block: "refrao", blockStart: true },
      { lyrics: "fora", chords: [] },
    ]);
  });

  it("keeps a chord line paired with its lyric inside a block", () => {
    const parsed = parseCifra("/#\nG   D\nGrande é o Senhor\n#/");
    expect(parsed).toEqual([
      {
        lyrics: "Grande é o Senhor",
        chords: [{ text: "G", column: 0 }, { text: "D", column: 4 }],
        block: "refrao",
        blockStart: true,
      },
    ]);
  });

  it("runs an unclosed block to the end of the text", () => {
    const parsed = parseCifra("/&\num\ndois");
    expect(parsed.map((l) => l.block)).toEqual(["verso", "verso"]);
  });

  it("ignores delimiters of other kinds inside an open block", () => {
    const parsed = parseCifra("/#\num /& dois\n#/");
    expect(parsed).toEqual([
      { lyrics: "um /& dois", chords: [], block: "refrao", blockStart: true },
    ]);
  });

  it("drops lines left empty by delimiters and keeps blank lines inside a block", () => {
    const parsed = parseCifra("/@\num\n\ndois\n@/");
    expect(parsed).toEqual([
      { lyrics: "um", chords: [], block: "interludio", blockStart: true },
      { lyrics: "", chords: [], block: "interludio" },
      { lyrics: "dois", chords: [], block: "interludio" },
    ]);
  });

  it("keeps observations inside a block", () => {
    const parsed = parseCifra("/*\n> devagar\n*/");
    expect(parsed).toEqual([
      { lyrics: "devagar", chords: [], isObservacao: true, block: "pre-refrao", blockStart: true },
    ]);
  });
});
