"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  useDeleteDebt,
  useSettleDebt,
} from "../hooks/use-debt-mutations";
import type { DebtType } from "../types/debt-types";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

type DebtListProps = {
  debts: DebtType[];
  onEdit: (debt: DebtType, origin: OriginRect) => void;
};

export function DebtList({ debts, onEdit }: DebtListProps) {
  const settleMutation = useSettleDebt();
  const deleteMutation = useDeleteDebt();
  const [pendingDelete, setPendingDelete] = useState<DebtType | null>(null);
  const [deleteOrigin, setDeleteOrigin] = useState<OriginRect | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  if (debts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-sm">
        <p className="text-body-md text-foreground">No debts in this list.</p>
        <p className="mt-1 text-caption text-muted-foreground">
          Track money you owe or money owed to you.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {actionError ? <p className="text-error">{actionError}</p> : null}
      <div className="overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-border">
        <ul className="divide-y divide-border">
          {debts.map((debt) => (
            <li key={debt.id} className="flex items-start gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {debt.direction === "i_owe"
                      ? `Remember to pay ${debt.personName}`
                      : `${debt.personName} owes you`}
                  </p>
                  {debt.status === "open" && debt.isInPayWindow ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Pay window
                    </span>
                  ) : null}
                  {debt.status === "open" && debt.isOverdue ? (
                    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger">
                      Overdue
                    </span>
                  ) : null}
                  {debt.status === "open" && debt.isDueToday && !debt.isInPayWindow ? (
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">
                      Due today
                    </span>
                  ) : null}
                  {debt.status === "open" && debt.autoRecord ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Auto
                    </span>
                  ) : null}
                  {debt.status === "settled" ? (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                      Settled
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-caption text-muted-foreground">
                  {debt.windowStart && debt.windowEnd
                    ? `Window ${formatDate(debt.windowStart)} – ${formatDate(debt.windowEnd)}`
                    : `Due ${formatDate(debt.dueDate)}`}
                  {debt.installmentCount > 1
                    ? ` · ${debt.paidInstallments}/${debt.installmentCount}`
                    : ""}
                  {" · "}
                  {debt.walletName ?? "Wallet"} ·{" "}
                  {debt.categoryName ?? "Category"}
                  {debt.note ? ` · ${debt.note}` : ""}
                </p>
                <p
                  className={cn(
                    "mt-1 text-sm font-semibold",
                    debt.direction === "i_owe" ? "text-danger" : "text-success",
                  )}
                >
                  {debt.direction === "i_owe" ? "−" : "+"}
                  {formatMoney(
                    debt.status === "open"
                      ? debt.installmentAmount
                      : debt.amount,
                  )}
                  {debt.installmentCount > 1 ? (
                    <span className="ml-1 text-caption font-normal text-muted-foreground">
                      / tháng · tổng{" "}
                      {formatMoney(
                        debt.totalAmount ??
                          debt.amount * debt.installmentCount,
                      )}
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {debt.status === "open" ? (
                  <button
                    type="button"
                    disabled={settlingId === debt.id}
                    onClick={async () => {
                      setActionError(null);
                      setSettlingId(debt.id);
                      try {
                        await settleMutation.mutateAsync(debt.id);
                      } catch (error) {
                        setActionError(
                          error instanceof ApiError
                            ? error.message
                            : "Unable to settle",
                        );
                      } finally {
                        setSettlingId(null);
                      }
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary/10 px-2.5 text-xs font-medium text-primary hover:bg-primary/15 disabled:opacity-60"
                  >
                    <Check className="size-3.5" />
                    {debt.installmentCount > 1
                      ? debt.direction === "i_owe"
                        ? "Pay installment"
                        : "Record installment"
                      : debt.direction === "i_owe"
                        ? "Mark paid"
                        : "Record"}
                  </button>
                ) : null}
                {debt.status === "open" ? (
                  <button
                    type="button"
                    onClick={(event) =>
                      onEdit(debt, originFromElement(event.currentTarget))
                    }
                    className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-background hover:text-foreground"
                    aria-label="Edit debt"
                  >
                    <Pencil className="size-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={(event) => {
                    setDeleteOrigin(originFromElement(event.currentTarget));
                    setPendingDelete(debt);
                  }}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-danger/10 hover:text-danger"
                  aria-label="Delete debt"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        origin={deleteOrigin}
        title="Delete debt?"
        description="This reminder will be removed. Existing transactions are kept."
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
