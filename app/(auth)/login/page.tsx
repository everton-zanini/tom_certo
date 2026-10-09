import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/tom_certo_icone.png" alt="" width={64} height={64} className="rounded-2xl" priority />
        <h1 className="text-3xl font-bold tracking-tight">Tom Certo</h1>
        <p className="text-sm text-muted-foreground">Entre para ver suas cifras e repertórios</p>
      </div>
      <LoginForm />
    </div>
  );
}
