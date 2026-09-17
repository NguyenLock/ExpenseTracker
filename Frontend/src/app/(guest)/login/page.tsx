import { Wallet } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Wallet className="size-7" />
        </span>
        <h1 className="text-h2 text-foreground">Welcome back</h1>
        <p className="mt-2 text-body-md text-muted">
          Sign in to continue tracking your money.
        </p>
      </div>
      <div className="rounded-3xl bg-surface p-6 shadow-sm ring-1 ring-black/[0.04]">
        <LoginForm />
      </div>
    </main>
  );
}
