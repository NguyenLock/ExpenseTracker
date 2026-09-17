"use client";

import { useQuery } from "@tanstack/react-query";
import { listTransactionTemplates } from "../api/transaction-templates-api";

export function useTransactionTemplates() {
  return useQuery({
    queryKey: ["transaction-templates"],
    queryFn: listTransactionTemplates,
  });
}
