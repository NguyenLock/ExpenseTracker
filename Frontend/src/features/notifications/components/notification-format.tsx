import { cn } from "@/lib/utils";
import type { NotificationTypeEnum } from "../types/notification-types";

export function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function parseIsoDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function rangeLabel(
  type: NotificationTypeEnum,
  from: string,
  to: string,
) {
  if (type === "monthly_summary") {
    return parseIsoDate(from).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }
  const fmt = (v: string) =>
    parseIsoDate(v).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
  return `${fmt(from)} – ${fmt(to)}`;
}

type ChangeBadgeProps = {
  percent: number | null;
  /** true when an increase is bad (expense). */
  upIsBad: boolean;
};

export function ChangeBadge({ percent, upIsBad }: ChangeBadgeProps) {
  if (percent === null) {
    return (
      <span className="bg-primary/10 text-primary rounded px-1.5 text-xs font-medium">
        New
      </span>
    );
  }
  if (percent === 0) {
    return <span className="text-muted-foreground text-xs">0%</span>;
  }
  const up = percent > 0;
  return (
    <span
      className={cn(
        "text-xs font-medium",
        up === upIsBad ? "text-danger" : "text-success",
      )}
    >
      {up ? "▲" : "▼"} {Math.abs(percent)}%
    </span>
  );
}
