import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PlaylistPagination({
  page,
  totalPages,
  date,
}: {
  page: number;
  totalPages: number;
  date?: string;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    params.set("page", String(targetPage));
    return `/playlists?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {page > 1 ? (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={hrefFor(page - 1)}>Anterior</Link>}
        />
      ) : (
        <Button variant="outline" size="sm" disabled>
          Anterior
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={hrefFor(page + 1)}>Próxima</Link>}
        />
      ) : (
        <Button variant="outline" size="sm" disabled>
          Próxima
        </Button>
      )}
    </div>
  );
}
