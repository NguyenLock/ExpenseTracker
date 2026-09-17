"use client";

import { Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { OriginModal, type OriginRect } from "./origin-modal";
import { ShatterBurst, type ShatterRect } from "./shatter-burst";

type ConfirmDialogProps = {
  open: boolean;
  origin: OriginRect | null;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

type ExitPhase = "idle" | "shake" | "shatter";

type ShatterState = {
  rect: ShatterRect;
  markup: string;
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<ExitPhase>("idle");
  const [shatter, setShatter] = useState<ShatterState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) {
      setPhase("idle");
      setShatter(null);
      setBusy(false);
    }
  }, [open]);

  const handleConfirm = () => {
    if (busy || loading || phase !== "idle") return;
    setBusy(true);
    setPhase("shake");
  };

  const handleShakeComplete = () => {
    if (phase !== "shake") return;

    const content = contentRef.current;
    const panel = content?.closest('[role="alertdialog"]') as HTMLElement | null;
    const target = panel ?? content;
    if (!target) {
      void Promise.resolve(onConfirm()).finally(() => onCancel());
      return;
    }

    const rect = target.getBoundingClientRect();
    setShatter({
      rect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      },
      markup: target.outerHTML,
    });
    setPhase("shatter");
    void Promise.resolve(onConfirm()).catch(() => undefined);
  };

  const locked = busy || loading || phase !== "idle";

  return (
    <>
      <OriginModal
        open={open && phase !== "shatter"}
        origin={origin}
        onClose={onCancel}
        closeDisabled={locked}
        role="alertdialog"
        className="max-w-sm"
        exitInstant={phase === "shatter"}
      >
        <motion.div
          ref={contentRef}
          animate={
            phase === "shake"
              ? {
                  x: [0, -8, 8, -8, 8, -5, 5, 0],
                  rotate: [0, -1.8, 1.8, -1.2, 1.2, 0],
                }
              : { x: 0, rotate: 0 }
          }
          transition={
            phase === "shake"
              ? { duration: 0.4, ease: "easeInOut" }
              : { duration: 0 }
          }
          onAnimationComplete={() => {
            if (phase === "shake") handleShakeComplete();
          }}
        >
          <div
            className={cn(
              "mb-4 inline-flex size-10 items-center justify-center rounded-lg",
              tone === "danger"
                ? "bg-danger/10 text-danger"
                : "bg-primary/10 text-primary",
            )}
          >
            <Trash2 className="size-4" />
          </div>

          <h2 className="text-h4 text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1.5 text-body-sm leading-5 text-muted">
              {description}
            </p>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4">
            <button
              type="button"
              disabled={locked}
              onClick={onCancel}
              className="h-10 rounded-lg border border-border bg-surface text-button-md text-foreground transition hover:bg-background disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={locked}
              onClick={handleConfirm}
              className={cn(
                "h-10 rounded-lg text-button-md text-white transition hover:opacity-95 disabled:opacity-60",
                tone === "danger" ? "bg-danger" : "bg-primary",
              )}
            >
              {loading || busy ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </motion.div>
      </OriginModal>

      {phase === "shatter" && shatter ? (
        <ShatterBurst
          source={shatter.rect}
          markup={shatter.markup}
          onDone={onCancel}
        />
      ) : null}
    </>
  );
}
