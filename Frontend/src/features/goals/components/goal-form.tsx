"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { useWallets } from "@/features/wallets/hooks/use-wallets";
import { ApiError } from "@/lib/api-client";
import { useCreateGoal, useUpdateGoal } from "../hooks/use-goal-mutations";
import {
  goalSchema,
  toGoalPayload,
  type GoalFormValues,
} from "../schemas/goal-schema";
import type { GoalType } from "../types/goal-types";

type GoalFormProps = {
  goal?: GoalType | null;
  onDone?: () => void;
};

export function GoalForm({ goal, onDone }: GoalFormProps) {
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const isEditing = Boolean(goal);
  const { data: walletsData } = useWallets({ page: 1, limit: 100 });
  const wallets = walletsData?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      savedAmount: 0,
      deadline: "",
      walletId: "",
    },
  });

  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name,
        targetAmount: goal.targetAmount,
        savedAmount: goal.savedAmount,
        deadline: goal.deadline ?? "",
        walletId: goal.walletId ?? "",
      });
    } else {
      reset({
        name: "",
        targetAmount: 0,
        savedAmount: 0,
        deadline: "",
        walletId: "",
      });
    }
  }, [goal, reset]);

  const mutation = isEditing ? updateMutation : createMutation;
  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Unable to save goal"
        : null;

  const onSubmit = handleSubmit((values) => {
    const payload = toGoalPayload(values);
    if (goal) {
      updateMutation.mutate(
        {
          id: goal.id,
          data: {
            name: payload.name,
            targetAmount: payload.targetAmount,
            deadline: payload.deadline,
            walletId: payload.walletId,
          },
        },
        { onSuccess: () => onDone?.() },
      );
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => onDone?.() });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Name
        </label>
        <Input
          placeholder="Build PC"
          aria-invalid={Boolean(errors.name) || undefined}
          {...register("name")}
        />
        {errors.name ? (
          <p className="mt-1 text-error">{errors.name.message}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Target amount
        </label>
        <Controller
          name="targetAmount"
          control={control}
          render={({ field }) => (
            <MoneyInput
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              aria-invalid={Boolean(errors.targetAmount) || undefined}
            />
          )}
        />
        {errors.targetAmount ? (
          <p className="mt-1 text-error">{errors.targetAmount.message}</p>
        ) : null}
      </div>

      {!isEditing ? (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Already saved
          </label>
          <Controller
            name="savedAmount"
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
      ) : null}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Deadline <span className="font-normal text-muted">(optional)</span>
        </label>
        <Controller
          name="deadline"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value || ""}
              onChange={(value) => field.onChange(value ?? "")}
            />
          )}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Linked wallet <span className="font-normal text-muted">(optional)</span>
        </label>
        <Controller
          name="walletId"
          control={control}
          render={({ field }) => {
            const items = {
              __none: "None",
              ...Object.fromEntries(wallets.map((w) => [w.id, w.name])),
            };
            return (
              <Select
                value={field.value || "__none"}
                onValueChange={(value) =>
                  field.onChange(value === "__none" || !value ? "" : value)
                }
                items={items}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none" label="None">
                    None
                  </SelectItem>
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
      </div>

      {errorMessage ? <p className="text-error">{errorMessage}</p> : null}

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending
          ? "Saving…"
          : isEditing
            ? "Save changes"
            : "Create goal"}
      </Button>
    </form>
  );
}
