import type { TransactionTypeEnum } from "@/features/transactions/types/transaction-types";

export type TransactionTemplateType = {
  id: string;
  userId: string;
  label: string;
  type: TransactionTypeEnum;
  amount: number;
  walletId: string;
  categoryId: string;
  note: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  walletName?: string;
  categoryName?: string;
  categoryIcon?: string;
};
