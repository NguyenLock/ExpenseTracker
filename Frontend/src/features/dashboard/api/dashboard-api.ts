import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/types/pagination-types";
import type {
  DashboardPeriodEnum,
  DashboardType,
} from "../types/dashboard-types";

export function getDashboard(period: DashboardPeriodEnum = "week") {
  return apiClient<DashboardType>(
    `/dashboard${toSearchParams({ period })}`,
  );
}
