import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/types/pagination-types";
import type { BudgetPayload } from "../schemas/budget-schema";
import type { BudgetType } from "../types/budget-types";

export function listBudgets(month?: string) {
  return apiClient<BudgetType[]>(`/budgets${toSearchParams({ month })}`);
}

export function createBudget(data: BudgetPayload) {
  return apiClient<BudgetType>("/budgets", {
    method: "POST",
    body: data,
  });
}

export function updateBudget(id: string, data: Pick<BudgetPayload, "amount">) {
  return apiClient<BudgetType>(`/budgets/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteBudget(id: string) {
  return apiClient<void>(`/budgets/${id}`, {
    method: "DELETE",
  });
}

export function copyBudgets(fromMonth: string, toMonth: string) {
  return apiClient<{
    created: number;
    skipped: number;
    items: BudgetType[];
  }>("/budgets/copy", {
    method: "POST",
    body: { fromMonth, toMonth },
  });
}
