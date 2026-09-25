"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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
import {
  useCreateTransaction,
  useUpdateTransaction,
} from "../hooks/use-transaction-mutations";
import {
  transactionSchema,
  type TransactionFormValues,
} from "../schemas/transaction-schema";
import type {
  TransactionType,
  TransactionTypeEnum,
} from "../types/transaction-types";

const TYPE_OPTIONS: { value: TransactionTypeEnum; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

type TransactionFormProps = {
  transaction?: TransactionType | null;
  onDone?: () => void;
  onCreated?: (transaction: TransactionType) => void;
};

export function TransactionForm({
  transaction,
  onDone,
  onCreated,
}: TransactionFormProps) {
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const isEditing = Boolean(transaction);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      walletId: "",
      categoryId: "",
      transactionDate: todayIsoDate(),
      note: "",
    },
  });

  const selectedType = useWatch({ control, name: "type" });

  const { data: walletsData } = useWallets({ page: 1, limit: 100 });
  const { data: categoriesData } = useCategories({
    page: 1,
    limit: 100,
    type: selectedType,
  });

  const wallets = walletsData?.items ?? [];
  const categories = categoriesData?.items ?? [];

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        amount: transaction.amount,
        walletId: transaction.walletId,
        categoryId: transaction.categoryId,
        transactionDate: transaction.transactionDate.slice(0, 10),
        note: transaction.note ?? "",
      });
    } else {
      reset({
        type: "expense",
        amount: 0,
        walletId: "",
        categoryId: "",
        transactionDate: todayIsoDate(),
        note: "",
      });
    }
  }, [transaction, reset]);

  const mutation = isEditing ? updateMutation : createMutation;
  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Unable to save transaction"
        : null;

  const onSubmit = handleSubmit((values) => {
    if (transaction) {
      updateMutation.mutate(
        { id: transaction.id, data: values },
        { onSuccess: () => onDone?.() },
      );
      return;
    }

    createMutation.mutate(values, {
      onSuccess: (created) => {
        onCreated?.(created);
        onDone?.();
      },
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">Type</span>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Tabs
              value={field.value}
              onValueChange={(value: string) => {
                field.onChange(value);
                setValue("categoryId", "");
              }}
              className="gap-0"
            >
              <TabsList className="h-9 w-full rounded-lg">
                {TYPE_OPTIONS.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className="rounded-md text-xs"
                  >
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="transaction-amount"
          className="text-label-md text-foreground"
        >
          Amount
        </label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <MoneyInput
              id="transaction-amount"
              className="h-10"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          )}
        />
        {errors.amount ? (
          <p className="text-error">{errors.amount.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">Wallet</span>
        <Controller
          control={control}
          name="walletId"
          render={({ field }) => {
            const walletItems = Object.fromEntries(
              wallets.map((wallet) => [wallet.id, wallet.name]),
            );

            return (
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                items={walletItems}
              >
                <SelectTrigger
                  id="transaction-wallet"
                  aria-invalid={Boolean(errors.walletId) || undefined}
                >
                  <SelectValue placeholder="Select wallet" />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id} label={wallet.name}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.walletId ? (
          <p className="text-error">{errors.walletId.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">Category</span>
        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => {
            const categoryItems = Object.fromEntries(
              categories.map((category) => [category.id, category.name]),
            );

            return (
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                items={categoryItems}
              >
                <SelectTrigger
                  id="transaction-category"
                  aria-invalid={Boolean(errors.categoryId) || undefined}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      No categories for this type
                    </div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        label={category.name}
                      >
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.categoryId ? (
          <p className="text-error">{errors.categoryId.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">Date</span>
        <Controller
          control={control}
          name="transactionDate"
          render={({ field }) => (
            <DatePicker
              id="transaction-date"
              value={field.value}
              onChange={field.onChange}
              aria-invalid={Boolean(errors.transactionDate) || undefined}
            />
          )}
        />
        {errors.transactionDate ? (
          <p className="text-error">{errors.transactionDate.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="transaction-note"
          className="text-label-md text-foreground"
        >
          Note
        </label>
        <Input
          id="transaction-note"
          className="h-10"
          placeholder="Optional"
          {...register("note")}
        />
        {errors.note ? <p className="text-error">{errors.note.message}</p> : null}
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
