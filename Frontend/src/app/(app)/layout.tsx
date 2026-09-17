import { AuthGuard } from "@/features/auth/components/auth-guard";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
