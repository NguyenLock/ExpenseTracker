import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

type SummaryCardsProps = {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  walletBalance: number;
};

const CARDS = [
  {
    key: "income" as const,
    label: "Total Income",
    icon: ArrowDownLeft,
    tone: "text-success",
    iconWrap: "bg-success/10 text-success",
  },
  {
    key: "expense" as const,
    label: "Total Expense",
    icon: ArrowUpRight,
    tone: "text-danger",
    iconWrap: "bg-danger/10 text-danger",
  },
  {
    key: "savings" as const,
    label: "Net",
    icon: PiggyBank,
    tone: "text-foreground",
    iconWrap: "bg-primary/10 text-primary",
  },
  {
    key: "balance" as const,
    label: "Wallet Balance",
    icon: Wallet,
    tone: "text-foreground",
    iconWrap: "bg-secondary text-foreground",
  },
] as const;

export function SummaryCards({
  totalIncome,
  totalExpense,
  totalSavings,
  walletBalance,
}: SummaryCardsProps) {
  const values = {
    income: totalIncome,
    expense: totalExpense,
    savings: totalSavings,
    balance: walletBalance,
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const value = values[card.key];
        const tone =
          card.key === "savings"
            ? value < 0
              ? "text-danger"
              : value > 0
                ? "text-success"
                : "text-foreground"
            : card.tone;

        return (
          <div
            key={card.key}
            className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-black/[0.04]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-metric-label">{card.label}</p>
              <span
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-lg",
                  card.iconWrap,
                )}
              >
                <Icon className="size-4" />
              </span>
            </div>
            <p className={cn("mt-3 text-metric-value", tone)}>
              {formatMoney(value)}
            </p>
          </div>
        );
      })}
    </section>
  );
}
