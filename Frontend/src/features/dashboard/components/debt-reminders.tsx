"use client";

import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { useState } from "react";
import { useSettleDebt } from "@/features/debts/hooks/use-debt-mutations";
import type { DebtType } from "@/features/debts/types/debt-types";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

type DebtRemindersProps = {
  debts: DebtType[];
};

export function DebtReminders({ debts }: DebtRemindersProps) {
  const settleMutation = useSettleDebt();
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (debts.length === 0) return null;

  return (
    <section className="rounded-2xl bg-surface shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-warning/15 text-warning">
            <Bell className="size-3.5" />
          </span>
          <div>
            <h3 className="text-h4 text-foreground">Debt reminders</h3>
            <p className="mt-0.5 text-caption text-muted-foreground">
              Due soon, overdue, or ready to record
            </p>
          </div>
        </div>
        <Link
          href="/debts"
          className="text-sm font-medium text-primary transition hover:opacity-90"
        >
          Manage
        </Link>
      </div>

      {error ? <p className="px-5 pt-3 text-error">{error}</p> : null}

      <ul className="divide-y divide-border">
        {debts.map((debt) => (
          <li
            key={debt.id}
            className="flex items-center gap-3 px-5 py-3.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {debt.direction === "i_owe"
                  ? `Remember to pay ${debt.personName}`
                  : `${debt.personName} should pay you`}
              </p>
              <p className="text-caption text-muted-foreground">
                Due {debt.dueDate}
                {debt.isOverdue ? " · Overdue" : ""}
                {debt.isDueToday ? " · Today" : ""}
                {debt.autoRecord ? " · Auto" : ""}
              </p>
            </div>
            <p
              className={cn(
                "shrink-0 text-sm font-medium",
                debt.direction === "i_owe" ? "text-danger" : "text-success",
              )}
            >
              {formatMoney(debt.amount)}
            </p>
            <button
              type="button"
              disabled={settlingId === debt.id}
              onClick={async () => {
                setError(null);
                setSettlingId(debt.id);
                try {
                  await settleMutation.mutateAsync(debt.id);
                } catch (err) {
                  setError(
                    err instanceof ApiError
                      ? err.message
                      : "Unable to settle debt",
                  );
                } finally {
                  setSettlingId(null);
                }
              }}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-primary/10 px-2.5 text-xs font-medium text-primary hover:bg-primary/15 disabled:opacity-60"
            >
              <Check className="size-3.5" />
              {debt.direction === "i_owe" ? "Paid" : "Record"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
