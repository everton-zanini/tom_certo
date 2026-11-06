import { describe, expect, it } from "vitest";
import { isChordToken } from "@/lib/cifra/parser";
import { TONS } from "./tons";

describe("TONS", () => {
  it("has the 12 major and 12 minor keys without duplicates", () => {
    expect(TONS).toHaveLength(24);
    expect(new Set(TONS).size).toBe(24);
  });

  it("only contains valid chord tokens", () => {
    for (const tom of TONS) expect(isChordToken(tom)).toBe(true);
  });
});
