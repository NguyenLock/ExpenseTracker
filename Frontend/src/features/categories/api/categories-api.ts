import { apiClient } from "@/lib/api-client";
import type { CategoryFormValues } from "../schemas/category-schema";
import type { CategoryType } from "../types/category-types";

export function listCategories() {
  return apiClient<CategoryType[]>("/categories");
}

export function createCategory(data: CategoryFormValues) {
  return apiClient<CategoryType>("/categories", {
    method: "POST",
    body: data,
  });
}

export function updateCategory(id: string, data: Partial<CategoryFormValues>) {
  return apiClient<CategoryType>(`/categories/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteCategory(id: string) {
  return apiClient<void>(`/categories/${id}`, {
    method: "DELETE",
  });
}
