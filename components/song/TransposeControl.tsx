"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TransposeControl({
  currentKey,
  onChange,
}: {
  currentKey: string;
  onChange: (delta: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-2 py-1">
      <Button variant="ghost" size="icon" className="size-7" onClick={() => onChange(-1)} aria-label="Diminuir um tom">
        <Minus className="size-4" />
      </Button>
      <span className="min-w-[3ch] text-center text-sm font-medium">{currentKey}</span>
      <Button variant="ghost" size="icon" className="size-7" onClick={() => onChange(1)} aria-label="Aumentar um tom">
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
