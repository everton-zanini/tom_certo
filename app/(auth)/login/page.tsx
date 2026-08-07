import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold">Tom Certo</h1>
        <p className="text-sm text-muted-foreground">
          Entre com seu email e senha para acessar o sistema
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
