"use client";

import { Wallet } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/features/auth/api/auth-api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const handleLogout = async () => {
    await logoutUser();
    queryClient.setQueryData(["auth", "me"], null);
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    router.replace("/login");
  };

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wallet className="size-7 text-primary" aria-hidden />
          <h1 className="text-h1 text-foreground">Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-button-md items-center justify-center rounded-lg border border-black/10 bg-surface px-4 text-button-md text-foreground hover:bg-background"
        >
          Sign out
        </button>
      </header>

      <section className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="text-h3 text-foreground">Welcome back</h2>
        <p className="mt-2 text-body-md text-muted">
          Signed in as{" "}
          <span className="font-medium text-foreground">{user?.name}</span> (
          {user?.email})
        </p>
      </section>
    </main>
  );
}
