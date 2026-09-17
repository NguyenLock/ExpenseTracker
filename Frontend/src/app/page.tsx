import Link from "next/link";
import { Wallet } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
      <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <Wallet className="size-8 text-primary" aria-hidden />
          <h1 className="text-h1 text-foreground">ExpenseTracker</h1>
        </div>
        <p className="mt-4 text-body-md text-muted">
          Track spending and stay on budget.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="inline-flex h-button-md items-center justify-center rounded-lg bg-primary px-4 text-button-md text-white hover:opacity-90"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-button-md items-center justify-center rounded-lg border border-black/10 bg-surface px-4 text-button-md text-foreground hover:bg-background"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
