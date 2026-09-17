import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
        <h1 className="text-h1 text-foreground">Sign in</h1>
        <p className="mt-2 text-body-md text-muted">
          Welcome back to ExpenseTracker.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
