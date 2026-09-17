"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import {
  OriginModal,
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { Pagination } from "@/components/pagination";
import { TableSkeleton } from "@/components/table-skeleton";
import { useTransactions } from "../hooks/use-transactions";
import type {
  TransactionType,
  TransactionTypeEnum,
} from "../types/transaction-types";
import { TransactionForm } from "./transaction-form";
import { TransactionList } from "./transaction-list";
import { TransactionShortcuts } from "@/features/transaction-templates/components/transaction-shortcuts";

const PAGE_SIZE = 10;

type FilterTab = "all" | TransactionTypeEnum;

export function TransactionsPage() {
  const [tab, setTab] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<TransactionType | null>(null);
  const [creating, setCreating] = useState(false);
  const [modalOrigin, setModalOrigin] = useState<OriginRect | null>(null);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  const typeFilter = tab === "all" ? undefined : tab;

  const { data, isLoading, isFetching, isError, error } = useTransactions({
    page,
    limit: PAGE_SIZE,
    type: typeFilter,
  });

  const modalOpen = creating || Boolean(editing);

  const closeModal = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-h1 text-foreground">Transactions</h2>
          <p className="mt-1 text-body-md text-muted">
            Record income and expenses across your wallets.
          </p>
        </div>
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
          Add transaction
        </button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value: string) => {
          setTab(value as FilterTab);
          setPage(1);
        }}
        className="gap-4"
      >
        <TabsList className="h-9 w-full max-w-xs rounded-lg sm:w-auto">
          <TabsTrigger value="all" className="rounded-md text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="expense" className="rounded-md text-xs">
            Expense
          </TabsTrigger>
          <TabsTrigger value="income" className="rounded-md text-xs">
            Income
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <TransactionShortcuts
        typeFilter={typeFilter}
        onQuickCreated={(created) => {
          if (tab !== "all" && created.type !== tab) setTab(created.type);
          setPage(1);
          setCelebrateId(created.id);
        }}
      />

      {isLoading ? (
        <TableSkeleton columns={5} rows={5} />
      ) : isError ? (
        <p className="text-error">
          {error instanceof Error ? error.message : "Failed to load"}
        </p>
      ) : (
        <div className={isFetching ? "opacity-70 transition-opacity" : undefined}>
          <TransactionList
            transactions={data?.items ?? []}
            celebrateId={celebrateId}
            onCelebrateComplete={() => setCelebrateId(null)}
            onEdit={(transaction, origin) => {
              setModalOrigin(origin);
              setCreating(false);
              setEditing(transaction);
            }}
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
          <h3 className="text-h4 text-foreground">
            {editing ? "Edit transaction" : "New transaction"}
          </h3>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-foreground transition hover:bg-background"
            aria-label="Close"
          >
            <X className="size-4 stroke-[2.25]" />
          </button>
        </div>
        <TransactionForm
          transaction={editing}
          onDone={closeModal}
          onCreated={(created) => {
            if (tab !== "all" && created.type !== tab) setTab(created.type);
            setPage(1);
            setCelebrateId(created.id);
          }}
        />
      </OriginModal>
    </div>
  );
}
