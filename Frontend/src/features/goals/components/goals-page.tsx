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
import { useGoals } from "../hooks/use-goals";
import type { GoalStatusEnum, GoalType } from "../types/goal-types";
import { ContributeForm } from "./contribute-form";
import { FixedCostsSection } from "./fixed-costs-section";
import { GoalForm } from "./goal-form";
import { GoalList } from "./goal-list";
import { GoalPlanPanel } from "./goal-plan-panel";

type StatusTab = "active" | "completed" | "all";
type ModalMode = "create" | "edit" | "contribute" | "plan" | null;

export function GoalsPage() {
  const [tab, setTab] = useState<StatusTab>("active");
  const [mode, setMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<GoalType | null>(null);
  const [modalOrigin, setModalOrigin] = useState<OriginRect | null>(null);

  const statusFilter: GoalStatusEnum | undefined =
    tab === "all" ? undefined : tab;

  const { data = [], isLoading, isError, error, isFetching } = useGoals(
    statusFilter,
  );

  const closeModal = () => {
    setMode(null);
    setSelected(null);
  };

  const title =
    mode === "edit"
      ? "Edit goal"
      : mode === "contribute"
        ? "Contribute"
        : mode === "plan"
          ? "Plan"
          : "New goal";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-h1 text-foreground">Saving goals</h2>
          <p className="mt-1 text-body-md text-muted">
            Target + deadline → suggested monthly. Contribute from a wallet;
            Plan checks rent & debts first.
          </p>
        </div>
        <button
          type="button"
          onClick={(event) => {
            setModalOrigin(originFromElement(event.currentTarget));
            setSelected(null);
            setMode("create");
          }}
          className="inline-flex h-button-md items-center justify-center gap-2 rounded-xl bg-primary px-4 text-button-md text-white transition hover:opacity-95 active:scale-[0.98]"
        >
          <Plus className="size-4" />
          Add goal
        </button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value: string) => setTab(value as StatusTab)}
        className="gap-4"
      >
        <TabsList className="h-9 w-full max-w-xs rounded-lg sm:w-auto">
          <TabsTrigger value="active" className="rounded-md text-xs">
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-md text-xs">
            Done
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-md text-xs">
            All
          </TabsTrigger>
        </TabsList>

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
            <GoalList
              goals={data}
              onEdit={(goal, origin) => {
                setModalOrigin(origin);
                setSelected(goal);
                setMode("edit");
              }}
              onContribute={(goal, origin) => {
                setModalOrigin(origin);
                setSelected(goal);
                setMode("contribute");
              }}
              onPlan={(goal, origin) => {
                setModalOrigin(origin);
                setSelected(goal);
                setMode("plan");
              }}
            />
          </div>
        )}
      </Tabs>

      <FixedCostsSection />

      <OriginModal
        open={mode != null}
        origin={modalOrigin}
        onClose={closeModal}
        className="max-w-md max-h-[min(90vh,40rem)] overflow-y-auto"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-h4 text-foreground">{title}</h3>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-foreground"
            aria-label="Close"
          >
            <X className="size-4 stroke-[2.25]" />
          </button>
        </div>
        {mode === "create" || mode === "edit" ? (
          <GoalForm goal={selected} onDone={closeModal} />
        ) : null}
        {mode === "contribute" && selected ? (
          <ContributeForm goal={selected} onDone={closeModal} />
        ) : null}
        {mode === "plan" && selected ? (
          <GoalPlanPanel goal={selected} onDone={closeModal} />
        ) : null}
      </OriginModal>
    </div>
  );
}
