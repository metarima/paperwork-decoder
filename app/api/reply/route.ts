import { z } from "zod";
import { anthropic, FAST_MODEL } from "@/lib/anthropic";
import { replySystemPrompt } from "@/lib/prompts";
import { checkRateLimit, clientKey, rateLimitedResponse } from "@/lib/rate-limit";
import { LetterAnalysisSchema } from "@/lib/schema";
import { textStreamResponse } from "@/lib/stream";

const ReplyRequest = z.object({
  analysis: LetterAnalysisSchema,
  intent: z.enum(["pay", "dispute", "extension", "info"]),
  notes: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const limit = checkRateLimit(`reply:${clientKey(request)}`, 40);
  if (!limit.ok) return rateLimitedResponse(limit.retryAfterSec);

  const parsed = ReplyRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { analysis, intent, notes } = parsed.data;

  const stream = anthropic.messages.stream({
    model: FAST_MODEL,
    max_tokens: 4000,
    system: replySystemPrompt(intent, analysis.language),
    messages: [
      {
        role: "user",
        content: `Letter analysis:\n${JSON.stringify(analysis, null, 2)}${
          notes ? `\n\nExtra context from me: ${notes}` : ""
        }\n\nPlease draft the reply.`,
      },
    ],
  });
  return textStreamResponse(stream);
}
