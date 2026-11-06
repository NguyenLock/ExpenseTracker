export type NotificationTypeEnum = "weekly_summary" | "monthly_summary";

export type TopCategoryChangeType = {
  name: string;
  amount: number;
  previousAmount: number;
  delta: number;
  changePercent: number | null;
};

export type PeriodSummaryType = {
  income: number;
  expense: number;
  net: number;
  previousIncome: number;
  previousExpense: number;
  incomeChangePercent: number | null;
  expenseChangePercent: number | null;
  transactionCount: number;
  topIncrease: TopCategoryChangeType | null;
};

export type NotificationType = {
  id: string;
  type: NotificationTypeEnum;
  periodKey: string;
  periodFrom: string;
  periodTo: string;
  previousFrom: string;
  previousTo: string;
  readAt: string | null;
  createdAt: string;
  summary: PeriodSummaryType;
};

export type DailyExpenseType = {
  day: number;
  currentDate: string | null;
  previousDate: string | null;
  current: number;
  previous: number;
};

export type CategoryComparisonType = {
  name: string;
  current: number;
  previous: number;
};

export type NotificationDetailType = NotificationType & {
  detail: {
    daily: DailyExpenseType[];
    categories: CategoryComparisonType[];
  };
};

export type NotificationListType = {
  items: NotificationType[];
  unreadCount: number;
};
