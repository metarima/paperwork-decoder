import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, apiErrorResponse, DECODE_MODEL, estimateCostUsd } from "@/lib/anthropic";
import { decodeSystemPrompt } from "@/lib/prompts";
import { checkRateLimit, clientKey, rateLimitedResponse } from "@/lib/rate-limit";
import { isAcceptedType, LetterAnalysisSchema, MAX_UPLOAD_BYTES } from "@/lib/schema";

export const maxDuration = 60;

export async function POST(request: Request) {
  const limit = checkRateLimit(`decode:${clientKey(request)}`, 20);
  if (!limit.ok) return rateLimitedResponse(limit.retryAfterSec);

  const form = await request.formData();
  const file = form.get("file");
  const explainIn = String(form.get("language") || "English").slice(0, 40);

  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!isAcceptedType(file.type)) {
    return Response.json({ error: "Upload a JPG, PNG, WebP or PDF." }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "That file is over 10MB." }, { status: 413 });
  }

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  const letter: Anthropic.ContentBlockParam =
    file.type === "application/pdf"
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
      : { type: "image", source: { type: "base64", media_type: file.type, data } };

  const started = Date.now();
  try {
    const response = await anthropic.messages.parse({
      model: DECODE_MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: zodOutputFormat(LetterAnalysisSchema) },
      system: decodeSystemPrompt(explainIn),
      messages: [
        {
          role: "user",
          content: [letter, { type: "text", text: "Here's the letter I received. What does it mean and what do I need to do?" }],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return Response.json({ error: "This document couldn't be processed." }, { status: 422 });
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      return Response.json({ error: "Couldn't make sense of that letter. Try a clearer photo." }, { status: 422 });
    }

    const { input_tokens, output_tokens } = response.usage;
    return Response.json({
      analysis: response.parsed_output,
      usage: {
        model: DECODE_MODEL,
        inputTokens: input_tokens,
        outputTokens: output_tokens,
        costUsd: estimateCostUsd(DECODE_MODEL, input_tokens, output_tokens),
        ms: Date.now() - started,
      },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
