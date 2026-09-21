"use client";

import { useState } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import { TableSkeleton } from "@/components/table-skeleton";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useDashboard } from "../hooks/use-dashboard";
import type { DashboardPeriodEnum } from "../types/dashboard-types";
import { DebtReminders } from "./debt-reminders";
import { BudgetOverview } from "./budget-overview";
import { RecentTransactions } from "./recent-transactions";
import { SummaryCards } from "./summary-cards";
import { WalletSummary } from "./wallet-summary";

const PERIODS: { value: DashboardPeriodEnum; label: string }[] = [
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All time" },
];

export function DashboardOverview() {
  const { data: user } = useCurrentUser();
  const [period, setPeriod] = useState<DashboardPeriodEnum>("week");
  const { data, isLoading, isError, error, isFetching } = useDashboard(period);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-caption font-medium tracking-wide text-muted uppercase">
            Overview
          </p>
          <h2 className="mt-1 text-h1 text-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h2>
          <p className="mt-1 text-body-md text-muted">
            Track income, spending, and wallet balances by period.
          </p>
        </div>
        <Tabs
          value={period}
          onValueChange={(value: string) =>
            setPeriod(value as DashboardPeriodEnum)
          }
          className="gap-0"
        >
          <TabsList className="h-9 w-full rounded-lg sm:w-auto">
            {PERIODS.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="rounded-md text-xs"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <TableSkeleton columns={4} rows={4} />
      ) : isError ? (
        <p className="text-error">
          {error instanceof Error ? error.message : "Failed to load dashboard"}
        </p>
      ) : data ? (
        <div className={isFetching ? "opacity-70 transition-opacity" : undefined}>
          <SummaryCards
            totalIncome={data.totalIncome}
            totalExpense={data.totalExpense}
            totalSavings={data.totalSavings}
            walletBalance={data.walletBalance}
          />
          <div className="mt-4">
            <DebtReminders debts={data.debtReminders ?? []} />
          </div>
          <div className="mt-4">
            <BudgetOverview budgets={data.budgets ?? []} />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <RecentTransactions transactions={data.recentTransactions} />
            </div>
            <div className="lg:col-span-2">
              <WalletSummary wallets={data.wallets} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
