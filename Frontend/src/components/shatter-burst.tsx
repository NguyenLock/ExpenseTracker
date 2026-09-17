"use client";

import { motion } from "motion/react";
import { useEffect, useMemo } from "react";

export type ShatterRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type Shard = {
  id: number;
  col: number;
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
  tx: number;
  ty: number;
  rotate: number;
  delay: number;
  duration: number;
};

type ShatterBurstProps = {
  source: ShatterRect;
  markup: string;
  cols?: number;
  rows?: number;
  onDone?: () => void;
};

function buildShards(
  source: ShatterRect,
  cols: number,
  rows: number,
): Shard[] {
  const cellW = source.width / cols;
  const cellH = source.height / rows;
  const shards: Shard[] = [];
  let id = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      shards.push({
        id: id++,
        col,
        row,
        x: source.left + col * cellW,
        y: source.top + row * cellH,
        w: cellW + 0.5,
        h: cellH + 0.5,
        tx: (Math.random() - 0.5) * source.width * 1.25,
        ty: source.height * (0.7 + Math.random() * 1.1) + 160,
        rotate: (Math.random() - 0.5) * 260,
        delay: Math.random() * 0.06,
        duration: 0.55 + Math.random() * 0.4,
      });
    }
  }

  return shards;
}

export function ShatterBurst({
  source,
  markup,
  cols = 5,
  rows = 4,
  onDone,
}: ShatterBurstProps) {
  const shards = useMemo(
    () => buildShards(source, cols, rows),
    [source, cols, rows],
  );

  useEffect(() => {
    const maxMs =
      Math.max(...shards.map((shard) => (shard.delay + shard.duration) * 1000)) +
      80;
    const timeout = window.setTimeout(() => onDone?.(), maxMs);
    return () => window.clearTimeout(timeout);
  }, [shards, onDone]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/20" />
      {shards.map((shard) => (
        <motion.div
          key={shard.id}
          className="absolute overflow-hidden rounded-[2px] bg-surface shadow-md ring-1 ring-black/10"
          style={{
            left: shard.x,
            top: shard.y,
            width: shard.w,
            height: shard.h,
          }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          animate={{
            opacity: [1, 1, 0],
            x: shard.tx,
            y: shard.ty,
            rotate: shard.rotate,
            scale: 0.45 + Math.random() * 0.4,
          }}
          transition={{
            duration: shard.duration,
            delay: shard.delay,
            ease: [0.2, 0.05, 0.5, 1],
          }}
        >
          <div
            className="pointer-events-none"
            style={{
              width: source.width,
              height: source.height,
              transform: `translate(${-shard.col * (source.width / cols)}px, ${-shard.row * (source.height / rows)}px)`,
            }}
            dangerouslySetInnerHTML={{ __html: markup }}
          />
        </motion.div>
      ))}
    </div>
  );
}
