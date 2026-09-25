"use client";

import { format, isValid, parse, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateTransaction } from "@/features/transactions/hooks/use-transaction-mutations";
import type { TransactionType } from "@/features/transactions/types/transaction-types";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { TransactionTemplateType } from "../types/transaction-template-types";

function toLocalIsoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

type DatePreset = "today" | "yesterday" | "custom";

type ShortcutQuickAddProps = {
  template: TransactionTemplateType;
  onCancel: () => void;
  onCreated: (transaction: TransactionType) => void;
};

export function ShortcutQuickAdd({
  template,
  onCancel,
  onCreated,
}: ShortcutQuickAddProps) {
  const createTx = useCreateTransaction();
  const today = toLocalIsoDate();
  const yesterday = toLocalIsoDate(subDays(new Date(), 1));

  const [preset, setPreset] = useState<DatePreset>("today");
  const [customDate, setCustomDate] = useState(today);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreset("today");
    setCustomDate(today);
    setError(null);
  }, [template.id, today]);

  const selectedDate =
    preset === "today" ? today : preset === "yesterday" ? yesterday : customDate;

  const note = template.note?.trim() || template.label;

  const handleAdd = async () => {
    setError(null);
    try {
      const created = await createTx.mutateAsync({
        type: template.type,
        amount: template.amount,
        walletId: template.walletId,
        categoryId: template.categoryId,
        note,
        transactionDate: selectedDate,
      });
      onCreated(created);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Unable to create transaction",
      );
    }
  };

  const dateLabel = (() => {
    const parsed = parse(selectedDate, "yyyy-MM-dd", new Date());
    if (!isValid(parsed)) return selectedDate;
    if (selectedDate === today) return "Today";
    if (selectedDate === yesterday) return "Yesterday";
    return format(parsed, "dd/MM/yyyy");
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-secondary/60 px-4 py-3">
        <p className="text-sm font-medium text-foreground">{template.label}</p>
        <p className="mt-0.5 text-caption text-muted-foreground">
          {template.categoryName ?? "Category"} · {template.walletName ?? "Wallet"}
        </p>
        <p
          className={cn(
            "mt-2 text-lg font-semibold",
            template.type === "expense" ? "text-danger" : "text-success",
          )}
        >
          {template.type === "expense" ? "−" : "+"}
          {formatMoney(template.amount)}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label-md text-foreground">When?</span>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "custom", label: "Pick date" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPreset(option.id)}
              className={cn(
                "h-9 rounded-lg border text-sm font-medium transition",
                preset === option.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground hover:bg-muted/40",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {preset === "custom" ? (
          <DatePicker value={customDate} onChange={setCustomDate} />
        ) : (
          <p className="text-caption text-muted-foreground">
            Will be logged as <span className="font-medium text-foreground">{dateLabel}</span>
          </p>
        )}
      </div>

      {error ? <p className="text-error">{error}</p> : null}

      <div className="flex gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          className="h-10 flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="h-10 flex-1"
          disabled={createTx.isPending}
          onClick={() => void handleAdd()}
        >
          {createTx.isPending ? "Adding…" : "Add"}
        </Button>
      </div>
    </div>
  );
}
