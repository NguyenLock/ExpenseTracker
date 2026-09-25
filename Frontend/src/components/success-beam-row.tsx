"use client";

import { motion } from "motion/react";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type SuccessBeamRowProps = {
  children: ReactNode;
  celebrate?: boolean;
  className?: string;
  onCelebrationComplete?: () => void;
};

const BEAM_MS = 800;
const HIGHLIGHT_MS = 1000;
const ENTER_MS = 300;
const EASE = [0.22, 1, 0.36, 1] as const;

export function SuccessBeamRow({
  children,
  celebrate = false,
  className,
  onCelebrationComplete,
}: SuccessBeamRowProps) {
  const [phase, setPhase] = useState<"idle" | "sweep" | "fade">(
    celebrate ? "sweep" : "idle",
  );

  useEffect(() => {
    if (!celebrate) {
      setPhase("idle");
      return;
    }
    setPhase("sweep");
  }, [celebrate]);

  useEffect(() => {
    if (phase !== "sweep") return;

    const afterSweep = window.setTimeout(
      () => setPhase("fade"),
      ENTER_MS + BEAM_MS,
    );
    return () => window.clearTimeout(afterSweep);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fade") return;

    const done = window.setTimeout(() => {
      setPhase("idle");
      onCelebrationComplete?.();
    }, HIGHLIGHT_MS);

    return () => window.clearTimeout(done);
  }, [phase, onCelebrationComplete]);

  const sweeping = phase === "sweep";

  const cells = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    const cell = child as ReactElement<{
      children?: ReactNode;
      className?: string;
    }>;

    return cloneElement(cell, {
      children: (
        <motion.div
          className="block w-full min-w-0"
          initial={celebrate ? { opacity: 0, x: -14 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: BEAM_MS / 1000,
            delay: celebrate ? ENTER_MS / 1000 : 0,
            ease: EASE,
          }}
        >
          {cell.props.children}
        </motion.div>
      ),
    });
  });

  return (
    <motion.tr
      className={cn(
        "relative border-b border-black/[0.04] last:border-0",
        className,
      )}
      initial={celebrate ? { opacity: 0, y: -12 } : false}
      animate={
        phase === "fade"
          ? {
              opacity: 1,
              y: 0,
              backgroundColor: [
                "rgba(34, 197, 94, 0.10)",
                "rgba(255, 255, 255, 0)",
              ],
            }
          : { opacity: 1, y: 0, backgroundColor: "rgba(255, 255, 255, 0)" }
      }
      transition={{
        opacity: { duration: ENTER_MS / 1000, ease: EASE },
        y: { duration: ENTER_MS / 1000, ease: EASE },
        backgroundColor:
          phase === "fade"
            ? { duration: HIGHLIGHT_MS / 1000, ease: "easeOut" }
            : { duration: 0 },
      }}
    >
      {cells}

      {sweeping ? (
        <td
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden p-0"
        >
          <motion.div
            className="absolute inset-0 bg-surface"
            initial={{ clipPath: "inset(0 0% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 100%)" }}
            transition={{
              duration: BEAM_MS / 1000,
              delay: ENTER_MS / 1000,
              ease: EASE,
            }}
          />

          <motion.div
            className="absolute inset-y-0 w-20 will-change-transform"
            style={
              {
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(34,197,94,0.8) 50%, transparent 100%)",
                boxShadow:
                  "0 0 24px rgba(34,197,94,0.55), 0 0 8px rgba(34,197,94,0.35)",
              } as CSSProperties
            }
            initial={{ left: "-5rem" }}
            animate={{ left: "100%" }}
            transition={{
              duration: BEAM_MS / 1000,
              delay: ENTER_MS / 1000,
              ease: EASE,
            }}
          />
        </td>
      ) : null}
    </motion.tr>
  );
}
