"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";
import {
  useCreateWallet,
  useUpdateWallet,
} from "../hooks/use-wallet-mutations";
import {
  walletSchema,
  type WalletFormValues,
} from "../schemas/wallet-schema";
import type { WalletType, WalletTypeEnum } from "../types/wallet-types";

const TYPE_OPTIONS: { value: WalletTypeEnum; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank" },
  { value: "ewallet", label: "E-wallet" },
];

type WalletFormProps = {
  wallet?: WalletType | null;
  onDone?: () => void;
  onCreated?: (wallet: WalletType) => void;
};

export function WalletForm({ wallet, onDone, onCreated }: WalletFormProps) {
  const createMutation = useCreateWallet();
  const updateMutation = useUpdateWallet();
  const isEditing = Boolean(wallet);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: "",
      type: "cash",
      balance: 0,
    },
  });

  useEffect(() => {
    if (wallet) {
      reset({
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance,
      });
    } else {
      reset({ name: "", type: "cash", balance: 0 });
    }
  }, [wallet, reset]);

  const mutation = isEditing ? updateMutation : createMutation;
  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Unable to save wallet"
        : null;

  const onSubmit = handleSubmit((values) => {
    if (wallet) {
      updateMutation.mutate(
        { id: wallet.id, data: values },
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
        <label htmlFor="wallet-name" className="text-label-md text-foreground">
          Name
        </label>
        <Input
          id="wallet-name"
          className="h-10"
          placeholder="e.g. Tiền mặt, ACB, Momo"
          {...register("name")}
        />
        {errors.name ? <p className="text-error">{errors.name.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">Type</span>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Tabs
              value={field.value}
              onValueChange={field.onChange}
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
          htmlFor="wallet-balance"
          className="text-label-md text-foreground"
        >
          Balance
        </label>
        <Input
          id="wallet-balance"
          type="number"
          step="0.01"
          min="0"
          className="h-10"
          {...register("balance", { valueAsNumber: true })}
        />
        {errors.balance ? (
          <p className="text-error">{errors.balance.message}</p>
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
