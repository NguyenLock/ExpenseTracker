"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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
import { formatMoneyDots } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  useCreateDebt,
  useUpdateDebt,
} from "../hooks/use-debt-mutations";
import {
  debtSchema,
  toDebtPayload,
  type DebtFormValues,
} from "../schemas/debt-schema";
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

function formatMoney(value: number) {
  return formatMoneyDots(value) || "0";
}

type DebtFormProps = {
  debt?: DebtType | null;
  onDone?: () => void;
};

export function DebtForm({ debt, onDone }: DebtFormProps) {
  const createMutation = useCreateDebt();
  const updateMutation = useUpdateDebt();
  const isEditing = Boolean(debt);
  const [useInstallment, setUseInstallment] = useState(false);

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
      installmentCount: 1,
      payWindowStartDay: undefined,
      payWindowEndDay: undefined,
      note: "",
      autoRecord: false,
      walletId: "",
      categoryId: "",
    },
  });

  const direction = useWatch({ control, name: "direction" });
  const monthlyAmount = useWatch({ control, name: "amount" });
  const installmentCount = useWatch({ control, name: "installmentCount" });
  const categoryType = direction === "i_owe" ? "expense" : "income";
  const months = Math.max(1, Number(installmentCount) || 1);
  const totalPreview =
    useInstallment &&
    typeof monthlyAmount === "number" &&
    !Number.isNaN(monthlyAmount) &&
    monthlyAmount > 0 &&
    months > 1
      ? Math.round(monthlyAmount * months * 100) / 100
      : null;

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
      const installment =
        (debt.installmentCount ?? 1) > 1 ||
        debt.payWindowStartDay != null ||
        debt.payWindowEndDay != null;
      setUseInstallment(installment);
      reset({
        personName: debt.personName,
        amount: debt.amount,
        direction: debt.direction,
        dueDate: debt.dueDate.slice(0, 10),
        installmentCount: debt.installmentCount ?? 1,
        payWindowStartDay: debt.payWindowStartDay ?? undefined,
        payWindowEndDay: debt.payWindowEndDay ?? undefined,
        note: debt.note ?? "",
        autoRecord: debt.autoRecord,
        walletId: debt.walletId,
        categoryId: debt.categoryId,
      });
    } else {
      setUseInstallment(false);
      reset({
        personName: "",
        amount: 0,
        direction: "i_owe",
        dueDate: todayIsoDate(),
        installmentCount: 1,
        payWindowStartDay: undefined,
        payWindowEndDay: undefined,
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
    const payload = toDebtPayload(
      useInstallment
        ? values
        : {
            ...values,
            installmentCount: 1,
            payWindowStartDay: undefined,
            payWindowEndDay: undefined,
          },
    );

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
          {useInstallment ? "Số tiền mỗi tháng" : "Số tiền"}
        </label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <MoneyInput
              id="debt-amount"
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
        {totalPreview != null ? (
          <p className="text-caption text-muted-foreground">
            Tổng {months} tháng: {formatMoney(totalPreview)}
          </p>
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

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3 py-3">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-[var(--primary)]"
          checked={useInstallment}
          onChange={(event) => {
            const checked = event.target.checked;
            setUseInstallment(checked);
            if (!checked) {
              setValue("installmentCount", 1);
              setValue("payWindowStartDay", undefined);
              setValue("payWindowEndDay", undefined);
            } else if ((installmentCount ?? 1) <= 1) {
              setValue("installmentCount", 3);
            }
          }}
        />
        <span>
          <span className="block text-sm font-medium text-foreground">
            Trả góp
          </span>
          <span className="mt-0.5 block text-caption text-muted-foreground">
            Giống Shopee Pay — nhiều tháng, cửa sổ trả nợ.
          </span>
        </span>
      </label>

      {useInstallment ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="debt-installments"
                className="text-label-md text-foreground"
              >
                Số tháng
              </label>
              <Input
                id="debt-installments"
                type="number"
                min="2"
                max="60"
                step="1"
                className="h-10"
                {...register("installmentCount", { valueAsNumber: true })}
              />
              {errors.installmentCount ? (
                <p className="text-error">{errors.installmentCount.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="debt-window-start"
                className="text-label-md text-foreground"
              >
                Trả từ ngày
              </label>
              <Input
                id="debt-window-start"
                type="number"
                min="1"
                max="28"
                step="1"
                className="h-10"
                placeholder="24"
                {...register("payWindowStartDay", { valueAsNumber: true })}
              />
              {errors.payWindowStartDay ? (
                <p className="text-error">{errors.payWindowStartDay.message}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="debt-window-end"
                className="text-label-md text-foreground"
              >
                Đến ngày
              </label>
              <Input
                id="debt-window-end"
                type="number"
                min="1"
                max="28"
                step="1"
                className="h-10"
                placeholder="10"
                {...register("payWindowEndDay", { valueAsNumber: true })}
              />
              {errors.payWindowEndDay ? (
                <p className="text-error">{errors.payWindowEndDay.message}</p>
              ) : null}
            </div>
          </div>
          <p className="text-caption text-muted-foreground">
            Vd: từ ngày 24 đến ngày 10 tháng sau. Để trống cửa sổ = chỉ dùng
            due date.
          </p>
        </div>
      ) : null}

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
              When each installment window ends, create income and credit the
              wallet automatically.
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
