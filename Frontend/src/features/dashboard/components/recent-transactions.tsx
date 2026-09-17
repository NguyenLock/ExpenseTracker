import Link from "next/link";
import { CategoryIconBadge } from "@/features/categories/components/category-icon-badge";
import type { TransactionType } from "@/features/transactions/types/transaction-types";
import { cn } from "@/lib/utils";

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

type RecentTransactionsProps = {
  transactions: TransactionType[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <section className="rounded-2xl bg-surface shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-h4 text-foreground">Recent transactions</h3>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Latest activity across wallets
          </p>
        </div>
        <Link
          href="/transactions"
          className="text-sm font-medium text-primary transition hover:opacity-90"
        >
          View all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-body-md text-foreground">No transactions yet</p>
          <p className="mt-1 text-caption text-muted-foreground">
            Create your first transaction to see it here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {transactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center gap-3 px-5 py-3.5"
            >
              {transaction.categoryIcon ? (
                <CategoryIconBadge
                  icon={transaction.categoryIcon}
                  size="sm"
                />
              ) : (
                <span className="size-9 shrink-0 rounded-full bg-secondary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {transaction.categoryName ?? "Transaction"}
                </p>
                <p className="truncate text-caption text-muted-foreground">
                  {formatDate(transaction.transactionDate)}
                  {transaction.walletName
                    ? ` · ${transaction.walletName}`
                    : ""}
                  {transaction.note ? ` · ${transaction.note}` : ""}
                </p>
              </div>
              <p
                className={cn(
                  "shrink-0 text-sm font-medium",
                  transaction.type === "expense"
                    ? "text-danger"
                    : "text-success",
                )}
              >
                {transaction.type === "expense" ? "−" : "+"}
                {formatMoney(transaction.amount)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
