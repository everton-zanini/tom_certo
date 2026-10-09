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
    <nav
      aria-label="Principal"
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t bg-sidebar text-sidebar-foreground md:hidden"
    >
      <div className="flex">
        {items
          .filter((item) => !("adminOnly" in item && item.adminOnly) || isAdmin)
          .map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                  active ? "text-primary" : "text-sidebar-foreground/65"
                )}
              >
                {active && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary" />}
                <Icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            );
          })}
      </div>
    </nav>
  );
}
