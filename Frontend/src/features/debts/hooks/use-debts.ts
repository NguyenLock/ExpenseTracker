"use client";

import { useQuery } from "@tanstack/react-query";
import { listDebtReminders, listDebts, type ListDebtsParams } from "../api/debts-api";

export function useDebts(params: ListDebtsParams = {}) {
  return useQuery({
    queryKey: ["debts", params],
    queryFn: () => listDebts(params),
  });
}

export function useDebtReminders() {
  return useQuery({
    queryKey: ["debts", "reminders"],
    queryFn: listDebtReminders,
  });
}
