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
import { cn } from "@/lib/utils";
import {
  useCreateDebt,
  useUpdateDebt,
} from "../hooks/use-debt-mutations";
import { debtSchema, type DebtFormValues } from "../schemas/debt-schema";
import type { DebtDirectionEnum, DebtType } from "../types/debt-types";

const DIRECTION_OPTIONS: { value: DebtDirectionEnum; label: string }[] = [
  { value: "i_owe", label: "I owe" },
  { value: "owed_to_me", label: "Owed to me" },
];

function todayIsoDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

type DebtFormProps = {
  debt?: DebtType | null;
  onDone?: () => void;
};

export function DebtForm({ debt, onDone }: DebtFormProps) {
  const createMutation = useCreateDebt();
  const updateMutation = useUpdateDebt();
  const isEditing = Boolean(debt);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      personName: "",
      amount: 0,
      direction: "i_owe",
      dueDate: todayIsoDate(),
      note: "",
      autoRecord: false,
      walletId: "",
      categoryId: "",
    },
  });

  const direction = useWatch({ control, name: "direction" });
  const categoryType = direction === "i_owe" ? "expense" : "income";

  const { data: walletsData } = useWallets({ page: 1, limit: 100 });
  const { data: categoriesData } = useCategories({
    page: 1,
    limit: 100,
    type: categoryType,
  });
  const wallets = walletsData?.items ?? [];
  const categories = categoriesData?.items ?? [];

  useEffect(() => {
    if (debt) {
      reset({
        personName: debt.personName,
        amount: debt.amount,
        direction: debt.direction,
        dueDate: debt.dueDate.slice(0, 10),
        note: debt.note ?? "",
        autoRecord: debt.autoRecord,
        walletId: debt.walletId,
        categoryId: debt.categoryId,
      });
    } else {
      reset({
        personName: "",
        amount: 0,
        direction: "i_owe",
        dueDate: todayIsoDate(),
        note: "",
        autoRecord: false,
        walletId: "",
        categoryId: "",
      });
    }
  }, [debt, reset]);

  const mutation = isEditing ? updateMutation : createMutation;
  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Unable to save debt"
        : null;

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      autoRecord:
        values.direction === "owed_to_me" ? values.autoRecord : false,
    };

    if (debt) {
      updateMutation.mutate(
        { id: debt.id, data: payload },
        { onSuccess: () => onDone?.() },
      );
      return;
    }

    createMutation.mutate(payload, { onSuccess: () => onDone?.() });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">Type</span>
        <Controller
          control={control}
          name="direction"
          render={({ field }) => (
            <Tabs
              value={field.value}
              onValueChange={(value: string) => {
                field.onChange(value);
                setValue("categoryId", "");
                if (value === "i_owe") setValue("autoRecord", false);
              }}
              className="gap-0"
            >
              <TabsList className="h-9 w-full rounded-lg">
                {DIRECTION_OPTIONS.map((option) => (
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
        <label htmlFor="debt-person" className="text-label-md text-foreground">
          Person
        </label>
        <Input
          id="debt-person"
          className="h-10"
          placeholder="e.g. A, B, Minh"
          {...register("personName")}
        />
        {errors.personName ? (
          <p className="text-error">{errors.personName.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="debt-amount" className="text-label-md text-foreground">
          Amount
        </label>
        <Input
          id="debt-amount"
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

      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">Due date</span>
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              aria-invalid={Boolean(errors.dueDate) || undefined}
            />
          )}
        />
        {errors.dueDate ? (
          <p className="text-error">{errors.dueDate.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">Wallet</span>
        <Controller
          control={control}
          name="walletId"
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
                <SelectTrigger>
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
            const items = Object.fromEntries(
              categories.map((c) => [c.id, c.name]),
            );
            return (
              <Select
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? "")}
                items={items}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      No {categoryType} categories
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
        <label htmlFor="debt-note" className="text-label-md text-foreground">
          Note
        </label>
        <Input
          id="debt-note"
          className="h-10"
          placeholder="Optional"
          {...register("note")}
        />
      </div>

      {direction === "owed_to_me" ? (
        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-3",
          )}
        >
          <Controller
            control={control}
            name="autoRecord"
            render={({ field }) => (
              <input
                type="checkbox"
                className="mt-1 size-4 accent-[var(--primary)]"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
              />
            )}
          />
          <span>
            <span className="block text-sm font-medium text-foreground">
              Auto-add income on due date
            </span>
            <span className="mt-0.5 block text-caption text-muted-foreground">
              When the date arrives, create income and credit the wallet
              automatically.
            </span>
          </span>
        </label>
      ) : (
        <p className="rounded-xl bg-secondary/60 px-3 py-2 text-caption text-muted-foreground">
          You’ll get a reminder to pay. Money is only deducted when you tap
          “Mark paid”.
        </p>
      )}

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
