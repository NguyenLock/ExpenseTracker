import { apiClient } from "@/lib/api-client";
import {
  toSearchParams,
  type PaginatedType,
  type PaginationParamsType,
} from "@/types/pagination-types";
import type { TransactionFormValues } from "../schemas/transaction-schema";
import type {
  TransactionType,
  TransactionTypeEnum,
} from "../types/transaction-types";

export type ListTransactionsParams = PaginationParamsType & {
  type?: TransactionTypeEnum;
};

export function listTransactions(params: ListTransactionsParams = {}) {
  return apiClient<PaginatedType<TransactionType>>(
    `/transactions${toSearchParams({
      page: params.page,
      limit: params.limit,
      type: params.type,
    })}`,
  );
}

export function createTransaction(data: TransactionFormValues) {
  return apiClient<TransactionType>("/transactions", {
    method: "POST",
    body: {
      ...data,
      note: data.note?.trim() ? data.note.trim() : undefined,
    },
  });
}

export function updateTransaction(
  id: string,
  data: Partial<TransactionFormValues>,
) {
  return apiClient<TransactionType>(`/transactions/${id}`, {
    method: "PATCH",
    body: {
      ...data,
      note:
        data.note === undefined
          ? undefined
          : data.note.trim()
            ? data.note.trim()
            : null,
    },
  });
}

export function deleteTransaction(id: string) {
  return apiClient<void>(`/transactions/${id}`, {
    method: "DELETE",
  });
}
