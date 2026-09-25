import { CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_ICON_COLORS,
  CATEGORY_ICON_MAP,
  isCategoryIconName,
} from "../constants/category-icons";

type CategoryIconBadgeProps = {
  icon: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: { wrap: "size-9", icon: "size-4" },
  md: { wrap: "size-11", icon: "size-5" },
  lg: { wrap: "size-14", icon: "size-6" },
} as const;

export function CategoryIconBadge({
  icon,
  size = "md",
  className,
}: CategoryIconBadgeProps) {
  const key = isCategoryIconName(icon) ? icon : null;
  const Icon = key ? CATEGORY_ICON_MAP[key] : CircleDot;
  const colors = key
    ? CATEGORY_ICON_COLORS[key]
    : { bg: "#EEF2FF", fg: "#2563EB" };
  const dims = SIZE[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        dims.wrap,
        className,
      )}
      style={{ backgroundColor: colors.bg, color: colors.fg }}
      aria-hidden
    >
      <Icon className={dims.icon} strokeWidth={2} />
    </span>
  );
}
