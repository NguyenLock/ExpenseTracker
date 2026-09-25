import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  type: z.enum(["income", "expense"]),
  icon: z.string().trim().min(1, "Icon is required").max(50),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
