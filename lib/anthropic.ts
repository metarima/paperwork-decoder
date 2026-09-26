import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

export const DECODE_MODEL = "claude-sonnet-5";
export const FAST_MODEL = "claude-haiku-4-5";

// USD per million tokens, used for the cost readout in the UI.
const PRICES: Record<string, { input: number; output: number }> = {
  [DECODE_MODEL]: { input: 2, output: 10 },
  [FAST_MODEL]: { input: 1, output: 5 },
};

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number) {
  const price = PRICES[model];
  if (!price) return null;
  return (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
}

// Maps SDK errors to something safe to show in the UI.
export function apiErrorResponse(error: unknown) {
  if (error instanceof Anthropic.RateLimitError) {
    return Response.json({ error: "The AI service is busy. Try again in a minute." }, { status: 429 });
  }
  if (error instanceof Anthropic.AuthenticationError) {
    console.error("Anthropic auth failed. Is ANTHROPIC_API_KEY set?");
    return Response.json({ error: "Server is not configured correctly." }, { status: 500 });
  }
  if (error instanceof Anthropic.BadRequestError) {
    console.error("Bad request to Anthropic:", error.message);
    return Response.json({ error: "Couldn't read that file. Try a clearer photo or a PDF." }, { status: 400 });
  }
  if (error instanceof Anthropic.APIError) {
    console.error(`Anthropic API error ${error.status}:`, error.message);
    return Response.json({ error: "The AI service had a problem. Try again." }, { status: 502 });
  }
  console.error(error);
  return Response.json({ error: "Something went wrong." }, { status: 500 });
}
