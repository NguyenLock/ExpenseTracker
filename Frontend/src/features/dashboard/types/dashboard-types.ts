import type { BudgetType } from "@/features/budgets/types/budget-types";
import type { DebtType } from "@/features/debts/types/debt-types";
import type { TransactionType } from "@/features/transactions/types/transaction-types";
import type { WalletTypeEnum } from "@/features/wallets/types/wallet-types";

export type DashboardPeriodEnum = "week" | "month" | "all";

export type DashboardWalletSummaryType = {
  id: string;
  name: string;
  type: WalletTypeEnum;
  balance: number;
};

export type DashboardType = {
  period: DashboardPeriodEnum;
  from: string | null;
  to: string | null;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  walletBalance: number;
  recentTransactions: TransactionType[];
  wallets: DashboardWalletSummaryType[];
  debtReminders: DebtType[];
  budgets: BudgetType[];
};
