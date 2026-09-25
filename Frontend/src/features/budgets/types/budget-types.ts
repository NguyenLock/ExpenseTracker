export type BudgetType = {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: number;
  month: string;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverall: boolean;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  categoryIcon?: string;
};
