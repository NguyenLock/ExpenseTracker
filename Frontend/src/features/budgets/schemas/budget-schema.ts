import { z } from "zod";

export const budgetSchema = z
  .object({
    isOverall: z.boolean(),
    categoryId: z.string().uuid("Select a category").optional().or(z.literal("")),
    amount: z.number().min(0.01, "Amount must be > 0"),
    month: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be YYYY-MM"),
  })
  .superRefine((values, ctx) => {
    if (!values.isOverall && !values.categoryId) {
      ctx.addIssue({
        code: "custom",
        message: "Select a category",
        path: ["categoryId"],
      });
    }
  });

export type BudgetFormValues = z.infer<typeof budgetSchema>;

export type BudgetPayload = {
  categoryId?: string | null;
  amount: number;
  month: string;
};
