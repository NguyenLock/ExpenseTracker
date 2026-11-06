"use client";

import { cn } from "@/lib/utils";
import type {
  NotificationType,
  PeriodSummaryType,
} from "../types/notification-types";
import { ChangeBadge, formatMoney, rangeLabel } from "./notification-format";

type PeriodComparisonChartProps = {
  summary: PeriodSummaryType;
  currentLabel: string;
  previousLabel: string;
};

function PeriodComparisonChart({
  summary,
  currentLabel,
  previousLabel,
}: PeriodComparisonChartProps) {
  const rows = [
    {
      label: "Expense",
      current: summary.expense,
      previous: summary.previousExpense,
      percent: summary.expenseChangePercent,
      upIsBad: true,
      barClass: "bg-danger",
    },
    {
      label: "Income",
      current: summary.income,
      previous: summary.previousIncome,
      percent: summary.incomeChangePercent,
      upIsBad: false,
      barClass: "bg-success",
    },
  ];
  const width = (value: number, row: (typeof rows)[number]) => {
    const max = Math.max(row.current, row.previous, 1);
    return `${value > 0 ? Math.max((value / max) * 100, 2) : 0}%`;
  };

  return (
    <div className="mt-2 space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          role="img"
          aria-label={`${row.label}: ${formatMoney(row.current)} in ${currentLabel}, ${formatMoney(row.previous)} in ${previousLabel}`}
        >
          <div className="text-caption flex items-center justify-between">
            <span className="text-muted-foreground">{row.label}</span>
            <ChangeBadge percent={row.percent} upIsBad={row.upIsBad} />
          </div>
          <div className="mt-1 grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1">
            <div className="bg-muted h-2 rounded-full">
              <div
                className={cn("h-2 rounded-full", row.barClass)}
                style={{ width: width(row.current, row) }}
              />
            </div>
            <span className="text-caption text-foreground text-right tabular-nums">
              {formatMoney(row.current)}
            </span>
            <div className="bg-muted h-2 rounded-full">
              <div
                className="bg-muted-foreground/40 h-2 rounded-full"
                style={{ width: width(row.previous, row) }}
              />
            </div>
            <span className="text-caption text-muted-foreground text-right tabular-nums">
              {formatMoney(row.previous)}
            </span>
          </div>
        </div>
      ))}
      <p className="text-caption text-muted-foreground">
        Colored: {currentLabel} · Grey: {previousLabel}
      </p>
    </div>
  );
}

type NotificationItemProps = {
  notification: NotificationType;
  onSelect: (notification: NotificationType) => void;
};

export function NotificationItem({
  notification,
  onSelect,
}: NotificationItemProps) {
  const { summary, readAt, type } = notification;
  const unread = readAt === null;
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

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={cn(
        "hover:bg-muted focus-visible:outline-primary w-full rounded-md px-3 py-2.5 text-left transition-colors focus-visible:outline-2",
        unread && "bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-foreground truncate text-sm font-medium">
          {type === "weekly_summary" ? `Week ${currentLabel}` : currentLabel}
        </p>
        {unread ? (
          <span className="bg-primary size-2 shrink-0 rounded-full">
            <span className="sr-only">Unread</span>
          </span>
        ) : null}
      </div>

      {summary.transactionCount === 0 ? (
        <p className="text-caption text-muted-foreground mt-1">
          No transactions recorded. Forgot to log some?
        </p>
      ) : (
        <>
          <PeriodComparisonChart
            summary={summary}
            currentLabel={currentLabel}
            previousLabel={previousLabel}
          />
          <p className="text-caption text-muted-foreground mt-1.5">
            Net{" "}
            <span className={summary.net < 0 ? "text-danger" : "text-success"}>
              {formatMoney(summary.net)}
            </span>
          </p>
          {summary.topIncrease ? (
            <p className="text-caption text-muted-foreground mt-0.5">
              Biggest increase: {summary.topIncrease.name} +
              {formatMoney(summary.topIncrease.delta)}
              {summary.topIncrease.changePercent !== null
                ? ` (▲${summary.topIncrease.changePercent}%)`
                : " (new)"}
            </p>
          ) : null}
        </>
      )}
    </button>
  );
}
