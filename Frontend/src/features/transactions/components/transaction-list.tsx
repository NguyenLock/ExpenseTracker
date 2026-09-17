"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { SuccessBeamRow } from "@/components/success-beam-row";
import { CategoryIconBadge } from "@/features/categories/components/category-icon-badge";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useDeleteTransaction } from "../hooks/use-transaction-mutations";
import type { TransactionType } from "../types/transaction-types";

function formatAmount(value: number) {
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

type TransactionListProps = {
  transactions: TransactionType[];
  celebrateId?: string | null;
  onCelebrateComplete?: () => void;
  onEdit: (transaction: TransactionType, origin: OriginRect) => void;
};

export function TransactionList({
  transactions,
  celebrateId,
  onCelebrateComplete,
  onEdit,
}: TransactionListProps) {
  const deleteMutation = useDeleteTransaction();
  const [pendingDelete, setPendingDelete] = useState<TransactionType | null>(
    null,
  );
  const [deleteOrigin, setDeleteOrigin] = useState<OriginRect | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-sm">
        <p className="text-body-md text-foreground">No transactions yet.</p>
        <p className="mt-1 text-caption text-muted-foreground">
          Use “Add transaction” to create one.
        </p>
      </div>
    );
  }

  const errorMessage =
    deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : deleteMutation.error
        ? "Unable to delete transaction"
        : null;

  return (
    <div className="flex flex-col gap-3">
      {errorMessage ? <p className="text-error">{errorMessage}</p> : null}
      <div className="overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-border">
        <table className="w-full text-left">
          <thead className="border-b border-border bg-background/70">
            <tr>
              <th className="px-4 py-3 text-table-header text-muted">Date</th>
              <th className="px-4 py-3 text-table-header text-muted">Category</th>
              <th className="hidden px-4 py-3 text-table-header text-muted sm:table-cell">
                Wallet
              </th>
              <th className="px-4 py-3 text-right text-table-header text-muted">
                Amount
              </th>
              <th className="px-4 py-3 text-right text-table-header text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <SuccessBeamRow
                key={transaction.id}
                celebrate={celebrateId === transaction.id}
                onCelebrationComplete={onCelebrateComplete}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-table-cell text-foreground">
                      {formatDate(transaction.transactionDate)}
                    </span>
                    {transaction.note ? (
                      <span className="text-caption text-muted-foreground line-clamp-1">
                        {transaction.note}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    {transaction.categoryIcon ? (
                      <CategoryIconBadge
                        icon={transaction.categoryIcon}
                        size="sm"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-table-cell font-medium text-foreground">
                        {transaction.categoryName ?? "—"}
                      </p>
                      <span
                        className={cn(
                          "text-caption capitalize",
                          transaction.type === "expense"
                            ? "text-danger"
                            : "text-success",
                        )}
                      >
                        {transaction.type}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-table-cell text-foreground sm:table-cell">
                  {transaction.walletName ?? "—"}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right text-table-cell font-medium",
                    transaction.type === "expense"
                      ? "text-danger"
                      : "text-success",
                  )}
                >
                  {transaction.type === "expense" ? "−" : "+"}
                  {formatAmount(transaction.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={(event) =>
                        onEdit(
                          transaction,
                          originFromElement(event.currentTarget),
                        )
                      }
                      className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-background hover:text-foreground"
                      aria-label="Edit transaction"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={(event) => {
                        setDeleteOrigin(originFromElement(event.currentTarget));
                        setPendingDelete(transaction);
                      }}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-danger/10 hover:text-danger disabled:opacity-60"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </SuccessBeamRow>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        origin={deleteOrigin}
        title="Delete transaction?"
        description="This transaction will be removed permanently. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        loading={deleteMutation.isPending}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteMutation.mutateAsync(pendingDelete.id);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
