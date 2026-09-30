import { apiClient } from "@/lib/api-client";
import { toSearchParams } from "@/types/pagination-types";
import type {
  NotificationDetailType,
  NotificationListType,
} from "../types/notification-types";

export function listNotifications(limit?: number) {
  return apiClient<NotificationListType>(
    `/notifications${toSearchParams({ limit })}`,
  );
}

export function getNotification(id: string) {
  return apiClient<NotificationDetailType>(`/notifications/${id}`);
}

export function markNotificationRead(id: string) {
  return apiClient<void>(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return apiClient<void>("/notifications/read-all", { method: "POST" });
}
