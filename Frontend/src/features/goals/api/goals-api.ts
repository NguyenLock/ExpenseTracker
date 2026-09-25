import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/types/pagination-types";
import type {
  ContributeFormValues,
  GoalPayload,
  PlanFormValues,
} from "../schemas/goal-schema";
import type {
  FixedCostType,
  GoalPlanType,
  GoalStatusEnum,
  GoalType,
} from "../types/goal-types";

export function listGoals(status?: GoalStatusEnum) {
  return apiClient<GoalType[]>(`/goals${toSearchParams({ status })}`);
}

export function createGoal(data: GoalPayload) {
  return apiClient<GoalType>("/goals", { method: "POST", body: data });
}

export function updateGoal(
  id: string,
  data: Partial<GoalPayload> & { status?: GoalStatusEnum },
) {
  return apiClient<GoalType>(`/goals/${id}`, { method: "PATCH", body: data });
}

export function deleteGoal(id: string) {
  return apiClient<void>(`/goals/${id}`, { method: "DELETE" });
}

export function contributeGoal(id: string, data: ContributeFormValues) {
  return apiClient<GoalType>(`/goals/${id}/contribute`, {
    method: "POST",
    body: data,
  });
}

export function planGoal(id: string, data: PlanFormValues) {
  return apiClient<GoalPlanType>(`/goals/${id}/plan`, {
    method: "POST",
    body: data,
  });
}

export function listFixedCosts() {
  return apiClient<FixedCostType[]>("/fixed-costs");
}

export function createFixedCost(data: {
  label: string;
  amount: number;
  isActive?: boolean;
}) {
  return apiClient<FixedCostType>("/fixed-costs", {
    method: "POST",
    body: data,
  });
}

export function updateFixedCost(
  id: string,
  data: Partial<{ label: string; amount: number; isActive: boolean }>,
) {
  return apiClient<FixedCostType>(`/fixed-costs/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteFixedCost(id: string) {
  return apiClient<void>(`/fixed-costs/${id}`, { method: "DELETE" });
}
