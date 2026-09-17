"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type OriginRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function originFromElement(element: Element): OriginRect {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

type OriginModalProps = {
  open: boolean;
  origin: OriginRect | null;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  closeDisabled?: boolean;
  role?: "dialog" | "alertdialog";
  /** Skip morph-back close (e.g. shatter exit already handled). */
  exitInstant?: boolean;
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION_MS = 360;

function getOriginTransform(
  panel: HTMLElement,
  source: OriginRect,
): string {
  const rect = panel.getBoundingClientRect();
  const originCx = source.x + source.width / 2;
  const originCy = source.y + source.height / 2;
  const panelCx = rect.left + rect.width / 2;
  const panelCy = rect.top + rect.height / 2;
  const dx = originCx - panelCx;
  const dy = originCy - panelCy;
  const scale = Math.max(
    0.05,
    Math.min(source.width / rect.width, source.height / rect.height),
  );
  return `translate(${dx}px, ${dy}px) scale(${scale})`;
}

export function OriginModal({
  open,
  origin,
  onClose,
  children,
  className,
  closeDisabled = false,
  role = "dialog",
  exitInstant = false,
}: OriginModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<OriginRect | null>(origin);
  const exitInstantRef = useRef(exitInstant);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    exitInstantRef.current = exitInstant;
  }, [exitInstant]);

  useEffect(() => {
    if (open && origin) {
      originRef.current = origin;
    }
  }, [open, origin]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setExpanded(false);
      const id = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setExpanded(true));
      });
      return () => window.cancelAnimationFrame(id);
    }

    if (exitInstantRef.current) {
      setMounted(false);
      setExpanded(false);
      return;
    }

    setExpanded(false);
    const timeout = window.setTimeout(() => setMounted(false), DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const source = originRef.current;
    if (!panel || !source || !mounted) return;

    if (expanded) {
      panel.style.transition = `transform ${DURATION_MS}ms ${EASE}`;
      panel.style.transform = "translate(0px, 0px) scale(1)";
      return;
    }

    panel.style.transition = open
      ? "none"
      : `transform ${DURATION_MS}ms ${EASE}`;
    panel.style.transform = getOriginTransform(panel, source);
  }, [expanded, mounted, open]);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !closeDisabled) onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, closeDisabled, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        disabled={closeDisabled}
        onClick={onClose}
        className="absolute inset-0 bg-black/25"
      />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        className={cn(
          "relative z-10 max-h-[min(90vh,720px)] w-full overflow-y-auto rounded-xl bg-surface p-5 shadow-lg ring-1 ring-border",
          "will-change-transform",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
