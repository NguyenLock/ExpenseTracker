import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
        <h1 className="text-h1 text-foreground">Create account</h1>
        <p className="mt-2 text-body-md text-muted">
          Start tracking your expenses in minutes.
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
