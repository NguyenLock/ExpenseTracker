"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listTransactions,
  type ListTransactionsParams,
} from "../api/transactions-api";

const DEFAULT_LIMIT = 10;

export function useTransactions(params: ListTransactionsParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const type = params.type;

  return useQuery({
    queryKey: ["transactions", { page, limit, type }],
    queryFn: () => listTransactions({ page, limit, type }),
    placeholderData: (previous) => previous,
  });
}
