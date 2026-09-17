import { z } from "zod";

const dayOfMonth = z.number().int().min(1).max(28);

export const debtSchema = z
  .object({
    personName: z.string().trim().min(1, "Person is required").max(80),
    amount: z.number().min(0.01, "Amount must be > 0"),
    direction: z.enum(["i_owe", "owed_to_me"]),
    dueDate: z.string().min(1, "Due date is required"),
    installmentCount: z.number().int().min(1).max(60),
    payWindowStartDay: z.union([dayOfMonth, z.nan()]).optional(),
    payWindowEndDay: z.union([dayOfMonth, z.nan()]).optional(),
    note: z.string().trim().max(255).optional().or(z.literal("")),
    autoRecord: z.boolean(),
    walletId: z.string().uuid("Select a wallet"),
    categoryId: z.string().uuid("Select a category"),
  })
  .superRefine((values, ctx) => {
    const start = values.payWindowStartDay;
    const end = values.payWindowEndDay;
    const hasStart = typeof start === "number" && !Number.isNaN(start);
    const hasEnd = typeof end === "number" && !Number.isNaN(end);
    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: "custom",
        message: "Set both window start and end days",
        path: hasStart ? ["payWindowEndDay"] : ["payWindowStartDay"],
      });
    }
  });

export type DebtFormValues = z.infer<typeof debtSchema>;

export type DebtPayload = {
  personName: string;
  amount: number;
  direction: "i_owe" | "owed_to_me";
  dueDate: string;
  installmentCount: number;
  payWindowStartDay: number | null;
  payWindowEndDay: number | null;
  note?: string;
  autoRecord: boolean;
  walletId: string;
  categoryId: string;
};

export function toDebtPayload(values: DebtFormValues): DebtPayload {
  const start = values.payWindowStartDay;
  const end = values.payWindowEndDay;
  const hasWindow =
    typeof start === "number" &&
    !Number.isNaN(start) &&
    typeof end === "number" &&
    !Number.isNaN(end);

  return {
    personName: values.personName,
    // amount = tiền mỗi tháng / mỗi kỳ
    amount: values.amount,
    direction: values.direction,
    dueDate: values.dueDate,
    installmentCount: Math.max(1, values.installmentCount),
    payWindowStartDay: hasWindow ? start : null,
    payWindowEndDay: hasWindow ? end : null,
    note: values.note || undefined,
    autoRecord:
      values.direction === "owed_to_me" ? values.autoRecord : false,
    walletId: values.walletId,
    categoryId: values.categoryId,
  };
}
