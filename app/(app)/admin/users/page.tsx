import { listUsers } from "@/services/user.actions";
import { UserForm } from "@/components/admin/UserForm";
import { UsersTable } from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const users = await listUsers();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Usuários</h1>
      <UserForm />
      <UsersTable users={users} />
    </div>
  );
}
