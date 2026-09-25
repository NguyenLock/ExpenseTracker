"use client";

import { useQuery } from "@tanstack/react-query";
import { listBudgets } from "../api/budgets-api";

export function useBudgets(month: string) {
  return useQuery({
    queryKey: ["budgets", { month }],
    queryFn: () => listBudgets(month),
    placeholderData: (previous) => previous,
  });
}
