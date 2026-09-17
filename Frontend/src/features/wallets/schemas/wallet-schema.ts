import { z } from "zod";

export const walletSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  type: z.enum(["cash", "bank", "ewallet"]),
  balance: z.number().min(0, "Balance must be ≥ 0"),
});

export type WalletFormValues = z.infer<typeof walletSchema>;
