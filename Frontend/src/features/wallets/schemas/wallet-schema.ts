import { z } from "zod";

export const walletSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  type: z.enum(["cash", "bank", "ewallet"]),
  balance: z.number().min(0, "Balance must be ≥ 0"),
});

export type WalletFormValues = z.infer<typeof walletSchema>;

export const transferWalletSchema = z
  .object({
    fromWalletId: z.string().uuid("Select source wallet"),
    toWalletId: z.string().uuid("Select destination wallet"),
    amount: z.number().min(0.01, "Amount must be > 0"),
    note: z.string().trim().max(255).optional().or(z.literal("")),
  })
  .refine((v) => v.fromWalletId !== v.toWalletId, {
    message: "Choose two different wallets",
    path: ["toWalletId"],
  });

export type TransferWalletFormValues = z.infer<typeof transferWalletSchema>;
