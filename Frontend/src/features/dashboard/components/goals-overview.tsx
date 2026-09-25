"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { useGoals } from "@/features/goals/hooks/use-goals";
import { cn } from "@/lib/utils";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function GoalsOverview() {
  const { data = [], isLoading } = useGoals("active");
  const top = data.slice(0, 3);

  if (isLoading) return null;

  if (top.length === 0) {
    return (
      <section className="rounded-2xl bg-surface px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Target className="size-3.5" />
            </span>
            <div>
              <h3 className="text-h4 text-foreground">Saving goals</h3>
              <p className="mt-0.5 text-caption text-muted-foreground">
                No active goals
              </p>
            </div>
          </div>
          <Link
            href="/goals"
            className="text-sm font-medium text-primary transition hover:opacity-90"
          >
            Set up
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-surface shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="size-3.5" />
          </span>
          <div>
            <h3 className="text-h4 text-foreground">Saving goals</h3>
            <p className="mt-0.5 text-caption text-muted-foreground">
              {data.length} active
            </p>
          </div>
        </div>
        <Link
          href="/goals"
          className="text-sm font-medium text-primary transition hover:opacity-90"
        >
          Manage
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {top.map((goal) => (
          <li key={goal.id} className="px-5 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-medium text-foreground">
                {goal.name}
              </p>
              <p className="shrink-0 text-xs font-semibold text-muted-foreground">
                {formatMoney(goal.savedAmount)} /{" "}
                {formatMoney(goal.targetAmount)}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn("h-full rounded-full bg-primary")}
                style={{
                  width: `${Math.min(goal.percentSaved, 100)}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
