"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
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
import type { TransactionTypeEnum } from "@/features/transactions/types/transaction-types";
import { useWallets } from "@/features/wallets/hooks/use-wallets";
import { ApiError } from "@/lib/api-client";
import {
  useCreateTransactionTemplate,
  useUpdateTransactionTemplate,
} from "../hooks/use-transaction-template-mutations";
import {
  transactionTemplateSchema,
  type TransactionTemplateFormValues,
} from "../schemas/transaction-template-schema";
import type { TransactionTemplateType } from "../types/transaction-template-types";

const TYPE_OPTIONS: { value: TransactionTypeEnum; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

type TemplateFormProps = {
  template?: TransactionTemplateType | null;
  defaultType?: TransactionTypeEnum;
  onDone?: () => void;
};

export function TransactionTemplateForm({
  template,
  defaultType = "expense",
  onDone,
}: TemplateFormProps) {
  const createMutation = useCreateTransactionTemplate();
  const updateMutation = useUpdateTransactionTemplate();
  const isEditing = Boolean(template);
  const noteEditedRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionTemplateFormValues>({
    resolver: zodResolver(transactionTemplateSchema),
    defaultValues: {
      label: "",
      type: "expense",
      amount: 0,
      walletId: "",
      categoryId: "",
      note: "",
    },
  });

  const selectedType = useWatch({ control, name: "type" });
  const labelValue = useWatch({ control, name: "label" });
  const { data: walletsData } = useWallets({ page: 1, limit: 100 });
  const { data: categoriesData } = useCategories({
    page: 1,
    limit: 100,
    type: selectedType,
  });

  const wallets = walletsData?.items ?? [];
  const categories = categoriesData?.items ?? [];

  useEffect(() => {
    noteEditedRef.current = false;
    if (template) {
      reset({
        label: template.label,
        type: template.type,
        amount: template.amount,
        walletId: template.walletId,
        categoryId: template.categoryId,
        note: template.note ?? template.label,
      });
      noteEditedRef.current = Boolean(
        template.note && template.note !== template.label,
      );
    } else {
      reset({
        label: "",
        type: defaultType,
        amount: 0,
        walletId: "",
        categoryId: "",
        note: "",
      });
    }
  }, [template, defaultType, reset]);

  useEffect(() => {
    if (noteEditedRef.current) return;
    setValue("note", labelValue ?? "");
  }, [labelValue, setValue]);

  const mutation = isEditing ? updateMutation : createMutation;
  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Unable to save shortcut"
        : null;

  const onSubmit = handleSubmit((values) => {
    const payload = {
      ...values,
      note: values.note?.trim() || values.label.trim(),
    };

    if (template) {
      updateMutation.mutate(
        { id: template.id, data: payload },
        { onSuccess: () => onDone?.() },
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: () => onDone?.(),
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="shortcut-label" className="text-label-md text-foreground">
          Label
        </label>
        <Input
          id="shortcut-label"
          className="h-10"
          placeholder="e.g. Cà phê sáng, Lương tháng"
          {...register("label")}
        />
        {errors.label ? (
          <p className="text-error">{errors.label.message}</p>
        ) : null}
      </div>

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
          htmlFor="shortcut-amount"
          className="text-label-md text-foreground"
        >
          Amount
        </label>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <MoneyInput
              id="shortcut-amount"
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
                <SelectTrigger aria-invalid={Boolean(errors.walletId) || undefined}>
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
        <label htmlFor="shortcut-note" className="text-label-md text-foreground">
          Note
        </label>
        <Input
          id="shortcut-note"
          className="h-10"
          placeholder="Defaults to label"
          {...register("note", {
            onChange: () => {
              noteEditedRef.current = true;
            },
          })}
        />
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
