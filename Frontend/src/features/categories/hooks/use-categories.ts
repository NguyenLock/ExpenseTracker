"use client";

import { useQuery } from "@tanstack/react-query";
import { listCategories } from "../api/categories-api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });
}
