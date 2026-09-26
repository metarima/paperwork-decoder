import { z } from "zod";
import { anthropic, FAST_MODEL } from "@/lib/anthropic";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { checkRateLimit, clientKey, rateLimitedResponse } from "@/lib/rate-limit";
import { LetterAnalysisSchema } from "@/lib/schema";
import { textStreamResponse } from "@/lib/stream";

const ChatRequest = z.object({
  analysis: LetterAnalysisSchema,
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const limit = checkRateLimit(`chat:${clientKey(request)}`, 60);
  if (!limit.ok) return rateLimitedResponse(limit.retryAfterSec);

  const parsed = ChatRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.messages[0].role !== "user") {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { analysis, messages } = parsed.data;

  const stream = anthropic.messages.stream({
    model: FAST_MODEL,
    max_tokens: 2000,
    // The analysis is identical for every turn of the conversation, so it sits
    // in the system prompt where it can be cached.
    system: [
      { type: "text", text: CHAT_SYSTEM_PROMPT },
      {
        type: "text",
        text: `Letter analysis:\n${JSON.stringify(analysis, null, 2)}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });
  return textStreamResponse(stream);
}
