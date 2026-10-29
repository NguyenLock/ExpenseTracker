export type ChatRoleType = "user" | "assistant";

export type ChatMessageType = {
  role: ChatRoleType;
  content: string;
};
