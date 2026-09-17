import { apiClient } from "@/lib/api-client";
import type { TransactionTemplateFormValues } from "../schemas/transaction-template-schema";
import type { TransactionTemplateType } from "../types/transaction-template-types";

export function listTransactionTemplates() {
  return apiClient<TransactionTemplateType[]>("/transaction-templates");
}

export function createTransactionTemplate(
  data: TransactionTemplateFormValues,
) {
  return apiClient<TransactionTemplateType>("/transaction-templates", {
    method: "POST",
    body: {
      ...data,
      note: data.note?.trim() ? data.note.trim() : undefined,
    },
  });
}

export function updateTransactionTemplate(
  id: string,
  data: Partial<TransactionTemplateFormValues>,
) {
  return apiClient<TransactionTemplateType>(`/transaction-templates/${id}`, {
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

export function deleteTransactionTemplate(id: string) {
  return apiClient<void>(`/transaction-templates/${id}`, {
    method: "DELETE",
  });
}
