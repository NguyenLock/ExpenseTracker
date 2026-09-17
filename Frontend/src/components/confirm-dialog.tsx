"use client";

import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { OriginModal, type OriginRect } from "./origin-modal";

type ConfirmDialogProps = {
  open: boolean;
  origin: OriginRect | null;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  origin,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <OriginModal
      open={open}
      origin={origin}
      onClose={onCancel}
      closeDisabled={loading}
      role="alertdialog"
      className="max-w-sm"
    >
      <div
        className={cn(
          "mb-4 inline-flex size-12 items-center justify-center rounded-2xl",
          tone === "danger"
            ? "bg-danger/10 text-danger"
            : "bg-primary/10 text-primary",
        )}
      >
        <Trash2 className="size-5" />
      </div>

      <h2 className="text-h3 text-foreground">{title}</h2>
      {description ? (
        <p className="mt-2 text-body-md leading-6 text-muted">{description}</p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={onCancel}
          className="h-11 rounded-2xl bg-background text-button-md text-foreground transition hover:bg-black/[0.04] active:scale-[0.98] disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={cn(
            "h-11 rounded-2xl text-button-md text-white transition active:scale-[0.98] disabled:opacity-60",
            tone === "danger"
              ? "bg-danger shadow-lg shadow-danger/20 hover:opacity-95"
              : "bg-primary shadow-lg shadow-primary/20 hover:opacity-95",
          )}
        >
          {loading ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </OriginModal>
  );
}
