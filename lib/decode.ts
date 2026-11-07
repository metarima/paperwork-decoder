import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { FinishReason } from "@google/genai";
import { z } from "zod";
import { anthropic, DECODE_MODEL, estimateCostUsd } from "./anthropic";
import { gemini, GEMINI_DECODE_FALLBACK, GEMINI_DECODE_MODEL, withGeminiFallback } from "./gemini";
import { DEFAULT_LOCALE, type Locale } from "./locales";
import { decodeSystemPrompt } from "./prompts";
import { getProvider } from "./provider";
import { type AcceptedType, type LetterAnalysis, LetterAnalysisSchema } from "./schema";

export type DecodeUsage = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number | null;
  ms: number;
};

export type DecodeResult =
  | { ok: true; analysis: LetterAnalysis; usage: DecodeUsage }
  | { ok: false; reason: "refusal" | "unparseable" };

const USER_PROMPT = "Here's the letter I received. What does it mean and what do I need to do?";

// Shared by the API route and the eval runner so both exercise the same prompt.
export async function decodeLetter(base64: string, mediaType: AcceptedType, explainIn: Locale = DEFAULT_LOCALE): Promise<DecodeResult> {
  return getProvider() === "gemini"
    ? decodeWithGemini(base64, mediaType, explainIn)
    : decodeWithClaude(base64, mediaType, explainIn);
}

async function decodeWithClaude(base64: string, mediaType: AcceptedType, explainIn: Locale): Promise<DecodeResult> {
  const letter: Anthropic.ContentBlockParam =
    mediaType === "application/pdf"
      ? { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } }
      : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };

  const started = Date.now();
  const response = await anthropic.messages.parse({
    model: DECODE_MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: zodOutputFormat(LetterAnalysisSchema) },
    system: decodeSystemPrompt(explainIn),
    messages: [{ role: "user", content: [letter, { type: "text", text: USER_PROMPT }] }],
  });

  if (response.stop_reason === "refusal") return { ok: false, reason: "refusal" };
  if (response.stop_reason === "max_tokens" || !response.parsed_output) return { ok: false, reason: "unparseable" };

  const { input_tokens, output_tokens } = response.usage;
  return {
    ok: true,
    analysis: response.parsed_output,
    usage: {
      model: DECODE_MODEL,
      inputTokens: input_tokens,
      outputTokens: output_tokens,
      costUsd: estimateCostUsd(DECODE_MODEL, input_tokens, output_tokens),
      ms: Date.now() - started,
    },
  };
}

// JSON Schema sent to Gemini for constrained output. "$schema" is dropped
// because Gemini only accepts the schema body itself.
export function letterJsonSchema() {
  const schema = z.toJSONSchema(LetterAnalysisSchema) as Record<string, unknown>;
  delete schema.$schema;
  return schema;
}

const BLOCKED: string[] = [FinishReason.SAFETY, FinishReason.PROHIBITED_CONTENT, FinishReason.BLOCKLIST, FinishReason.SPII];

async function decodeWithGemini(base64: string, mediaType: AcceptedType, explainIn: Locale): Promise<DecodeResult> {
  const started = Date.now();
  const { model, result: response } = await withGeminiFallback([GEMINI_DECODE_MODEL, GEMINI_DECODE_FALLBACK], (model) =>
    gemini().models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: mediaType, data: base64 } }, { text: USER_PROMPT }] }],
      config: {
        systemInstruction: decodeSystemPrompt(explainIn),
        maxOutputTokens: 16000,
        responseMimeType: "application/json",
        responseJsonSchema: letterJsonSchema(),
      },
    }),
  );

  const finish = response.candidates?.[0]?.finishReason;
  if (response.promptFeedback?.blockReason || (finish && BLOCKED.includes(finish))) return { ok: false, reason: "refusal" };
  if (finish === FinishReason.MAX_TOKENS || !response.text) return { ok: false, reason: "unparseable" };

  // Gemini enforces the schema's shape, but we still validate before trusting it.
  let json: unknown;
  try {
    json = JSON.parse(response.text);
  } catch {
    return { ok: false, reason: "unparseable" };
  }
  const parsed = LetterAnalysisSchema.safeParse(json);
  if (!parsed.success) return { ok: false, reason: "unparseable" };

  const usage = response.usageMetadata;
  return {
    ok: true,
    analysis: parsed.data,
    usage: {
      model,
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: (usage?.candidatesTokenCount ?? 0) + (usage?.thoughtsTokenCount ?? 0),
      costUsd: null,
      ms: Date.now() - started,
    },
  };
}
