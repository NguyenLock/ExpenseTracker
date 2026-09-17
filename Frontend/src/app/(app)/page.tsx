"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useCategories } from "@/features/categories/hooks/use-categories";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: categories = [] } = useCategories();

  const expenseCount = categories.filter((c) => c.type === "expense").length;
  const incomeCount = categories.filter((c) => c.type === "income").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-caption font-medium tracking-wide text-muted uppercase">
          Overview
        </p>
        <h2 className="mt-1 text-h1 text-foreground">
          Welcome back, {user?.name}
        </h2>
        <p className="mt-1 text-body-md text-muted">
          Here’s a quick look at your category setup.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/[0.04]">
          <p className="text-metric-label">Expense categories</p>
          <p className="mt-2 text-metric-value text-foreground">{expenseCount}</p>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/[0.04]">
          <p className="text-metric-label">Income categories</p>
          <p className="mt-2 text-metric-value text-foreground">{incomeCount}</p>
        </div>
        <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/[0.04] sm:col-span-2 lg:col-span-1">
          <p className="text-metric-label">Total categories</p>
          <p className="mt-2 text-metric-value text-foreground">
            {categories.length}
          </p>
        </div>
      </section>
    </div>
  );
}
