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
  const fromDate = params.fromDate;
  const toDate = params.toDate;

  return useQuery({
    queryKey: ["transactions", { page, limit, type, fromDate, toDate }],
    queryFn: () => listTransactions({ page, limit, type, fromDate, toDate }),
    placeholderData: (previous) => previous,
  });
}
