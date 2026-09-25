"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { MoneyInput } from "@/components/ui/money-input";
import { ApiError } from "@/lib/api-client";
import { formatMoneyDots } from "@/lib/money";
import { cn } from "@/lib/utils";
import { usePlanGoal, useUpdateGoal } from "../hooks/use-goal-mutations";
import { useFixedCosts } from "../hooks/use-goals";
import { planSchema, type PlanFormValues } from "../schemas/goal-schema";
import type { GoalPlanType, GoalType } from "../types/goal-types";

function formatMoney(value: number) {
  return formatMoneyDots(value) || "0";
}

type GoalPlanPanelProps = {
  goal: GoalType;
  onDone?: () => void;
};

export function GoalPlanPanel({ goal, onDone }: GoalPlanPanelProps) {
  const planMutation = usePlanGoal();
  const updateMutation = useUpdateGoal();
  const { data: fixedCosts = [] } = useFixedCosts();
  const [result, setResult] = useState<GoalPlanType | null>(null);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      monthlyIncome: 0,
      extraFixed: 0,
      useDebts: true,
    },
  });
  const useDebts = watch("useDebts");

  const errorMessage =
    planMutation.error instanceof ApiError
      ? planMutation.error.message
      : planMutation.error
        ? "Unable to plan"
        : null;

  const activeFixed = fixedCosts.filter((f) => f.isActive);
  const fixedSum = activeFixed.reduce((sum, f) => sum + f.amount, 0);

  const onSubmit = handleSubmit((values) => {
    planMutation.mutate(
      { id: goal.id, data: values },
      { onSuccess: (data) => setResult(data) },
    );
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-caption text-muted-foreground">
        Compares required monthly save vs what’s left after rent (fixed costs)
        and open debts you owe.
      </p>

      {activeFixed.length > 0 ? (
        <p className="rounded-lg bg-secondary/60 px-3 py-2 text-caption text-muted-foreground">
          Fixed costs: {formatMoney(fixedSum)}
          {" · "}
          {activeFixed.map((f) => f.label).join(", ")}
        </p>
      ) : (
        <p className="text-caption text-muted-foreground">
          No fixed costs yet — add “Tiền nhà” below on the Goals page for
          better plans.
        </p>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Monthly income
          </label>
          <Controller
            name="monthlyIncome"
            control={control}
            render={({ field }) => (
              <MoneyInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                aria-invalid={Boolean(errors.monthlyIncome) || undefined}
              />
            )}
          />
          {errors.monthlyIncome ? (
            <p className="mt-1 text-error">{errors.monthlyIncome.message}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Extra fixed this month{" "}
            <span className="font-normal text-muted">(optional)</span>
          </label>
          <Controller
            name="extraFixed"
            control={control}
            render={({ field }) => (
              <MoneyInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            )}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            className="size-4 accent-[var(--primary)]"
            checked={useDebts}
            onChange={(event) => setValue("useDebts", event.target.checked)}
          />
          Include open debts (I owe)
        </label>
        {errorMessage ? <p className="text-error">{errorMessage}</p> : null}
        <Button type="submit" disabled={planMutation.isPending}>
          {planMutation.isPending ? "Calculating…" : "Calculate plan"}
        </Button>
      </form>

      {result ? (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-2 text-caption">
            <Stat label="Remaining" value={formatMoney(result.remaining)} />
            <Stat
              label="Need / mo"
              value={
                result.requiredMonthly != null
                  ? formatMoney(result.requiredMonthly)
                  : "—"
              }
            />
            <Stat
              label="Committed"
              value={formatMoney(result.committedTotal)}
            />
            <Stat
              label="Available"
              value={formatMoney(result.availableMonthly)}
            />
          </div>

          <ul className="flex flex-col gap-2">
            {result.scenarios.map((scenario) => (
              <li
                key={scenario.kind}
                className={cn(
                  "rounded-xl px-3 py-3 ring-1 ring-border",
                  scenario.kind === "on_track"
                    ? "bg-primary/5"
                    : scenario.kind === "blocked"
                      ? "bg-danger/5"
                      : "bg-surface",
                )}
              >
                <p className="text-sm font-medium text-foreground">
                  {scenario.label}
                </p>
                <p className="mt-1 text-caption text-muted-foreground">
                  {scenario.message}
                </p>
                {scenario.kind === "defer_deadline" &&
                scenario.suggestedDeadline ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled={updateMutation.isPending}
                    onClick={() => {
                      updateMutation.mutate(
                        {
                          id: goal.id,
                          data: { deadline: scenario.suggestedDeadline },
                        },
                        { onSuccess: () => onDone?.() },
                      );
                    }}
                  >
                    Apply deadline {scenario.suggestedDeadline}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 px-2.5 py-2">
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold text-foreground">{value}</p>
    </div>
  );
}
