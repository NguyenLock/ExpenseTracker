import { apiClient } from "@/lib/api-client";
import type { ChatMessageType } from "../types/ai-types";

export function sendChatMessage(message: string, history: ChatMessageType[]) {
  return apiClient<{ reply: string }>("/ai/chat", {
    method: "POST",
    body: { message, history },
  });
}
