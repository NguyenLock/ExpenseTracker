"use client";

import {
  Calculator,
  CircleDollarSign,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  originFromElement,
  type OriginRect,
} from "@/components/origin-modal";
import { formatMoneyDots } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useDeleteGoal } from "../hooks/use-goal-mutations";
import type { GoalType } from "../types/goal-types";

function formatMoney(value: number) {
  return formatMoneyDots(value) || "0";
}

type GoalListProps = {
  goals: GoalType[];
  onEdit: (goal: GoalType, origin: OriginRect) => void;
  onContribute: (goal: GoalType, origin: OriginRect) => void;
  onPlan: (goal: GoalType, origin: OriginRect) => void;
};

export function GoalList({
  goals,
  onEdit,
  onContribute,
  onPlan,
}: GoalListProps) {
  const deleteMutation = useDeleteGoal();
  const [pendingDelete, setPendingDelete] = useState<GoalType | null>(null);
  const [deleteOrigin, setDeleteOrigin] = useState<OriginRect | null>(null);

  if (goals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-sm">
        <p className="text-body-md text-foreground">No saving goals yet.</p>
        <p className="mt-1 text-caption text-muted-foreground">
          Set a target (e.g. Build PC) and track monthly progress.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {goals.map((goal) => {
          const done = goal.status === "completed";
          const width = Math.min(goal.percentSaved, 100);

          return (
            <li
              key={goal.id}
              className="rounded-xl bg-surface px-4 py-3.5 shadow-sm ring-1 ring-border"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {goal.name}
                    {done ? (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        Done
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-caption text-muted-foreground">
                    {formatMoney(goal.savedAmount)} /{" "}
                    {formatMoney(goal.targetAmount)}
                    {goal.deadline ? ` · by ${goal.deadline}` : ""}
                    {goal.suggestedMonthly != null && !done
                      ? ` · ~${formatMoney(goal.suggestedMonthly)}/mo`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <span
                    className={cn(
                      "mr-1 text-xs font-semibold",
                      done ? "text-primary" : "text-foreground",
                    )}
                  >
                    {goal.percentSaved}%
                  </span>
                  {!done ? (
                    <>
                      <button
                        type="button"
                        onClick={(event) =>
                          onContribute(
                            goal,
                            originFromElement(event.currentTarget),
                          )
                        }
                        className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-background hover:text-foreground"
                        aria-label="Contribute"
                        title="Contribute"
                      >
                        <CircleDollarSign className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) =>
                          onPlan(goal, originFromElement(event.currentTarget))
                        }
                        className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-background hover:text-foreground"
                        aria-label="Plan"
                        title="Plan"
                      >
                        <Calculator className="size-4" />
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={(event) =>
                      onEdit(goal, originFromElement(event.currentTarget))
                    }
                    className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-background hover:text-foreground"
                    aria-label="Edit goal"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      setDeleteOrigin(originFromElement(event.currentTarget));
                      setPendingDelete(goal);
                    }}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-danger/10 hover:text-danger"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    done ? "bg-primary" : "bg-primary",
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        origin={deleteOrigin}
        title="Delete goal?"
        description="Progress and contribution history for this goal will be removed. Wallet transactions stay."
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
