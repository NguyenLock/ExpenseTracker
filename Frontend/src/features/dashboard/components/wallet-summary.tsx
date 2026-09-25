import Link from "next/link";
import type { DashboardWalletSummaryType } from "../types/dashboard-types";
import type { WalletTypeEnum } from "@/features/wallets/types/wallet-types";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<WalletTypeEnum, string> = {
  cash: "Cash",
  bank: "Bank",
  ewallet: "E-wallet",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

type WalletSummaryProps = {
  wallets: DashboardWalletSummaryType[];
};

export function WalletSummary({ wallets }: WalletSummaryProps) {
  const maxBalance = Math.max(...wallets.map((w) => w.balance), 1);

  return (
    <section className="rounded-2xl bg-surface shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="text-h4 text-foreground">Wallet summary</h3>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Balances across your accounts
          </p>
        </div>
        <Link
          href="/settings/wallets"
          className="text-sm font-medium text-primary transition hover:opacity-90"
        >
          Manage
        </Link>
      </div>

      {wallets.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-body-md text-foreground">No wallets yet</p>
          <p className="mt-1 text-caption text-muted-foreground">
            Add a wallet to track balances here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4 px-5 py-4">
          {wallets.map((wallet) => {
            const width = Math.max((wallet.balance / maxBalance) * 100, 4);
            return (
              <li key={wallet.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {wallet.name}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {TYPE_LABEL[wallet.type]}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-foreground">
                    {formatMoney(wallet.balance)}
                  </p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full bg-primary")}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
