"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/dashboard-api";
import type { DashboardPeriodEnum } from "../types/dashboard-types";

export function useDashboard(period: DashboardPeriodEnum = "week") {
  return useQuery({
    queryKey: ["dashboard", { period }],
    queryFn: () => getDashboard(period),
    placeholderData: (previous) => previous,
  });
}
