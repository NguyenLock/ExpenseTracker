import { z } from "zod";

export const goalSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  targetAmount: z.number().min(0.01, "Target must be > 0"),
  savedAmount: z.number().min(0).optional(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
    .optional()
    .or(z.literal("")),
  walletId: z.string().uuid().optional().or(z.literal("")),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

export type GoalPayload = {
  name: string;
  targetAmount: number;
  savedAmount?: number;
  deadline?: string | null;
  walletId?: string | null;
};

export function toGoalPayload(values: GoalFormValues): GoalPayload {
  return {
    name: values.name.trim(),
    targetAmount: values.targetAmount,
    savedAmount: values.savedAmount ?? 0,
    deadline: values.deadline ? values.deadline : null,
    walletId: values.walletId ? values.walletId : null,
  };
}

export const contributeSchema = z.object({
  amount: z.number().min(0.01, "Amount must be > 0"),
  fromWalletId: z.string().uuid("Select a wallet"),
  categoryId: z.string().uuid("Select a category"),
  note: z.string().max(255).optional(),
});

export type ContributeFormValues = z.infer<typeof contributeSchema>;

export const planSchema = z.object({
  monthlyIncome: z.number().min(0, "Income must be ≥ 0"),
  extraFixed: z.number().min(0).optional(),
  useDebts: z.boolean(),
});

export type PlanFormValues = z.infer<typeof planSchema>;

export const fixedCostSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(80),
  amount: z.number().min(0.01, "Amount must be > 0"),
  isActive: z.boolean().optional(),
});

export type FixedCostFormValues = z.infer<typeof fixedCostSchema>;
