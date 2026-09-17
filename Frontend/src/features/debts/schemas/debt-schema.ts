import { z } from "zod";

export const debtSchema = z.object({
  personName: z.string().trim().min(1, "Person is required").max(80),
  amount: z.number().min(0.01, "Amount must be > 0"),
  direction: z.enum(["i_owe", "owed_to_me"]),
  dueDate: z.string().min(1, "Due date is required"),
  note: z.string().trim().max(255).optional().or(z.literal("")),
  autoRecord: z.boolean(),
  walletId: z.string().uuid("Select a wallet"),
  categoryId: z.string().uuid("Select a category"),
});

export type DebtFormValues = z.infer<typeof debtSchema>;
