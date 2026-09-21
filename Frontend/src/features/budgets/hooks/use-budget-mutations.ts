"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  copyBudgets,
  createBudget,
  deleteBudget,
  updateBudget,
} from "../api/budgets-api";
import type { BudgetPayload } from "../schemas/budget-schema";

async function invalidateBudgetQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["budgets"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
  ]);
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BudgetPayload) => createBudget(data),
    onSuccess: async () => {
      await invalidateBudgetQueries(queryClient);
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Pick<BudgetPayload, "amount">;
    }) => updateBudget(id, data),
    onSuccess: async () => {
      await invalidateBudgetQueries(queryClient);
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: async () => {
      await invalidateBudgetQueries(queryClient);
    },
  });
}

export function useCopyBudgets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fromMonth,
      toMonth,
    }: {
      fromMonth: string;
      toMonth: string;
    }) => copyBudgets(fromMonth, toMonth),
    onSuccess: async () => {
      await invalidateBudgetQueries(queryClient);
    },
  });
}
