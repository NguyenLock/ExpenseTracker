export type DebtDirectionEnum = "i_owe" | "owed_to_me";
export type DebtStatusEnum = "open" | "settled";

export type DebtType = {
  id: string;
  userId: string;
  personName: string;
  amount: number;
  direction: DebtDirectionEnum;
  dueDate: string;
  note: string | null;
  status: DebtStatusEnum;
  autoRecord: boolean;
  walletId: string;
  categoryId: string;
  transactionId: string | null;
  settledAt: string | null;
  createdAt: string;
  updatedAt: string;
  walletName?: string;
  categoryName?: string;
  categoryIcon?: string;
  isOverdue?: boolean;
  isDueToday?: boolean;
};
