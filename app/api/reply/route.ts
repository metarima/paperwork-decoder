import { z } from "zod";
import { anthropic, FAST_MODEL } from "@/lib/anthropic";
import { gemini, GEMINI_FAST_FALLBACK, GEMINI_FAST_MODEL, withGeminiFallback } from "@/lib/gemini";
import { DEFAULT_LOCALE, LOCALE_CODES } from "@/lib/locales";
import { replySystemPrompt } from "@/lib/prompts";
import { getProvider } from "@/lib/provider";
import { checkRateLimit, clientKey, rateLimitedResponse } from "@/lib/rate-limit";
import { LetterAnalysisSchema } from "@/lib/schema";
import { geminiTextStreamResponse, textStreamResponse } from "@/lib/stream";

const ReplyRequest = z.object({
  analysis: LetterAnalysisSchema,
  intent: z.enum(["pay", "dispute", "extension", "info"]),
  notes: z.string().max(1000).optional(),
  locale: z.enum(LOCALE_CODES).default(DEFAULT_LOCALE),
});

export async function POST(request: Request) {
  const limit = checkRateLimit(`reply:${clientKey(request)}`, 40);
  if (!limit.ok) return rateLimitedResponse(limit.retryAfterSec);

  const parsed = ReplyRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const { analysis, intent, notes, locale } = parsed.data;
  const needsTranslation = analysis.languageCode.toLowerCase().split("-")[0] !== locale;
  const system = replySystemPrompt(intent, analysis.language, locale, needsTranslation);
  const prompt = `Letter analysis:\n${JSON.stringify(analysis, null, 2)}${
    notes ? `\n\nExtra context from me: ${notes}` : ""
  }\n\nPlease draft the reply.`;

  if (getProvider() === "gemini") {
    return geminiTextStreamResponse(async () => {
      const { result } = await withGeminiFallback([GEMINI_FAST_MODEL, GEMINI_FAST_FALLBACK], (model) =>
        gemini().models.generateContentStream({
          model,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { systemInstruction: system, maxOutputTokens: 4000 },
        }),
      );
      return result;
    });
  }

  const stream = anthropic.messages.stream({
    model: FAST_MODEL,
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: prompt }],
  });
  return textStreamResponse(stream);
}
