import { AuthGuard } from "@/features/auth/components/auth-guard";
import { AppShell } from "@/components/app-shell";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
