import {
  Briefcase,
  Car,
  Coffee,
  Gamepad2,
  Gift,
  Heart,
  Home,
  Plane,
  ShoppingBag,
  Smartphone,
  Utensils,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICON_OPTIONS = [
  "utensils",
  "car",
  "home",
  "heart",
  "shopping-bag",
  "plane",
  "coffee",
  "gift",
  "briefcase",
  "wallet",
  "smartphone",
  "gamepad-2",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICON_OPTIONS)[number];

export const CATEGORY_ICON_MAP: Record<CategoryIconName, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  home: Home,
  heart: Heart,
  "shopping-bag": ShoppingBag,
  plane: Plane,
  coffee: Coffee,
  gift: Gift,
  briefcase: Briefcase,
  wallet: Wallet,
  smartphone: Smartphone,
  "gamepad-2": Gamepad2,
};

/** Soft tints in the Money Lover spirit */
export const CATEGORY_ICON_COLORS: Record<
  CategoryIconName,
  { bg: string; fg: string }
> = {
  utensils: { bg: "#FFE8E0", fg: "#E85D4C" },
  car: { bg: "#E8F1FF", fg: "#3B82F6" },
  home: { bg: "#E7F8EF", fg: "#22C55E" },
  heart: { bg: "#FCE7F3", fg: "#EC4899" },
  "shopping-bag": { bg: "#F3E8FF", fg: "#A855F7" },
  plane: { bg: "#E0F7FA", fg: "#06B6D4" },
  coffee: { bg: "#FFF4E5", fg: "#F59E0B" },
  gift: { bg: "#FFE4EC", fg: "#F43F5E" },
  briefcase: { bg: "#EEF2FF", fg: "#6366F1" },
  wallet: { bg: "#ECFDF5", fg: "#10B981" },
  smartphone: { bg: "#F1F5F9", fg: "#64748B" },
  "gamepad-2": { bg: "#EDE9FE", fg: "#8B5CF6" },
};

export function isCategoryIconName(value: string): value is CategoryIconName {
  return value in CATEGORY_ICON_MAP;
}
