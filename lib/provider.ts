import { anthropicErrorResponse } from "./anthropic";
import { geminiErrorResponse } from "./gemini";

export type Provider = "anthropic" | "gemini";

// AI_PROVIDER picks the backend explicitly. If it isn't set, use Gemini when
// only a Gemini key is configured, so the free tier works with zero extra setup.
export function getProvider(env: Record<string, string | undefined> = process.env): Provider {
  const explicit = env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === "gemini" || explicit === "anthropic") return explicit;
  if (explicit) console.warn(`Unknown AI_PROVIDER "${env.AI_PROVIDER}", falling back to auto-detect.`);
  return env.GEMINI_API_KEY && !env.ANTHROPIC_API_KEY ? "gemini" : "anthropic";
}

// Turns any provider error into a safe JSON response.
export function apiErrorResponse(error: unknown): Response {
  return geminiErrorResponse(error) ?? anthropicErrorResponse(error);
}
