"use client";

import { ChevronLeft, ChevronRight, Copy, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  OriginModal,
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { TableSkeleton } from "@/components/table-skeleton";
import { ApiError } from "@/lib/api-client";
import { useCopyBudgets } from "../hooks/use-budget-mutations";
import { useBudgets } from "../hooks/use-budgets";
import type { BudgetType } from "../types/budget-types";
import { BudgetForm } from "./budget-form";
import { BudgetList } from "./budget-list";

function currentMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, 1));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function monthTotals(budgets: BudgetType[]) {
  const overall = budgets.find((b) => b.isOverall || b.categoryId == null);
  const categories = budgets.filter(
    (b) => !b.isOverall && b.categoryId != null,
  );
  // Prefer overall cap; otherwise sum category limits (avoid double-counting).
  const totalBudget = overall
    ? overall.amount
    : categories.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = overall
    ? overall.spent
    : categories.reduce((sum, b) => sum + b.spent, 0);
  const percent =
    totalBudget > 0
      ? Math.round((totalSpent / totalBudget) * 1000) / 10
      : 0;
  return { totalSpent, totalBudget, percent };
}

export function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<BudgetType | null>(null);
  const [modalOrigin, setModalOrigin] = useState<OriginRect | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const { data = [], isLoading, isError, error, isFetching } = useBudgets(month);
  const copyMutation = useCopyBudgets();

  const modalOpen = creating || Boolean(editing);
  const monthLabel = useMemo(() => formatMonthLabel(month), [month]);
  const nextMonth = shiftMonth(month, 1);
  const nextMonthLabel = formatMonthLabel(nextMonth);
  const totals = useMemo(() => monthTotals(data), [data]);

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-h1 text-foreground">Budgets</h2>
          <p className="mt-1 text-body-md text-muted">
            Overall or per-category monthly limits — see how much you’ve used.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={data.length === 0 || copyMutation.isPending}
            onClick={async () => {
              setCopyMessage(null);
              try {
                const result = await copyMutation.mutateAsync({
                  fromMonth: month,
                  toMonth: nextMonth,
                });
                setMonth(nextMonth);
                setCopyMessage(
                  `Copied ${result.created} · skipped ${result.skipped} (already set)`,
                );
              } catch (err) {
                setCopyMessage(
                  err instanceof ApiError
                    ? err.message
                    : "Unable to copy budgets",
                );
              }
            }}
            className="inline-flex h-button-md items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-button-md text-foreground transition hover:bg-background disabled:opacity-50"
            title={`Copy to ${nextMonthLabel}`}
          >
            <Copy className="size-4" />
            Copy → next month
          </button>
          <button
            type="button"
            onClick={(event) => {
              setModalOrigin(originFromElement(event.currentTarget));
              setEditing(null);
              setCreating(true);
            }}
            className="inline-flex h-button-md items-center justify-center gap-2 rounded-xl bg-primary px-4 text-button-md text-white transition hover:opacity-95 active:scale-[0.98]"
          >
            <Plus className="size-4" />
            Add budget
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground hover:bg-background"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="min-w-[10rem] text-center text-sm font-medium text-foreground">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground hover:bg-background"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
          {month !== currentMonth() ? (
            <button
              type="button"
              onClick={() => setMonth(currentMonth())}
              className="ml-1 text-sm font-medium text-primary hover:opacity-90"
            >
              This month
            </button>
          ) : null}
        </div>
        {!isLoading && data.length > 0 ? (
          <p
            className={
              totals.percent >= 100
                ? "text-sm font-semibold text-danger"
                : totals.percent >= 80
                  ? "text-sm font-semibold text-warning"
                  : "text-sm font-semibold text-foreground"
            }
          >
            {formatMoney(totals.totalSpent)}
            <span className="mx-1 font-normal text-muted-foreground">/</span>
            {formatMoney(totals.totalBudget)}
            <span className="ml-1.5 font-medium text-muted-foreground">
              ({totals.percent}%)
            </span>
          </p>
        ) : null}
      </div>

      {copyMessage ? (
        <p className="text-caption text-muted-foreground">{copyMessage}</p>
      ) : null}

      {isLoading ? (
        <TableSkeleton columns={3} rows={4} />
      ) : isError ? (
        <p className="text-error">
          {error instanceof Error ? error.message : "Failed to load"}
        </p>
      ) : (
        <div
          className={
            isFetching ? "opacity-70 transition-opacity" : undefined
          }
        >
          <BudgetList
            budgets={data}
            onEdit={(budget, origin) => {
              setModalOrigin(origin);
              setCreating(false);
              setEditing(budget);
            }}
          />
        </div>
      )}

      <OriginModal
        open={modalOpen}
        origin={modalOrigin}
        onClose={closeModal}
        className="max-w-md"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-h4 text-foreground">
            {editing ? "Edit budget" : "New budget"}
          </h3>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-foreground"
            aria-label="Close"
          >
            <X className="size-4 stroke-[2.25]" />
          </button>
        </div>
        <BudgetForm budget={editing} month={month} onDone={closeModal} />
      </OriginModal>
    </div>
  );
}
