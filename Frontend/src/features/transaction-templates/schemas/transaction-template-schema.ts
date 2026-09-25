import { z } from "zod";

export const transactionTemplateSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(80),
  type: z.enum(["income", "expense"]),
  amount: z.number().min(0.01, "Amount must be > 0"),
  walletId: z.string().uuid("Select a wallet"),
  categoryId: z.string().uuid("Select a category"),
  note: z.string().trim().max(255).optional().or(z.literal("")),
});

export type TransactionTemplateFormValues = z.infer<
  typeof transactionTemplateSchema
>;
