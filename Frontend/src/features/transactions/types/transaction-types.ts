export type TransactionTypeEnum = "income" | "expense";

export type TransactionType = {
  id: string;
  userId: string;
  walletId: string;
  categoryId: string;
  amount: number;
  type: TransactionTypeEnum;
  note: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  walletName?: string;
  categoryName?: string;
  categoryIcon?: string;
};
