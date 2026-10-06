// Chatbot settings. Safe to edit. Nothing secret lives here.
export const CHAT = {
  model: "claude-haiku-4-5-20251001", // fast and low-cost
  maxMessagesPerHour: 20, // per visitor
  maxMessagesPerDay: 300, // whole shop; this is the hard cap on your AI bill
  maxTurns: 12, // messages remembered in one conversation
  maxChars: 600, // longest single customer message
};

export type ChatItem = {
  slug: string;
  name: string;
  category_name: string;
  subcategory: string;
  price: number | null;
  in_stock: boolean;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ChatResult =
  | { ok: true; reply: string; items: ChatItem[] }
  | { ok: false; code: "limit" | "busy" | "unavailable" | "error"; message: string };
