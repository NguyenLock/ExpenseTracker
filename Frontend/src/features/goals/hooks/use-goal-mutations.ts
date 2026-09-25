"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  contributeGoal,
  createFixedCost,
  createGoal,
  deleteFixedCost,
  deleteGoal,
  planGoal,
  updateFixedCost,
  updateGoal,
} from "../api/goals-api";
import type {
  ContributeFormValues,
  GoalPayload,
  PlanFormValues,
} from "../schemas/goal-schema";
import type { GoalStatusEnum } from "../types/goal-types";

async function invalidateGoals(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["goals"] }),
    queryClient.invalidateQueries({ queryKey: ["fixed-costs"] }),
    queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    queryClient.invalidateQueries({ queryKey: ["wallets"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    queryClient.invalidateQueries({ queryKey: ["budgets"] }),
  ]);
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GoalPayload) => createGoal(data),
    onSuccess: async () => {
      await invalidateGoals(queryClient);
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<GoalPayload> & { status?: GoalStatusEnum };
    }) => updateGoal(id, data),
    onSuccess: async () => {
      await invalidateGoals(queryClient);
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: async () => {
      await invalidateGoals(queryClient);
    },
  });
}

export function useContributeGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ContributeFormValues;
    }) => contributeGoal(id, data),
    onSuccess: async () => {
      await invalidateGoals(queryClient);
    },
  });
}

export function usePlanGoal() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlanFormValues }) =>
      planGoal(id, data),
  });
}

export function useCreateFixedCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      label: string;
      amount: number;
      isActive?: boolean;
    }) => createFixedCost(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fixed-costs"] });
    },
  });
}

export function useUpdateFixedCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ label: string; amount: number; isActive: boolean }>;
    }) => updateFixedCost(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fixed-costs"] });
    },
  });
}

export function useDeleteFixedCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFixedCost(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fixed-costs"] });
    },
  });
}
