"use client";

import { useQuery } from "@tanstack/react-query";
import { listFixedCosts, listGoals } from "../api/goals-api";
import type { GoalStatusEnum } from "../types/goal-types";

export function useGoals(status?: GoalStatusEnum) {
  return useQuery({
    queryKey: ["goals", { status: status ?? "all" }],
    queryFn: () => listGoals(status),
    placeholderData: (previous) => previous,
  });
}

export function useFixedCosts() {
  return useQuery({
    queryKey: ["fixed-costs"],
    queryFn: () => listFixedCosts(),
  });
}
