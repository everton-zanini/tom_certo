"use client";

import { useEffect, type RefObject } from "react";
import { Minus, Pause, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function useTeleprompter(
  containerRef: RefObject<HTMLElement | null>,
  speed: number,
  playing: boolean
) {
  useEffect(() => {
    if (!playing) return;
    const container = containerRef.current;
    if (!container) return;

    let raf: number;
    let last = performance.now();
    let carry = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      carry += (speed * dt) / 1000;
      const whole = Math.trunc(carry);
      if (whole !== 0) {
        container.scrollTop += whole;
        carry -= whole;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [containerRef, speed, playing]);
}

export function TeleprompterControls({
  playing,
  onTogglePlaying,
  speed,
  onSpeedChange,
}: {
  playing: boolean;
  onTogglePlaying: () => void;
  speed: number;
  onSpeedChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-2 py-1">
      <Button variant="ghost" size="icon" className="size-7" onClick={onTogglePlaying} aria-label={playing ? "Pausar" : "Iniciar"}>
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => onSpeedChange(Math.max(10, speed - 10))}
        aria-label="Diminuir velocidade"
      >
        <Minus className="size-4" />
      </Button>
      <span className="min-w-[3ch] text-center text-xs text-muted-foreground">{speed}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => onSpeedChange(Math.min(200, speed + 10))}
        aria-label="Aumentar velocidade"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
