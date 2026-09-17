"use client";

import { useQuery } from "@tanstack/react-query";
import { listWallets } from "../api/wallets-api";
import type { PaginationParamsType } from "@/types/pagination-types";

const DEFAULT_LIMIT = 10;

export function useWallets(params: PaginationParamsType = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? DEFAULT_LIMIT;

  return useQuery({
    queryKey: ["wallets", { page, limit }],
    queryFn: () => listWallets({ page, limit }),
    placeholderData: (previous) => previous,
  });
}
