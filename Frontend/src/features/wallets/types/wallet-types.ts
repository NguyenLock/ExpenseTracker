export type WalletTypeEnum = "cash" | "bank" | "ewallet";

export type WalletType = {
  id: string;
  userId: string;
  name: string;
  type: WalletTypeEnum;
  balance: number;
  createdAt: string;
  updatedAt: string;
};
