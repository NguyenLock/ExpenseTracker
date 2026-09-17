"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api-client";
import { useTransferWallet } from "../hooks/use-wallet-mutations";
import { useWallets } from "../hooks/use-wallets";
import {
  transferWalletSchema,
  type TransferWalletFormValues,
} from "../schemas/wallet-schema";

type WalletTransferFormProps = {
  fromWalletId?: string | null;
  onDone?: () => void;
};

export function WalletTransferForm({
  fromWalletId,
  onDone,
}: WalletTransferFormProps) {
  const { data } = useWallets({ page: 1, limit: 100 });
  const wallets = data?.items ?? [];
  const mutation = useTransferWallet();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TransferWalletFormValues>({
    resolver: zodResolver(transferWalletSchema),
    defaultValues: {
      fromWalletId: fromWalletId ?? "",
      toWalletId: "",
      amount: 0,
      note: "",
    },
  });

  useEffect(() => {
    reset({
      fromWalletId: fromWalletId ?? "",
      toWalletId: "",
      amount: 0,
      note: "",
    });
  }, [fromWalletId, reset]);

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Unable to transfer"
        : null;

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(
      {
        fromWalletId: values.fromWalletId,
        toWalletId: values.toWalletId,
        amount: values.amount,
        note: values.note || undefined,
      },
      { onSuccess: () => onDone?.() },
    );
  });

  const walletItems = Object.fromEntries(wallets.map((w) => [w.id, w.name]));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">From</span>
        <Controller
          control={control}
          name="fromWalletId"
          render={({ field }) => (
            <Select
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              items={walletItems}
            >
              <SelectTrigger>
                <SelectValue placeholder="Source wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem
                    key={wallet.id}
                    value={wallet.id}
                    label={wallet.name}
                  >
                    {wallet.name} ({wallet.balance.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.fromWalletId ? (
          <p className="text-error">{errors.fromWalletId.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-label-md text-foreground">To</span>
        <Controller
          control={control}
          name="toWalletId"
          render={({ field }) => (
            <Select
              value={field.value || null}
              onValueChange={(value) => field.onChange(value ?? "")}
              items={walletItems}
            >
              <SelectTrigger>
                <SelectValue placeholder="Destination wallet" />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem
                    key={wallet.id}
                    value={wallet.id}
                    label={wallet.name}
                  >
                    {wallet.name} ({wallet.balance.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.toWalletId ? (
          <p className="text-error">{errors.toWalletId.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="transfer-amount"
          className="text-label-md text-foreground"
        >
          Amount
        </label>
        <Input
          id="transfer-amount"
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
        <label htmlFor="transfer-note" className="text-label-md text-foreground">
          Note
        </label>
        <Input
          id="transfer-note"
          className="h-10"
          placeholder="Optional"
          {...register("note")}
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
          disabled={mutation.isPending || wallets.length < 2}
        >
          {mutation.isPending ? "Transferring…" : "Transfer"}
        </Button>
      </div>
    </form>
  );
}
