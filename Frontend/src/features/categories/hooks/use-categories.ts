"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listCategories,
  type ListCategoriesParams,
} from "../api/categories-api";

const DEFAULT_LIMIT = 10;

export function useCategories(params: ListCategoriesParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? DEFAULT_LIMIT;
  const type = params.type;

  return useQuery({
    queryKey: ["categories", { page, limit, type }],
    queryFn: () => listCategories({ page, limit, type }),
    placeholderData: (previous) => previous,
  });
}
