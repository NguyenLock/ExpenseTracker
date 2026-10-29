"use client";

import { useMutation } from "@tanstack/react-query";
import type { ChatMessageType } from "../types/ai-types";
import { sendChatMessage } from "../api/ai-api";

export function useAiChat() {
  return useMutation({
    mutationFn: ({
      message,
      history,
    }: {
      message: string;
      history: ChatMessageType[];
    }) => sendChatMessage(message, history),
  });
}
