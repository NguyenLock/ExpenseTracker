"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { formatMoneyDots, parseMoneyDots } from "@/lib/money";

type MoneyInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: number | null | undefined;
  onChange: (value: number) => void;
};

export function MoneyInput({
  value,
  onChange,
  className,
  ...props
}: MoneyInputProps) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={className}
      value={formatMoneyDots(value)}
      onChange={(event) => onChange(parseMoneyDots(event.target.value))}
      {...props}
    />
  );
}
