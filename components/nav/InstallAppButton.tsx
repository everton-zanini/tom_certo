"use client";

import { useState, useSyncExternalStore } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

type Status = "idle" | "installed" | "promptable" | "ios";

let deferredEvent: BeforeInstallPromptEvent | null = null;
let installedFlag = false;

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

function getSnapshot(): Status {
  if (typeof window === "undefined") return "idle";
  if (installedFlag || isStandalone()) return "installed";
  if (deferredEvent) return "promptable";
  if (isIOS()) return "ios";
  return "idle";
}

function getServerSnapshot(): Status {
  return "idle";
}

function subscribe(callback: () => void) {
  function onBeforeInstallPrompt(event: Event) {
    event.preventDefault();
    deferredEvent = event as BeforeInstallPromptEvent;
    callback();
  }
  function onAppInstalled() {
    installedFlag = true;
    deferredEvent = null;
    callback();
  }
  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.addEventListener("appinstalled", onAppInstalled);
  return () => {
    window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.removeEventListener("appinstalled", onAppInstalled);
  };
}

export function InstallAppButton() {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [showIOSHint, setShowIOSHint] = useState(false);

  if (status === "idle" || status === "installed") return null;

  async function handleClick() {
    if (status === "promptable" && deferredEvent) {
      await deferredEvent.prompt();
      return;
    }
    setShowIOSHint(true);
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={handleClick} aria-label="Instalar app">
        <Download className="size-4" />
      </Button>
      <Dialog open={showIOSHint} onOpenChange={setShowIOSHint}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instalar o Tom Certo</DialogTitle>
            <DialogDescription>
              Toque em Compartilhar <span aria-hidden>⎋</span> na barra do Safari e depois em
              &quot;Adicionar à Tela de Início&quot; <span aria-hidden>➕</span>.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
