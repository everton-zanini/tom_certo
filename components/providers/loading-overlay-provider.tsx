"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type LoadingOverlayContextValue = {
  show: (label?: string) => void;
  hide: () => void;
  runWithOverlay: <T>(fn: () => Promise<T>, label?: string) => Promise<T>;
};

const LoadingOverlayContext = createContext<LoadingOverlayContextValue | null>(null);

export function LoadingOverlayProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const [label, setLabel] = useState<string | undefined>(undefined);

  const show = useCallback((nextLabel?: string) => {
    setLabel(nextLabel);
    setCount((c) => c + 1);
  }, []);

  const hide = useCallback(() => {
    setCount((c) => Math.max(0, c - 1));
  }, []);

  const runWithOverlay = useCallback(
    async <T,>(fn: () => Promise<T>, label?: string) => {
      show(label);
      try {
        return await fn();
      } finally {
        hide();
      }
    },
    [show, hide]
  );

  return (
    <LoadingOverlayContext.Provider value={{ show, hide, runWithOverlay }}>
      {children}
      {count > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-xs"
        >
          <div className="flex flex-col items-center gap-3 rounded-xl bg-popover p-6 text-sm text-popover-foreground ring-1 ring-foreground/10">
            <Loader2 className="size-6 animate-spin" />
            <span>{label ?? "Carregando..."}</span>
          </div>
        </div>
      )}
    </LoadingOverlayContext.Provider>
  );
}

export function useLoadingOverlay() {
  const ctx = useContext(LoadingOverlayContext);
  if (!ctx) throw new Error("useLoadingOverlay must be used within LoadingOverlayProvider");
  return ctx;
}
