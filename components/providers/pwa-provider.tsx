"use client";

import { useEffect, useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true;

export function PwaProvider() {
  const online = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => console.error("Falha ao registrar o service worker", error));
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="pt-safe fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-stage px-4 py-1.5 text-sm font-medium text-stage-foreground"
    >
      <WifiOff className="size-4" />
      Sem conexão. Reconecte para carregar músicas e repertórios.
    </div>
  );
}
