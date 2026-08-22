import { NOTA_CORES, type NotaCorValue } from "@/lib/nota-colors";

/** Global (not per-song) chord text color preference, persisted in the browser. */
export const CHORD_COLOR_STORAGE_KEY = "tomcerto:chordColor";

export function getChordColorClass(value: NotaCorValue | null): string {
  const cor = value ? NOTA_CORES.find((c) => c.value === value) : null;
  return cor ? cor.text : "text-primary";
}
