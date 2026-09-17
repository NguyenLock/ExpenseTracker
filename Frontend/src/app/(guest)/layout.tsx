import { GuestGuard } from "@/features/auth/components/guest-guard";
import type { ReactNode } from "react";

export default function GuestLayout({ children }: { children: ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
