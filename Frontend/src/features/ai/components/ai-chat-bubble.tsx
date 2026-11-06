"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAiChat } from "../hooks/use-ai-chat";
import type { ChatMessageType } from "../types/ai-types";

const SUGGESTED_QUESTIONS = [
  "Tháng này tôi tiêu gì nhiều nhất?",
  "Số dư các ví hiện tại là bao nhiêu?",
  "Liệt kê 5 giao dịch gần đây nhất",
  "Tháng này tôi tiêu bao nhiêu rồi?",
];

export function AiChatBubble() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const mutation = useAiChat();

  const errorMessage =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? "Couldn't reach the assistant"
        : null;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;

    const history = messages;
    setMessages([...history, { role: "user", content: trimmed }]);
    setInput("");

    mutation.mutate(
      { message: trimmed, history },
      {
        onSuccess: (response) => {
          setMessages((current) => [
            ...current,
            { role: "assistant", content: response.reply },
          ]);
        },
      },
    );
  };

  return (
    <>
      <div
        className={cn(
          "fixed right-5 bottom-24 z-50 flex w-[min(22rem,calc(100vw-2.5rem))] origin-bottom-right flex-col overflow-hidden rounded-2xl bg-surface shadow-xl ring-1 ring-black/[0.06] transition-all duration-200 ease-out",
          open
            ? "h-[min(32rem,calc(100vh-9rem))] scale-100 opacity-100"
            : "pointer-events-none h-0 scale-95 opacity-0",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-primary px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <MessageCircle className="size-4" />
            <p className="text-sm font-semibold">Trợ lý chi tiêu</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="inline-flex size-7 items-center justify-center rounded-lg text-white/90 transition hover:bg-white/15"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-3">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col justify-end gap-2">
              <p className="text-caption text-muted-foreground">
                Chọn nhanh một câu hỏi hoặc tự gõ bên dưới:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => send(question)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs text-foreground transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "self-end bg-primary text-white"
                    : "self-start bg-background text-foreground",
                )}
              >
                {message.content}
              </div>
            ))
          )}
          {mutation.isPending ? (
            <div className="self-start rounded-xl bg-background px-3 py-2 text-sm text-muted-foreground">
              Đang trả lời…
            </div>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="text-error shrink-0 px-3 text-xs">{errorMessage}</p>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
          className="flex shrink-0 items-center gap-2 border-t border-border p-2"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Nhập câu hỏi…"
            disabled={mutation.isPending}
            className="h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={mutation.isPending || !input.trim()}
            aria-label="Send"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition hover:opacity-95 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed right-5 bottom-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:opacity-95 active:scale-95"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </button>
    </>
  );
}
