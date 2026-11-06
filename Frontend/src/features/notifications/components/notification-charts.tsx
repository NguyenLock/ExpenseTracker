"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import type {
  CategoryComparisonType,
  DailyExpenseType,
  NotificationTypeEnum,
} from "../types/notification-types";
import {
  formatCompactMoney,
  formatMoney,
  parseIsoDate,
} from "./notification-format";

const CURRENT_COLOR = "var(--primary)";
const PREVIOUS_COLOR = "#a1a1aa";

const tooltipProps = {
  formatter: (value: unknown) => formatMoney(Number(value)),
  contentStyle: {
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--popover)",
    fontSize: 12,
  },
  cursor: { fill: "var(--muted)", opacity: 0.5 },
} as const;

type SpendingTrendChartProps = {
  type: NotificationTypeEnum;
  daily: DailyExpenseType[];
  currentLabel: string;
  previousLabel: string;
};

export function SpendingTrendChart({
  type,
  daily,
  currentLabel,
  previousLabel,
}: SpendingTrendChartProps) {
  const [mode, setMode] = useState<"daily" | "cumulative">(
    type === "weekly_summary" ? "daily" : "cumulative",
  );

  const data = [];
  let runningCurrent = 0;
  let runningPrevious = 0;
  for (const d of daily) {
    runningCurrent += d.current;
    runningPrevious += d.previous;
    const labelDate = d.currentDate ?? d.previousDate;
    data.push({
      label:
        type === "weekly_summary" && labelDate
          ? parseIsoDate(labelDate).toLocaleDateString(undefined, {
              weekday: "short",
            })
          : String(d.day),
      current: d.currentDate ? d.current : null,
      previous: d.previousDate ? d.previous : null,
      cumulativeCurrent: d.currentDate ? runningCurrent : null,
      cumulativePrevious: d.previousDate ? runningPrevious : null,
    });
  }

  const axes = (
    <>
      <CartesianGrid vertical={false} stroke="var(--border)" />
      <XAxis
        dataKey="label"
        tickLine={false}
        axisLine={false}
        fontSize={11}
        interval="preserveStartEnd"
      />
      <YAxis
        tickFormatter={formatCompactMoney}
        tickLine={false}
        axisLine={false}
        fontSize={11}
        width={44}
      />
      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
    </>
  );

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-foreground text-sm font-medium">Spending</h3>
        <div
          role="group"
          aria-label="Chart mode"
          className="bg-muted inline-flex rounded-lg p-0.5 text-xs"
        >
          {(["daily", "cumulative"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "text-muted-foreground rounded-md px-2.5 py-1 font-medium capitalize",
                mode === m && "bg-surface text-foreground shadow-sm",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {mode === "daily" ? (
            <BarChart data={data} barGap={2}>
              {axes}
              <Tooltip {...tooltipProps} />
              <Bar
                dataKey="previous"
                name={previousLabel}
                fill={PREVIOUS_COLOR}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="current"
                name={currentLabel}
                fill={CURRENT_COLOR}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={data}>
              {axes}
              <Tooltip {...tooltipProps} cursor={{ stroke: "var(--border)" }} />
              <Line
                dataKey="cumulativePrevious"
                name={previousLabel}
                stroke={PREVIOUS_COLOR}
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="cumulativeCurrent"
                name={currentLabel}
                stroke={CURRENT_COLOR}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

const MAX_CATEGORIES = 8;

type CategoryComparisonChartProps = {
  categories: CategoryComparisonType[];
  currentLabel: string;
  previousLabel: string;
};

export function CategoryComparisonChart({
  categories,
  currentLabel,
  previousLabel,
}: CategoryComparisonChartProps) {
  if (categories.length === 0) return null;
  const data = categories.slice(0, MAX_CATEGORIES);

  return (
    <section>
      <h3 className="text-foreground mb-2 text-sm font-medium">By category</h3>
      <div style={{ height: data.length * 44 + 48 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barGap={2}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis
              type="number"
              tickFormatter={formatCompactMoney}
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={84}
            />
            <Tooltip {...tooltipProps} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Bar
              dataKey="previous"
              name={previousLabel}
              fill={PREVIOUS_COLOR}
              radius={[0, 3, 3, 0]}
            />
            <Bar
              dataKey="current"
              name={currentLabel}
              fill={CURRENT_COLOR}
              radius={[0, 3, 3, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
