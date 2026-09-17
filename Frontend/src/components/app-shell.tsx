"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Tags,
  Wallet,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { logoutUser } from "@/features/auth/api/auth-api";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings/categories", label: "Categories", icon: Tags },
] as const;

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      <p className="mb-2 px-3 text-sidebar-section text-muted">Menu</p>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-item transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-background hover:text-foreground",
            )}
          >
            <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title =
    NAV_ITEMS.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
    )?.label ?? "ExpenseTracker";

  const handleLogout = async () => {
    await logoutUser();
    queryClient.setQueryData(["auth", "me"], null);
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    router.replace("/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-3 py-1">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Wallet className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-body-md font-semibold text-foreground">
            ExpenseTracker
          </p>
          <p className="truncate text-caption text-muted">{user?.email}</p>
        </div>
      </div>

      <div className="mt-8 flex-1">
        <NavLinks
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-item text-muted transition-colors hover:bg-background hover:text-foreground"
      >
        <LogOut className="size-5" />
        Sign out
      </button>
    </div>
  );

  return (
    <div className="flex min-h-full w-full flex-1 bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-black/[0.06] bg-surface px-4 py-6 lg:block">
        {sidebarContent}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[min(18rem,85vw)] flex-col border-r border-black/[0.06] bg-surface px-4 py-6 shadow-xl">
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted hover:bg-background"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-black/[0.06] bg-surface/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-xl bg-background text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            {pathname.startsWith("/settings") ? (
              <p className="text-caption text-muted">Settings</p>
            ) : null}
            <h1 className="truncate text-h3 text-foreground">{title}</h1>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
