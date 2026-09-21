"use client";

import Link from "next/link";
import { PiggyBank } from "lucide-react";
import type { BudgetType } from "@/features/budgets/types/budget-types";
import { cn } from "@/lib/utils";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

type BudgetOverviewProps = {
  budgets: BudgetType[];
};

export function BudgetOverview({ budgets }: BudgetOverviewProps) {
  if (budgets.length === 0) {
    return (
      <section className="rounded-2xl bg-surface px-5 py-4 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PiggyBank className="size-3.5" />
            </span>
            <div>
              <h3 className="text-h4 text-foreground">Budgets</h3>
              <p className="mt-0.5 text-caption text-muted-foreground">
                No limits set for this month
              </p>
            </div>
          </div>
          <Link
            href="/budgets"
            className="text-sm font-medium text-primary transition hover:opacity-90"
          >
            Set up
          </Link>
        </div>
      </section>
    );
  }

  const top = [...budgets]
    .sort((a, b) => b.percentUsed - a.percentUsed)
    .slice(0, 4);

  return (
    <section className="rounded-2xl bg-surface shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PiggyBank className="size-3.5" />
          </span>
          <div>
            <h3 className="text-h4 text-foreground">Budgets this month</h3>
            <p className="mt-0.5 text-caption text-muted-foreground">
              {budgets.length} categor{budgets.length === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>
        <Link
          href="/budgets"
          className="text-sm font-medium text-primary transition hover:opacity-90"
        >
          Manage
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {top.map((budget) => {
          const over = budget.percentUsed >= 100;
          const warn = budget.percentUsed >= 80 && !over;
          return (
            <li key={budget.id} className="px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-foreground">
                  {budget.isOverall || budget.categoryId == null
                    ? "All expenses"
                    : (budget.categoryName ?? "Category")}
                </p>
                <p
                  className={cn(
                    "shrink-0 text-xs font-semibold",
                    over
                      ? "text-danger"
                      : warn
                        ? "text-warning"
                        : "text-muted-foreground",
                  )}
                >
                  {formatMoney(budget.spent)} / {formatMoney(budget.amount)}
                </p>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full",
                    over ? "bg-danger" : warn ? "bg-warning" : "bg-primary",
                  )}
                  style={{
                    width: `${Math.min(budget.percentUsed, 100)}%`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
