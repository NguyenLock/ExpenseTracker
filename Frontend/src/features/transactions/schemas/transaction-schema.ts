import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().min(0.01, "Amount must be > 0"),
  walletId: z.string().uuid("Select a wallet"),
  categoryId: z.string().uuid("Select a category"),
  transactionDate: z.string().min(1, "Date is required"),
  note: z.string().trim().max(255).optional().or(z.literal("")),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
