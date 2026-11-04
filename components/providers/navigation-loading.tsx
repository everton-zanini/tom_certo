"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoadingOverlay } from "@/components/providers/loading-overlay-provider";

// Safety net: a click that never results in a route change must not leave the screen blocked.
const MAX_OVERLAY_MS = 10_000;

export function NavigationLoading() {
  const { show, hide } = useLoadingOverlay();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const pendingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function release() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    if (!pendingRef.current) return;
    pendingRef.current = false;
    hide();
  }

  useEffect(() => {
    release();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || !anchor.href) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      // Presentation view navigates client-side inside fullscreen, where the overlay would be invisible.
      if (window.location.pathname.startsWith("/perform")) return;
      if (pendingRef.current) return;

      pendingRef.current = true;
      show();
      timeoutRef.current = setTimeout(release, MAX_OVERLAY_MS);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return null;
}
