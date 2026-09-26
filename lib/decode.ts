import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, DECODE_MODEL, estimateCostUsd } from "./anthropic";
import { decodeSystemPrompt } from "./prompts";
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

// Shared by the API route and the eval runner so both exercise the same prompt.
export async function decodeLetter(base64: string, mediaType: AcceptedType, explainIn = "English"): Promise<DecodeResult> {
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
    messages: [
      {
        role: "user",
        content: [letter, { type: "text", text: "Here's the letter I received. What does it mean and what do I need to do?" }],
      },
    ],
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
