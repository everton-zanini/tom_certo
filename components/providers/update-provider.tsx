"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UpdateNotice } from "@/components/providers/update-notice";

const CURRENT_ID = process.env.NEXT_PUBLIC_BUILD_ID;
const CHECK_EVERY_MS = 5 * 60 * 1000;
const RELOAD_DELAY_MS = 1500;
const SW_UPDATE_TIMEOUT_MS = 3000;
const RELOAD_GUARD_KEY = "tomcerto:update-reload-at";
const RELOAD_GUARD_MS = 60_000;
// Errors an open tab throws when the server already runs a newer build.
const STALE_BUILD_ERROR = /ChunkLoadError|Loading chunk .* failed|Failed to find Server Action/i;

// Stops a reload loop if the error persists after reloading.
function canReload() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY));
    return !last || Date.now() - last >= RELOAD_GUARD_MS;
  } catch {
    return true;
  }
}

async function updateServiceWorker() {
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (!registration) return;
    await Promise.race([
      registration.update(),
      new Promise((resolve) => setTimeout(resolve, SW_UPDATE_TIMEOUT_MS)),
    ]);
  } catch {
    // Offline or blocked: reload anyway, the network will serve the new build.
  }
}

async function checkVersion(onOutdated: () => void) {
  if (!CURRENT_ID) return;
  try {
    const response = await fetch("/api/version", { cache: "no-store" });
    if (!response.ok) return;
    const { id } = (await response.json()) as { id: string | null };
    if (id && id !== CURRENT_ID) onOutdated();
  } catch {
    // Offline: try again on the next trigger.
  }
}

export function UpdateProvider() {
  const pathname = usePathname();
  const [outdated, setOutdated] = useState(false);
  // Reloading would exit the fullscreen live view, so wait until the user leaves it.
  const onPerform = pathname.startsWith("/perform");

  const markOutdated = useCallback(() => {
    if (canReload()) setOutdated(true);
  }, []);

  useEffect(() => {
    const check = () => void checkVersion(markOutdated);
    check();
    const interval = setInterval(check, CHECK_EVERY_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    const onError = (event: ErrorEvent) => {
      if (STALE_BUILD_ERROR.test(event.message)) markOutdated();
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      if (STALE_BUILD_ERROR.test(`${reason?.name ?? ""} ${message}`)) markOutdated();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", check);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", check);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [markOutdated]);

  useEffect(() => {
    if (!outdated || onPerform) return;
    const timer = setTimeout(async () => {
      await updateServiceWorker();
      try {
        sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
      } catch {
        // Storage blocked: the guard is best effort.
      }
      window.location.reload();
    }, RELOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [outdated, onPerform]);

  if (!outdated) return null;
  return <UpdateNotice variant={onPerform ? "pending" : "updating"} />;
}
