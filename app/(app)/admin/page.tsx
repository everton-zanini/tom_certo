import { getAdminStats } from "@/services/admin.actions";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Músicas</p>
          <p className="text-2xl font-semibold">{stats.songs}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Repertórios</p>
          <p className="text-2xl font-semibold">{stats.playlists}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <p className="text-sm text-muted-foreground">Usuários ativos</p>
          <p className="text-2xl font-semibold">{stats.users}</p>
        </CardContent>
      </Card>
    </div>
  );
}
