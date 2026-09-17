"use client";

import { subDays } from "date-fns";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
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
import { DatePicker } from "@/components/ui/date-picker";
import { TransactionShortcuts } from "@/features/transaction-templates/components/transaction-shortcuts";
import { useTransactions } from "../hooks/use-transactions";
import type {
  TransactionType,
  TransactionTypeEnum,
} from "../types/transaction-types";
import { TransactionForm } from "./transaction-form";
import { TransactionList } from "./transaction-list";

const PAGE_SIZE = 10;

type FilterTab = "all" | TransactionTypeEnum;
type DatePreset = "all" | "today" | "yesterday" | "custom";

function toLocalIsoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function TransactionsPage() {
  const [tab, setTab] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [fromDate, setFromDate] = useState(toLocalIsoDate);
  const [toDate, setToDate] = useState(toLocalIsoDate);
  const [editing, setEditing] = useState<TransactionType | null>(null);
  const [creating, setCreating] = useState(false);
  const [modalOrigin, setModalOrigin] = useState<OriginRect | null>(null);
  const [celebrateId, setCelebrateId] = useState<string | null>(null);

  const today = toLocalIsoDate();
  const yesterday = useMemo(
    () => toLocalIsoDate(subDays(new Date(), 1)),
    [today],
  );

  const typeFilter = tab === "all" ? undefined : tab;

  const dateRange = (() => {
    if (datePreset === "today") return { fromDate: today, toDate: today };
    if (datePreset === "yesterday")
      return { fromDate: yesterday, toDate: yesterday };
    if (datePreset === "custom") {
      const from = fromDate <= toDate ? fromDate : toDate;
      const to = fromDate <= toDate ? toDate : fromDate;
      return { fromDate: from, toDate: to };
    }
    return { fromDate: undefined, toDate: undefined };
  })();

  const { data, isLoading, isFetching, isError, error } = useTransactions({
    page,
    limit: PAGE_SIZE,
    type: typeFilter,
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
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

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Tabs
            value={tab}
            onValueChange={(value: string) => {
              setTab(value as FilterTab);
              setPage(1);
            }}
            className="gap-0"
          >
            <TabsList className="h-9 w-full rounded-lg sm:w-auto">
              <TabsTrigger
                value="all"
                className="rounded-md text-xs text-foreground/75 data-[state=active]:text-primary-foreground"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="expense"
                className="rounded-md text-xs text-foreground/75 data-[state=active]:text-primary-foreground"
              >
                Expense
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="rounded-md text-xs text-foreground/75 data-[state=active]:text-primary-foreground"
              >
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs
            value={datePreset}
            onValueChange={(value: string) => {
              setDatePreset(value as DatePreset);
              setPage(1);
            }}
            className="gap-0"
          >
            <TabsList className="h-9 w-full rounded-lg sm:w-auto">
              <TabsTrigger
                value="all"
                className="rounded-md text-xs text-foreground/75 data-[state=active]:text-primary-foreground"
              >
                All dates
              </TabsTrigger>
              <TabsTrigger
                value="today"
                className="rounded-md text-xs text-foreground/75 data-[state=active]:text-primary-foreground"
              >
                Today
              </TabsTrigger>
              <TabsTrigger
                value="yesterday"
                className="rounded-md text-xs text-foreground/75 data-[state=active]:text-primary-foreground"
              >
                Yesterday
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className="rounded-md text-xs text-foreground/75 data-[state=active]:text-primary-foreground"
              >
                Range
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {datePreset === "custom" ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <span className="text-xs font-medium text-foreground">From</span>
            <DatePicker
              value={fromDate}
              onChange={(value) => {
                setFromDate(value);
                setPage(1);
              }}
              className="h-9 w-[9.5rem] border-border bg-background"
            />
            <span className="text-xs font-medium text-foreground">To</span>
            <DatePicker
              value={toDate}
              onChange={(value) => {
                setToDate(value);
                setPage(1);
              }}
              className="h-9 w-[9.5rem] border-border bg-background"
            />
          </div>
        ) : null}
      </div>

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
