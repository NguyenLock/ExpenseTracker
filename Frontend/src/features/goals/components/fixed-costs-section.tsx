"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { ApiError } from "@/lib/api-client";
import { formatMoneyDots } from "@/lib/money";
import {
  useCreateFixedCost,
  useDeleteFixedCost,
  useUpdateFixedCost,
} from "../hooks/use-goal-mutations";
import { useFixedCosts } from "../hooks/use-goals";
import {
  fixedCostSchema,
  type FixedCostFormValues,
} from "../schemas/goal-schema";

function formatMoney(value: number) {
  return formatMoneyDots(value) || "0";
}

export function FixedCostsSection() {
  const { data: items = [], isLoading } = useFixedCosts();
  const createMutation = useCreateFixedCost();
  const updateMutation = useUpdateFixedCost();
  const deleteMutation = useDeleteFixedCost();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FixedCostFormValues>({
    resolver: zodResolver(fixedCostSchema),
    defaultValues: { label: "", amount: 0, isActive: true },
  });

  const errorMessage =
    createMutation.error instanceof ApiError
      ? createMutation.error.message
      : createMutation.error
        ? "Unable to save"
        : null;

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(
      {
        label: values.label.trim(),
        amount: values.amount,
        isActive: true,
      },
      {
        onSuccess: () => {
          reset({ label: "", amount: 0, isActive: true });
          setOpen(false);
        },
      },
    );
  });

  return (
    <section className="rounded-xl bg-surface px-4 py-4 shadow-sm ring-1 ring-border">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Fixed costs</h3>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Monthly must-pays not in Debts (e.g. rent) — used by Goal Plan.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground hover:bg-background"
        >
          <Plus className="size-3.5" />
          Add
        </button>
      </div>

      {open ? (
        <form
          onSubmit={onSubmit}
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start"
        >
          <div className="min-w-0 flex-1">
            <Input placeholder="Tiền nhà" {...register("label")} />
            {errors.label ? (
              <p className="mt-1 text-error">{errors.label.message}</p>
            ) : null}
          </div>
          <div className="w-full sm:w-40">
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <MoneyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  placeholder="3.000.000"
                />
              )}
            />
            {errors.amount ? (
              <p className="mt-1 text-error">{errors.amount.message}</p>
            ) : null}
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={createMutation.isPending}
            className="sm:mt-0.5"
          >
            Save
          </Button>
        </form>
      ) : null}

      {errorMessage ? (
        <p className="mt-2 text-error">{errorMessage}</p>
      ) : null}

      {isLoading ? (
        <p className="mt-3 text-caption text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-3 text-caption text-muted-foreground">
          None yet — add rent so Plan knows your committed spend.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p
                  className={
                    item.isActive
                      ? "text-sm font-medium text-foreground"
                      : "text-sm text-muted-foreground line-through"
                  }
                >
                  {item.label}
                </p>
                <p className="text-caption text-muted-foreground">
                  {formatMoney(item.amount)}/mo
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    updateMutation.mutate({
                      id: item.id,
                      data: { isActive: !item.isActive },
                    })
                  }
                  className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5"
                >
                  {item.isActive ? "Off" : "On"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-danger/10 hover:text-danger"
                  aria-label="Delete fixed cost"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
