"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { cn } from "@/lib/utils";
import { useDeleteBudget } from "../hooks/use-budget-mutations";
import type { BudgetType } from "../types/budget-types";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

type BudgetListProps = {
  budgets: BudgetType[];
  onEdit: (budget: BudgetType, origin: OriginRect) => void;
};

export function BudgetList({ budgets, onEdit }: BudgetListProps) {
  const deleteMutation = useDeleteBudget();
  const [pendingDelete, setPendingDelete] = useState<BudgetType | null>(null);
  const [deleteOrigin, setDeleteOrigin] = useState<OriginRect | null>(null);

  if (budgets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-sm">
        <p className="text-body-md text-foreground">No budgets this month.</p>
        <p className="mt-1 text-caption text-muted-foreground">
          Set a monthly limit per expense category.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {budgets.map((budget) => {
          const over = budget.percentUsed >= 100;
          const warn = budget.percentUsed >= 80 && !over;
          const width = Math.min(budget.percentUsed, 100);

          return (
            <li
              key={budget.id}
              className="rounded-xl bg-surface px-4 py-3.5 shadow-sm ring-1 ring-border"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {budget.isOverall || budget.categoryId == null
                      ? "All expenses"
                      : (budget.categoryName ?? "Category")}
                    {budget.isOverall || budget.categoryId == null ? (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        Overall
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-caption text-muted-foreground">
                    {formatMoney(budget.spent)} / {formatMoney(budget.amount)}
                    {over
                      ? ` · Over by ${formatMoney(Math.abs(budget.remaining))}`
                      : ` · ${formatMoney(budget.remaining)} left`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span
                    className={cn(
                      "mr-1 text-xs font-semibold",
                      over
                        ? "text-danger"
                        : warn
                          ? "text-warning"
                          : "text-foreground",
                    )}
                  >
                    {budget.percentUsed}%
                  </span>
                  <button
                    type="button"
                    onClick={(event) =>
                      onEdit(budget, originFromElement(event.currentTarget))
                    }
                    className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-background hover:text-foreground"
                    aria-label="Edit budget"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      setDeleteOrigin(originFromElement(event.currentTarget));
                      setPendingDelete(budget);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-danger/10 hover:text-danger"
                    aria-label="Delete budget"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    over ? "bg-danger" : warn ? "bg-warning" : "bg-primary",
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        origin={deleteOrigin}
        title="Delete budget?"
        description="This monthly limit will be removed. Transactions are kept."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteMutation.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
