import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CHAT } from "./chat-config";
import { chatReply } from "./chat.server";

export const sendChat = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(CHAT.maxChars) }))
          .min(1)
          .max(CHAT.maxTurns),
      })
      .parse(d),
  )
  .handler(async ({ data }) => chatReply(data.messages));
