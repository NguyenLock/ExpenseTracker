"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useCurrentUser } from "../hooks/use-current-user";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isFetched } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && isFetched && !user) {
      router.replace("/login");
    }
  }, [isLoading, isFetched, user, router]);

  if (isLoading || !isFetched) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-body-md text-muted">Checking session…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <p className="text-body-md text-muted">Redirecting to sign in…</p>
      </main>
    );
  }

  return children;
}
