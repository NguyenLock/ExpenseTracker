"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { ApiError } from "@/lib/api-client";
import {
  useCreateBudget,
  useUpdateBudget,
} from "../hooks/use-budget-mutations";
import { budgetSchema, type BudgetFormValues } from "../schemas/budget-schema";
import type { BudgetType } from "../types/budget-types";

type BudgetFormProps = {
  budget?: BudgetType | null;
  month: string;
  onDone?: () => void;
};

export function BudgetForm({ budget, month, onDone }: BudgetFormProps) {
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const isEditing = Boolean(budget);
  const { data: categoriesData } = useCategories({
    page: 1,
    limit: 100,
    type: "expense",
  });
  const categories = categoriesData?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      isOverall: false,
      categoryId: "",
      amount: 0,
      month,
    },
  });

  const isOverall = useWatch({ control, name: "isOverall" });

  useEffect(() => {
    if (budget) {
      reset({
        isOverall: budget.isOverall || budget.categoryId == null,
        categoryId: budget.categoryId ?? "",
        amount: budget.amount,
        month: budget.month,
      });
    } else {
      reset({ isOverall: false, categoryId: "", amount: 0, month });
    }
  }, [budget, month, reset]);

  const mutation = isEditing ? updateMutation : createMutation;
  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Unable to save budget"
        : null;

  const onSubmit = handleSubmit((values) => {
    if (budget) {
      updateMutation.mutate(
        { id: budget.id, data: { amount: values.amount } },
        { onSuccess: () => onDone?.() },
      );
      return;
    }
    createMutation.mutate(
      {
        amount: values.amount,
        month: values.month,
        categoryId: values.isOverall ? null : values.categoryId || null,
      },
      { onSuccess: () => onDone?.() },
    );
  });

  const categoryItems = Object.fromEntries(
    categories.map((c) => [c.id, c.name]),
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {!isEditing ? (
        <>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-3">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-[var(--primary)]"
              checked={isOverall}
              onChange={(event) => {
                const checked = event.target.checked;
                setValue("isOverall", checked);
                if (checked) setValue("categoryId", "");
              }}
            />
            <span>
              <span className="block text-sm font-medium text-foreground">
                Overall monthly limit
              </span>
              <span className="mt-0.5 block text-caption text-muted-foreground">
                Cap total spending for the month (all expense categories).
              </span>
            </span>
          </label>

          {!isOverall ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-label-md text-foreground">Category</span>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                    items={categoryItems}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Expense category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          label={category.name}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId ? (
                <p className="text-error">{errors.categoryId.message}</p>
              ) : null}
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {budget?.isOverall || budget?.categoryId == null
            ? "Overall · all expenses"
            : (budget?.categoryName ?? "Category")}{" "}
          · {budget?.month}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="budget-amount" className="text-label-md text-foreground">
          Monthly limit
        </label>
        <Input
          id="budget-amount"
          type="number"
          step="0.01"
          min="0.01"
          className="h-10"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount ? (
          <p className="text-error">{errors.amount.message}</p>
        ) : null}
      </div>

      {errorMessage ? <p className="text-error">{errorMessage}</p> : null}

      <div className="mt-1 flex gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          className="h-10 flex-1"
          onClick={onDone}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="h-10 flex-1"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving…" : isEditing ? "Save" : "Create"}
        </Button>
      </div>
    </form>
  );
}
