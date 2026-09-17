"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWallet,
  deleteWallet,
  updateWallet,
} from "../api/wallets-api";
import type { WalletFormValues } from "../schemas/wallet-schema";

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WalletFormValues) => createWallet(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
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
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWallet(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}
