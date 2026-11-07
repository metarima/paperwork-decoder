import { ApiError, GoogleGenAI } from "@google/genai";

// Free-tier friendly defaults. Override with GEMINI_MODEL / GEMINI_FAST_MODEL.
export const GEMINI_DECODE_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
export const GEMINI_FAST_MODEL = process.env.GEMINI_FAST_MODEL || "gemini-3.1-flash-lite";

let client: GoogleGenAI | null = null;

// Created on first use so the app can boot (and use Anthropic) without a Gemini key.
export function gemini() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new GeminiConfigError("GEMINI_API_KEY is not set.");
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export class GeminiConfigError extends Error {}

// Maps Gemini SDK errors to something safe to show in the UI.
// Returns null for errors that didn't come from Gemini.
export function geminiErrorResponse(error: unknown): Response | null {
  if (error instanceof GeminiConfigError) {
    console.error(error.message);
    return Response.json({ error: "Server is not configured correctly." }, { status: 500 });
  }
  // The Gemini SDK uses plain fetch, so network failures surface as a TypeError.
  if (error instanceof TypeError && /fetch failed/i.test(error.message)) {
    console.error("Couldn't reach Gemini:", error.cause ?? error.message);
    return Response.json({ error: "Couldn't reach the AI service. Try again in a moment." }, { status: 502 });
  }
  if (!(error instanceof ApiError)) return null;

  if (error.status === 429) {
    return Response.json({ error: "The AI service is busy. Try again in a minute." }, { status: 429 });
  }
  if (error.status === 401 || error.status === 403) {
    console.error("Gemini auth failed. Is GEMINI_API_KEY set and valid?");
    return Response.json({ error: "Server is not configured correctly." }, { status: 500 });
  }
  if (error.status === 400) {
    console.error("Bad request to Gemini:", error.message);
    return Response.json({ error: "Couldn't read that file. Try a clearer photo or a PDF." }, { status: 400 });
  }
  console.error(`Gemini API error ${error.status}:`, error.message);
  return Response.json({ error: "The AI service had a problem. Try again." }, { status: 502 });
}
