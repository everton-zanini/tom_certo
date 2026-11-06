"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TONS } from "@/lib/tons";

const NONE = "none";

const ITEMS = [
  { value: NONE, label: "Não informado" },
  ...TONS.map((tom) => ({ value: tom, label: tom })),
];

export function TomSelect({
  id,
  value,
  onChange,
  disabled,
}: {
  id?: string;
  value: string | null | undefined;
  onChange: (tom: string | null) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      items={ITEMS}
      value={value ?? NONE}
      disabled={disabled}
      onValueChange={(next) => onChange(!next || next === NONE ? null : next)}
    >
      <SelectTrigger id={id} className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
