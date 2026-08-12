import { deflateSync } from "zlib";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { extractCfsEntries, inflateCfsEntry, parseCfsText } from "./cfs-import";

const A_VITORIA = `Adhemar de Campos - A Vitória
fonte: Fonte Externa
url: https://www.cifraclub.com.br/adhemar-de-campos/a-vitoria/
tamanho: 14.0
velocidade: 0
colunas: 1

tom: Eb
C           Am                F
A vitória é daquele que o contemplar
    F/G              C    B7/#9 E7/#9
Ao Cordeiro Cristo Leão da tribo de Judá
`;

const DIZIMOS_COM_INTRO = `Adhemar de Campos - Dízimos e Ofertas
fonte: Fonte Externa
url: https://www.cifraclub.com.br/adhemar-de-campos/dizimos-e-ofertas/
tamanho: 14.0
velocidade: 0
colunas: 1

tom: E (forma dos acordes no tom de F)
Afinação: Eb Ab Db Gb Bb Eb
Intro: Bb7M  A7  Dm7  G  G7
       Bb7M  A7  D7M

Refrão:
E                Amaj7
Traz os teus dízimos
`;

const AUTORIA_PROPRIA = `Adhemar de Campos - Amigo de Deus
fonte: Minha autoria
url:
tamanho: 14.0
velocidade: 50
colunas: 1

tom: G
G           D
Amigo de Deus
`;

describe("parseCfsText", () => {
  it("parses artist, title, key and body from a simple entry", () => {
    const result = parseCfsText(A_VITORIA, "fallback.cfs");
    expect(result).not.toHaveProperty("error");
    const song = result as Exclude<typeof result, { error: string }>;
    expect(song.artista).toBe("Adhemar de Campos");
    expect(song.titulo).toBe("A Vitória");
    expect(song.tomOriginal).toBe("Eb");
    expect(song.cifra).toContain("A vitória é daquele que o contemplar");
    expect(song.observacoes).toContain("Fonte: Fonte Externa");
    expect(song.observacoes).toContain("URL: https://www.cifraclub.com.br/adhemar-de-campos/a-vitoria/");
  });

  it("extracts the leading chord from a 'tom' with a parenthetical note, keeping the note in observacoes", () => {
    const result = parseCfsText(DIZIMOS_COM_INTRO, "fallback.cfs");
    expect(result).not.toHaveProperty("error");
    const song = result as Exclude<typeof result, { error: string }>;
    expect(song.tomOriginal).toBe("E");
    expect(song.observacoes).toContain("Tom: E (forma dos acordes no tom de F)");
    expect(song.observacoes).toContain("Afinação: Eb Ab Db Gb Bb Eb");
    expect(song.observacoes).toContain("Intro: Bb7M  A7  Dm7  G  G7\n       Bb7M  A7  D7M");
    expect(song.cifra.startsWith("Refrão:")).toBe(true);
  });

  it("handles a self-authored entry with an empty url", () => {
    const result = parseCfsText(AUTORIA_PROPRIA, "fallback.cfs");
    expect(result).not.toHaveProperty("error");
    const song = result as Exclude<typeof result, { error: string }>;
    expect(song.observacoes).toContain("Fonte: Minha autoria");
    expect(song.observacoes).not.toContain("URL:");
  });

  it("returns an error when the tom is not a recognizable chord", () => {
    const raw = A_VITORIA.replace("tom: Eb", "tom: inválido");
    const result = parseCfsText(raw, "fallback.cfs");
    expect(result).toHaveProperty("error");
  });

  it("returns an error for an empty file", () => {
    expect(parseCfsText("", "fallback.cfs")).toHaveProperty("error");
  });
});

describe("inflateCfsEntry", () => {
  it("round-trips a zlib-deflated cifra text", () => {
    const compressed = deflateSync(Buffer.from(A_VITORIA, "utf-8"));
    expect(inflateCfsEntry(compressed)).toBe(A_VITORIA);
  });
});

describe("extractCfsEntries", () => {
  it("reads only .cfs entries out of a zip buffer", async () => {
    const zip = new JSZip();
    zip.file("Adhemar de Campos - A Vitória - Fonte Externa - x.cfs", deflateSync(Buffer.from(A_VITORIA)));
    zip.file("readme.txt", "not a cifra");
    const buffer = await zip.generateAsync({ type: "nodebuffer" });

    const entries = await extractCfsEntries(buffer);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toContain("A Vitória");
    expect(inflateCfsEntry(entries[0].buffer)).toBe(A_VITORIA);
  });
});
