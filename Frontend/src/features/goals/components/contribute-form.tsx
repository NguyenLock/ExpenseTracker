"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useWallets } from "@/features/wallets/hooks/use-wallets";
import { ApiError } from "@/lib/api-client";
import { useContributeGoal } from "../hooks/use-goal-mutations";
import {
  contributeSchema,
  type ContributeFormValues,
} from "../schemas/goal-schema";
import type { GoalType } from "../types/goal-types";

type ContributeFormProps = {
  goal: GoalType;
  onDone?: () => void;
};

export function ContributeForm({ goal, onDone }: ContributeFormProps) {
  const mutation = useContributeGoal();
  const { data: walletsData } = useWallets({ page: 1, limit: 100 });
  const { data: categoriesData } = useCategories({
    page: 1,
    limit: 100,
    type: "expense",
  });
  const wallets = walletsData?.items ?? [];
  const categories = categoriesData?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContributeFormValues>({
    resolver: zodResolver(contributeSchema),
    defaultValues: {
      amount: goal.suggestedMonthly ?? 0,
      fromWalletId: goal.walletId ?? "",
      categoryId: "",
      note: "",
    },
  });

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Unable to contribute"
        : null;

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(
      {
        id: goal.id,
        data: {
          amount: values.amount,
          fromWalletId: values.fromWalletId,
          categoryId: values.categoryId,
          note: values.note?.trim() || undefined,
        },
      },
      { onSuccess: () => onDone?.() },
    );
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <p className="text-caption text-muted-foreground">
        Deducts from wallet and records an expense — progress on{" "}
        <span className="font-medium text-foreground">{goal.name}</span>{" "}
        updates.
      </p>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Amount
        </label>
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
              aria-invalid={Boolean(errors.amount) || undefined}
            />
          )}
        />
        {errors.amount ? (
          <p className="mt-1 text-error">{errors.amount.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          From wallet
        </label>
        <Controller
          name="fromWalletId"
          control={control}
          render={({ field }) => {
            const items = Object.fromEntries(
              wallets.map((w) => [w.id, w.name]),
            );
            return (
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                items={items}
              >
                <SelectTrigger
                  aria-invalid={Boolean(errors.fromWalletId) || undefined}
                >
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem
                      key={wallet.id}
                      value={wallet.id}
                      label={wallet.name}
                    >
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.fromWalletId ? (
          <p className="mt-1 text-error">{errors.fromWalletId.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Expense category
        </label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => {
            const items = Object.fromEntries(
              categories.map((c) => [c.id, c.name]),
            );
            return (
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                items={items}
              >
                <SelectTrigger
                  aria-invalid={Boolean(errors.categoryId) || undefined}
                >
                  <SelectValue placeholder="Select category" />
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
            );
          }}
        />
        {errors.categoryId ? (
          <p className="mt-1 text-error">{errors.categoryId.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Note <span className="font-normal text-muted">(optional)</span>
        </label>
        <Input placeholder={`Saving: ${goal.name}`} {...register("note")} />
      </div>

      {errorMessage ? <p className="text-error">{errorMessage}</p> : null}

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Contributing…" : "Contribute"}
      </Button>
    </form>
  );
}
