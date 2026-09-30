"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/use-notifications";
import type { NotificationType } from "../types/notification-types";
import { NotificationDetailSheet } from "./notification-detail-sheet";
import { NotificationItem } from "./notification-item";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationType | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unread = data?.unreadCount ?? 0;
  const items = data?.items ?? [];

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) void refetch();
  };

  const handleSelect = (notification: NotificationType) => {
    if (notification.readAt === null) markRead.mutate(notification.id);
    setOpen(false);
    setSelected(notification);
    setDetailOpen(true);
  };

  return (
    <>
      <NotificationDetailSheet
        notification={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-primary relative inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-2"
        >
          <Bell className="size-[18px]" />
          {unread > 0 ? (
            <span
              aria-hidden
              className="bg-danger absolute top-1 right-1 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold text-white"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[min(22rem,calc(100vw-2rem))] gap-1 p-1.5"
        >
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <p className="text-foreground text-sm font-semibold">
              Notifications
            </p>
            {unread > 0 ? (
              <button
                type="button"
                disabled={markAllRead.isPending}
                onClick={() => markAllRead.mutate()}
                className="text-primary text-xs font-medium hover:opacity-90 disabled:opacity-60"
              >
                Mark all as read
              </button>
            ) : null}
          </div>

          <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2 p-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : isError ? (
              <div className="text-muted-foreground px-3 py-6 text-center text-sm">
                Couldn&apos;t load notifications.{" "}
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="text-primary font-medium hover:opacity-90"
                >
                  Retry
                </button>
              </div>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                No notifications yet. Weekly summaries arrive every Monday,
                monthly ones on the 1st.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {items.map((notification) => (
                  <li key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      onSelect={handleSelect}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
