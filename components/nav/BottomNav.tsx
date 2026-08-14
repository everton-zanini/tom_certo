"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Music, ListMusic, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Início", icon: Home },
  { href: "/songs", label: "Músicas", icon: Music },
  { href: "/playlists", label: "Repertórios", icon: ListMusic },
  { href: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
  { href: "/account", label: "Conta", icon: User },
] as const;

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t bg-sidebar text-sidebar-foreground md:hidden">
      {items
        .filter((item) => !("adminOnly" in item && item.adminOnly) || isAdmin)
        .map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.65rem]",
                active ? "text-green-600 dark:text-green-400" : "text-sidebar-foreground/60"
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
    </nav>
  );
}
