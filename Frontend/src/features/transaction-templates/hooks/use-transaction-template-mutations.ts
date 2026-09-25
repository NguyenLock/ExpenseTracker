"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTransactionTemplate,
  deleteTransactionTemplate,
  updateTransactionTemplate,
} from "../api/transaction-templates-api";
import type { TransactionTemplateFormValues } from "../schemas/transaction-template-schema";

export function useCreateTransactionTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransactionTemplateFormValues) =>
      createTransactionTemplate(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["transaction-templates"],
      });
    },
  });
}

export function useUpdateTransactionTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TransactionTemplateFormValues>;
    }) => updateTransactionTemplate(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["transaction-templates"],
      });
    },
  });
}

export function useDeleteTransactionTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransactionTemplate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["transaction-templates"],
      });
    },
  });
}
