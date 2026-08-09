"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PlaylistDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? "";

  function goTo(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("date", value);
    } else {
      params.delete("date");
    }
    params.delete("page");
    router.push(`/playlists?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={date}
        onChange={(e) => goTo(e.target.value)}
        aria-label="Buscar repertório por data"
        className="sm:max-w-[200px]"
      />
      {date && (
        <Button type="button" variant="ghost" size="sm" onClick={() => goTo("")}>
          Limpar
        </Button>
      )}
    </div>
  );
}
