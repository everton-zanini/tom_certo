export const NOTA_CORES = [
  {
    value: "VERMELHO",
    label: "Vermelho",
    dot: "bg-red-500",
    border: "border-l-red-500",
    text: "text-red-700 dark:text-red-400",
  },
  {
    value: "AMARELO",
    label: "Amarelo",
    dot: "bg-yellow-500",
    border: "border-l-yellow-500",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  {
    value: "VERDE",
    label: "Verde",
    dot: "bg-green-500",
    border: "border-l-green-500",
    text: "text-green-700 dark:text-green-400",
  },
  {
    value: "AZUL",
    label: "Azul",
    dot: "bg-blue-500",
    border: "border-l-blue-500",
    text: "text-blue-700 dark:text-blue-400",
  },
  {
    value: "LARANJA",
    label: "Laranja",
    dot: "bg-orange-500",
    border: "border-l-orange-500",
    text: "text-orange-700 dark:text-orange-400",
  },
  {
    value: "ROXO",
    label: "Roxo",
    dot: "bg-purple-500",
    border: "border-l-purple-500",
    text: "text-purple-700 dark:text-purple-400",
  },
] as const;

export type NotaCorValue = (typeof NOTA_CORES)[number]["value"];

export function getNotaCor(value: string | null | undefined) {
  return NOTA_CORES.find((c) => c.value === value) ?? null;
}
