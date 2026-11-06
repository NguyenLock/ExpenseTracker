"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/animate-ui/components/radix/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNotificationDetail } from "../hooks/use-notifications";
import type { NotificationType } from "../types/notification-types";
import {
  CategoryComparisonChart,
  SpendingTrendChart,
} from "./notification-charts";
import { ChangeBadge, formatMoney, rangeLabel } from "./notification-format";

type NotificationDetailSheetProps = {
  notification: NotificationType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NotificationDetailSheet({
  notification,
  open,
  onOpenChange,
}: NotificationDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:w-[520px] sm:max-w-[520px]"
      >
        {notification ? (
          <DetailBody
            notification={notification}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

type DetailBodyProps = {
  notification: NotificationType;
  onClose: () => void;
};

function DetailBody({ notification, onClose }: DetailBodyProps) {
  const { data, isLoading, isError, refetch } = useNotificationDetail(
    notification.id,
  );
  const { type } = notification;
  const summary = data?.summary ?? notification.summary;
  const currentLabel = rangeLabel(
    type,
    notification.periodFrom,
    notification.periodTo,
  );
  const previousLabel = rangeLabel(
    type,
    notification.previousFrom,
    notification.previousTo,
  );
  const unit = type === "weekly_summary" ? "week" : "month";

  const stats = [
    {
      label: "Expense",
      value: summary.expense,
      previous: summary.previousExpense,
      percent: summary.expenseChangePercent,
      upIsBad: true,
    },
    {
      label: "Income",
      value: summary.income,
      previous: summary.previousIncome,
      percent: summary.incomeChangePercent,
      upIsBad: false,
    },
  ];

  return (
    <>
      <SheetHeader className="border-border border-b pr-12">
        <SheetTitle>
          {type === "weekly_summary" ? `Week ${currentLabel}` : currentLabel}
        </SheetTitle>
        <SheetDescription>
          Compared with previous {unit} ({previousLabel})
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 p-4">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="border-border rounded-lg border p-3">
              <p className="text-caption text-muted-foreground">{s.label}</p>
              <p className="text-foreground mt-1 truncate text-sm font-semibold tabular-nums sm:text-base">
                {formatMoney(s.value)}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5">
                <ChangeBadge percent={s.percent} upIsBad={s.upIsBad} />
                <span className="text-caption text-muted-foreground truncate">
                  vs {formatMoney(s.previous)}
                </span>
              </div>
            </div>
          ))}
          <div className="border-border rounded-lg border p-3">
            <p className="text-caption text-muted-foreground">Net</p>
            <p
              className={cn(
                "mt-1 truncate text-sm font-semibold tabular-nums sm:text-base",
                summary.net < 0 ? "text-danger" : "text-success",
              )}
            >
              {formatMoney(summary.net)}
            </p>
            <p className="text-caption text-muted-foreground mt-0.5">
              {summary.transactionCount} transactions
            </p>
          </div>
        </div>

        {summary.topIncrease ? (
          <p className="bg-muted text-foreground rounded-lg px-3 py-2 text-sm">
            Biggest increase:{" "}
            <span className="font-medium">{summary.topIncrease.name}</span> +
            {formatMoney(summary.topIncrease.delta)}
            {summary.topIncrease.changePercent !== null
              ? ` (▲${summary.topIncrease.changePercent}%)`
              : " (new)"}
          </p>
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : isError || !data ? (
          <div className="border-border text-muted-foreground rounded-lg border px-3 py-6 text-center text-sm">
            Couldn&apos;t load charts.{" "}
            <button
              type="button"
              onClick={() => void refetch()}
              className="text-primary font-medium hover:opacity-90"
            >
              Retry
            </button>
          </div>
        ) : summary.expense === 0 && summary.previousExpense === 0 ? (
          <p className="border-border text-muted-foreground rounded-lg border px-3 py-6 text-center text-sm">
            No spending in either {unit}. Forgot to log some?
          </p>
        ) : (
          <>
            <SpendingTrendChart
              type={type}
              daily={data.detail.daily}
              currentLabel={currentLabel}
              previousLabel={previousLabel}
            />
            <CategoryComparisonChart
              categories={data.detail.categories}
              currentLabel={currentLabel}
              previousLabel={previousLabel}
            />
          </>
        )}

        <Link
          href={`/transactions?from=${notification.periodFrom}&to=${notification.periodTo}`}
          onClick={onClose}
          className="bg-primary inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90"
        >
          View transactions
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </>
  );
}
