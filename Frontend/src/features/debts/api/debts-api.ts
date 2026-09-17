import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/types/pagination-types";
import type { DebtFormValues } from "../schemas/debt-schema";
import type {
  DebtDirectionEnum,
  DebtStatusEnum,
  DebtType,
} from "../types/debt-types";

export type ListDebtsParams = {
  status?: DebtStatusEnum;
  direction?: DebtDirectionEnum;
};

export function listDebts(params: ListDebtsParams = {}) {
  return apiClient<DebtType[]>(
    `/debts${toSearchParams({
      status: params.status,
      direction: params.direction,
    })}`,
  );
}

export function listDebtReminders() {
  return apiClient<DebtType[]>("/debts/reminders");
}

export function createDebt(data: DebtFormValues) {
  return apiClient<DebtType>("/debts", {
    method: "POST",
    body: {
      ...data,
      note: data.note?.trim() ? data.note.trim() : undefined,
      autoRecord:
        data.direction === "owed_to_me" ? Boolean(data.autoRecord) : false,
    },
  });
}

export function updateDebt(id: string, data: Partial<DebtFormValues>) {
  return apiClient<DebtType>(`/debts/${id}`, {
    method: "PATCH",
    body: {
      ...data,
      note:
        data.note === undefined
          ? undefined
          : data.note.trim()
            ? data.note.trim()
            : null,
    },
  });
}

export function settleDebt(id: string) {
  return apiClient<DebtType>(`/debts/${id}/settle`, {
    method: "POST",
  });
}

export function deleteDebt(id: string) {
  return apiClient<void>(`/debts/${id}`, {
    method: "DELETE",
  });
}
