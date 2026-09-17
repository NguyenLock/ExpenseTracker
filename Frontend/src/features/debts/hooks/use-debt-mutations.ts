"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDebt,
  deleteDebt,
  settleDebt,
  updateDebt,
} from "../api/debts-api";
import type { DebtPayload } from "../schemas/debt-schema";

async function invalidateDebtQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["debts"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    queryClient.invalidateQueries({ queryKey: ["wallets"] }),
  ]);
}

export function useCreateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DebtPayload) => createDebt(data),
    onSuccess: async () => {
      await invalidateDebtQueries(queryClient);
    },
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DebtPayload }) =>
      updateDebt(id, data),
    onSuccess: async () => {
      await invalidateDebtQueries(queryClient);
    },
  });
}

export function useSettleDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settleDebt(id),
    onSuccess: async () => {
      await invalidateDebtQueries(queryClient);
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDebt(id),
    onSuccess: async () => {
      await invalidateDebtQueries(queryClient);
    },
  });
}
