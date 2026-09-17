"use client";

import { ArrowLeftRight, Plus, X } from "lucide-react";
import { useState } from "react";
import {
  OriginModal,
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { Pagination } from "@/components/pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { useWallets } from "../hooks/use-wallets";
import type { WalletType } from "../types/wallet-types";
import { WalletForm } from "./wallet-form";
import { WalletList } from "./wallet-list";
import { WalletTransferForm } from "./wallet-transfer-form";

const PAGE_SIZE = 10;

type ModalMode = "create" | "edit" | "transfer" | null;

export function WalletsSettings() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<WalletType | null>(null);
  const [transferFromId, setTransferFromId] = useState<string | null>(null);
  const [mode, setMode] = useState<ModalMode>(null);
  const [modalOrigin, setModalOrigin] = useState<OriginRect | null>(null);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, error } = useWallets({
    page,
    limit: PAGE_SIZE,
  });

  const modalOpen = mode !== null;

  const closeModal = () => {
    setMode(null);
    setEditing(null);
    setTransferFromId(null);
  };

  const openTransfer = (origin: OriginRect, fromWalletId?: string) => {
    setModalOrigin(origin);
    setEditing(null);
    setTransferFromId(fromWalletId ?? null);
    setMode("transfer");
  };

  const modalTitle =
    mode === "transfer"
      ? "Transfer"
      : mode === "edit"
        ? "Edit wallet"
        : "New wallet";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-caption font-medium tracking-wide text-muted uppercase">
            Settings
          </p>
          <h2 className="mt-1 text-h1 text-foreground">Wallets</h2>
          <p className="mt-1 text-body-md text-muted">
            Track cash, bank accounts, and e-wallets.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(event) =>
              openTransfer(originFromElement(event.currentTarget))
            }
            className="inline-flex h-button-md items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-button-md text-foreground transition hover:bg-background active:scale-[0.98]"
          >
            <ArrowLeftRight className="size-4" />
            Transfer
          </button>
          <button
            type="button"
            onClick={(event) => {
              setModalOrigin(originFromElement(event.currentTarget));
              setEditing(null);
              setMode("create");
            }}
            className="inline-flex h-button-md items-center justify-center gap-2 rounded-xl bg-primary px-4 text-button-md text-white transition hover:opacity-95 active:scale-[0.98]"
          >
            <Plus className="size-4" />
            Add wallet
          </button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton columns={4} rows={5} />
      ) : isError ? (
        <p className="text-error">
          {error instanceof Error ? error.message : "Failed to load"}
        </p>
      ) : (
        <div className={isFetching ? "opacity-70 transition-opacity" : undefined}>
          <WalletList
            wallets={data?.items ?? []}
            celebrateId={celebrateId}
            onCelebrateComplete={() => setCelebrateId(null)}
            onEdit={(wallet, origin) => {
              setModalOrigin(origin);
              setEditing(wallet);
              setMode("edit");
            }}
            onTransfer={(wallet, origin) => openTransfer(origin, wallet.id)}
          />
          {data ? (
            <div className="mt-4">
              <Pagination
                meta={data}
                onPageChange={setPage}
                disabled={isFetching}
              />
            </div>
          ) : null}
        </div>
      )}

      <OriginModal
        open={modalOpen}
        origin={modalOrigin}
        onClose={closeModal}
        className="max-w-md"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-h4 text-foreground">{modalTitle}</h3>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-foreground transition hover:bg-background"
            aria-label="Close"
          >
            <X className="size-4 stroke-[2.25]" />
          </button>
        </div>
        {mode === "transfer" ? (
          <WalletTransferForm
            fromWalletId={transferFromId}
            onDone={closeModal}
          />
        ) : (
          <WalletForm
            wallet={editing}
            onDone={closeModal}
            onCreated={(wallet) => {
              setPage(1);
              setCelebrateId(wallet.id);
            }}
          />
        )}
      </OriginModal>
    </div>
  );
}
