import { apiClient } from "@/lib/api-client";
import {
  toSearchParams,
  type PaginatedType,
  type PaginationParamsType,
} from "@/types/pagination-types";
import type { WalletFormValues } from "../schemas/wallet-schema";
import type { WalletType } from "../types/wallet-types";

export function listWallets(params: PaginationParamsType = {}) {
  return apiClient<PaginatedType<WalletType>>(
    `/wallets${toSearchParams({
      page: params.page,
      limit: params.limit,
    })}`,
  );
}

export function createWallet(data: WalletFormValues) {
  return apiClient<WalletType>("/wallets", {
    method: "POST",
    body: data,
  });
}

export function updateWallet(id: string, data: Partial<WalletFormValues>) {
  return apiClient<WalletType>(`/wallets/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteWallet(id: string) {
  return apiClient<void>(`/wallets/${id}`, {
    method: "DELETE",
  });
}
