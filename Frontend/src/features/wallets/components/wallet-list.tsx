"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { SuccessBeamRow } from "@/components/success-beam-row";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useDeleteWallet } from "../hooks/use-wallet-mutations";
import type { WalletType, WalletTypeEnum } from "../types/wallet-types";

const TYPE_LABEL: Record<WalletTypeEnum, string> = {
  cash: "Cash",
  bank: "Bank",
  ewallet: "E-wallet",
};

function formatBalance(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

type WalletListProps = {
  wallets: WalletType[];
  celebrateId?: string | null;
  onCelebrateComplete?: () => void;
  onEdit: (wallet: WalletType, origin: OriginRect) => void;
};

export function WalletList({
  wallets,
  celebrateId,
  onCelebrateComplete,
  onEdit,
}: WalletListProps) {
  const deleteMutation = useDeleteWallet();
  const [pendingDelete, setPendingDelete] = useState<WalletType | null>(null);
  const [deleteOrigin, setDeleteOrigin] = useState<OriginRect | null>(null);

  if (wallets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-sm">
        <p className="text-body-md text-foreground">No wallets yet.</p>
        <p className="mt-1 text-caption text-muted-foreground">
          Use “Add wallet” to create one.
        </p>
      </div>
    );
  }

  const errorMessage =
    deleteMutation.error instanceof ApiError
      ? deleteMutation.error.message
      : deleteMutation.error
        ? "Unable to delete wallet"
        : null;

  return (
    <div className="flex flex-col gap-3">
      {errorMessage ? <p className="text-error">{errorMessage}</p> : null}
      <div className="overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-border">
        <table className="w-full text-left">
          <thead className="border-b border-border bg-background/70">
            <tr>
              <th className="px-4 py-3 text-table-header text-muted">Wallet</th>
              <th className="hidden px-4 py-3 text-table-header text-muted sm:table-cell">
                Type
              </th>
              <th className="px-4 py-3 text-right text-table-header text-muted">
                Balance
              </th>
              <th className="px-4 py-3 text-right text-table-header text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet) => (
              <SuccessBeamRow
                key={wallet.id}
                celebrate={celebrateId === wallet.id}
                onCelebrationComplete={onCelebrateComplete}
              >
                <td className="px-4 py-3">
                  <span className="text-table-cell font-medium text-foreground">
                    {wallet.name}
                  </span>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-label-sm",
                      "bg-primary/10 text-primary",
                    )}
                  >
                    {TYPE_LABEL[wallet.type]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-table-cell font-medium text-foreground">
                  {formatBalance(wallet.balance)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={(event) =>
                        onEdit(wallet, originFromElement(event.currentTarget))
                      }
                      className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-background hover:text-foreground"
                      aria-label={`Edit ${wallet.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={(event) => {
                        setDeleteOrigin(originFromElement(event.currentTarget));
                        setPendingDelete(wallet);
                      }}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-danger/10 hover:text-danger disabled:opacity-60"
                      aria-label={`Delete ${wallet.name}`}
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
        title="Delete wallet?"
        description={
          pendingDelete ? (
            <>
              “{pendingDelete.name}” will be removed permanently. This cannot be
              undone.
            </>
          ) : null
        }
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
