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
          Frontend scaffold is ready. Start the app with{" "}
          <code className="rounded bg-background px-1.5 py-0.5 font-mono text-caption text-foreground">
            npm run dev
          </code>
          .
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-label-sm text-primary">
            Primary
          </span>
          <span className="rounded-md bg-success/10 px-2.5 py-1 text-label-sm text-success">
            Success
          </span>
          <span className="rounded-md bg-danger/10 px-2.5 py-1 text-label-sm text-danger">
            Danger
          </span>
          <span className="rounded-md bg-warning/10 px-2.5 py-1 text-label-sm text-warning">
            Warning
          </span>
        </div>
      </div>
    </main>
  );
}
