"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWallet,
  deleteWallet,
  transferWallet,
  updateWallet,
  type TransferWalletPayload,
} from "../api/wallets-api";
import type { WalletFormValues } from "../schemas/wallet-schema";

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WalletFormValues) => createWallet(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallets"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<WalletFormValues>;
    }) => updateWallet(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallets"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWallet(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallets"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}

export function useTransferWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferWalletPayload) => transferWallet(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wallets"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
