export type CategoryTypeEnum = "income" | "expense";

export type CategoryType = {
  id: string;
  userId: string;
  name: string;
  type: CategoryTypeEnum;
  icon: string;
  createdAt: string;
  updatedAt: string;
};
