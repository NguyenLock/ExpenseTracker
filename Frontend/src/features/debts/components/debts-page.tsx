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
import { TableSkeleton } from "@/components/table-skeleton";
import { useDebts } from "../hooks/use-debts";
import type { DebtStatusEnum, DebtType } from "../types/debt-types";
import { DebtForm } from "./debt-form";
import { DebtList } from "./debt-list";

type StatusTab = "open" | "settled" | "all";

export function DebtsPage() {
  const [tab, setTab] = useState<StatusTab>("open");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<DebtType | null>(null);
  const [modalOrigin, setModalOrigin] = useState<OriginRect | null>(null);

  const statusFilter: DebtStatusEnum | undefined =
    tab === "all" ? undefined : tab;

  const { data = [], isLoading, isError, error, isFetching } = useDebts({
    status: statusFilter,
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
          <h2 className="text-h1 text-foreground">Debts</h2>
          <p className="mt-1 text-body-md text-muted">
            One-shot or installment plans (e.g. 3 months, pay day 24→10) — auto
            closes when paid off.
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
          Add debt
        </button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value: string) => setTab(value as StatusTab)}
        className="gap-4"
      >
        <TabsList className="h-9 w-full max-w-xs rounded-lg sm:w-auto">
          <TabsTrigger value="open" className="rounded-md text-xs">
            Open
          </TabsTrigger>
          <TabsTrigger value="settled" className="rounded-md text-xs">
            Settled
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-md text-xs">
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <TableSkeleton columns={3} rows={4} />
      ) : isError ? (
        <p className="text-error">
          {error instanceof Error ? error.message : "Failed to load"}
        </p>
      ) : (
        <div className={isFetching ? "opacity-70 transition-opacity" : undefined}>
          <DebtList
            debts={data}
            onEdit={(debt, origin) => {
              setModalOrigin(origin);
              setCreating(false);
              setEditing(debt);
            }}
          />
        </div>
      )}

      <OriginModal
        open={modalOpen}
        origin={modalOrigin}
        onClose={closeModal}
        className="max-w-lg"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-h4 text-foreground">
            {editing ? "Edit debt" : "New debt"}
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
        <DebtForm debt={editing} onDone={closeModal} />
      </OriginModal>
    </div>
  );
}
