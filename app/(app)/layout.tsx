import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/nav/LogoutButton";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { InstallAppButton } from "@/components/nav/InstallAppButton";
import { BottomNav } from "@/components/nav/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="flex flex-1 flex-col">
      <header className="pt-safe sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Image src="/tom_certo_icone.png" alt="" width={28} height={28} className="rounded-md" />
            Tom Certo
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            <Link href="/songs" className="hover:text-primary">
              Músicas
            </Link>
            <Link href="/playlists" className="hover:text-primary">
              Repertórios
            </Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-primary">
                Admin
              </Link>
            )}
            <Link href="/account" className="text-muted-foreground hover:text-foreground">
              {session?.user?.name}
            </Link>
          </nav>
          <div className="flex items-center gap-1">
            <InstallAppButton />
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col pb-20 md:pb-0">{children}</main>
      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
