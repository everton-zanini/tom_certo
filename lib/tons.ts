import { SHARP_SCALE } from "@/lib/cifra/transpose";

export const TONS = [...SHARP_SCALE, ...SHARP_SCALE.map((nota) => `${nota}m`)] as [
  string,
  ...string[],
];
