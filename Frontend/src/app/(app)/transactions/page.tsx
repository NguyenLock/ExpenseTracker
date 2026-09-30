import { TransactionsPage } from "@/features/transactions/components/transactions-page";

type TransactionsRoutePageProps = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function TransactionsRoutePage({
  searchParams,
}: TransactionsRoutePageProps) {
  const { from, to } = await searchParams;
  return (
    <TransactionsPage
      key={`${from ?? ""}_${to ?? ""}`}
      initialFrom={from}
      initialTo={to}
    />
  );
}
