import { apiClient } from "@/lib/api-client";
import {
  toSearchParams,
  type PaginatedType,
  type PaginationParamsType,
} from "@/types/pagination-types";
import type { CategoryFormValues } from "../schemas/category-schema";
import type { CategoryType, CategoryTypeEnum } from "../types/category-types";

export type ListCategoriesParams = PaginationParamsType & {
  type?: CategoryTypeEnum;
};

export function listCategories(params: ListCategoriesParams = {}) {
  return apiClient<PaginatedType<CategoryType>>(
    `/categories${toSearchParams({
      page: params.page,
      limit: params.limit,
      type: params.type,
    })}`,
  );
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
