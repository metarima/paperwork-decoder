import { ApiError } from "@google/genai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LetterAnalysis } from "./schema";

// Stand-in for the Gemini SDK so these tests run offline.
const generateContent = vi.fn();
vi.mock("./gemini", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./gemini")>();
  return { ...actual, gemini: () => ({ models: { generateContent } }) };
});

const { decodeLetter, letterJsonSchema } = await import("./decode");
const { withGeminiFallback } = await import("./gemini");
const { geminiTextStreamResponse } = await import("./stream");

const analysis: LetterAnalysis = {
  sender: "Câmara Municipal",
  letterType: "Water bill",
  language: "Portuguese",
  summary: "You owe 42.10 EUR for water.",
  explanation: "This is your monthly water bill.",
  urgency: "medium",
  deadlines: [{ date: "2026-12-01", what: "Pay the bill" }],
  amounts: [{ value: 42.1, currency: "EUR", reason: "Water usage" }],
  actions: [{ step: "Pay", how: "Use the Multibanco reference" }],
  consequencesIfIgnored: "Late fee.",
  referenceNumbers: [{ label: "Entidade", value: "12345" }],
  confidence: "high",
  uncertainties: [],
};

const reply = (overrides: Record<string, unknown>) => ({
  text: JSON.stringify(analysis),
  candidates: [{ finishReason: "STOP" }],
  usageMetadata: { promptTokenCount: 1200, candidatesTokenCount: 300, thoughtsTokenCount: 50 },
  ...overrides,
});

describe("decodeLetter with Gemini", () => {
  beforeEach(() => {
    vi.stubEnv("AI_PROVIDER", "gemini");
    generateContent.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("sends the file inline with the JSON schema and returns validated output", async () => {
    generateContent.mockResolvedValue(reply({}));
    const result = await decodeLetter("QUJD", "application/pdf", "English");

    expect(result).toMatchObject({ ok: true, analysis, usage: { inputTokens: 1200, outputTokens: 350, costUsd: null } });
    const request = generateContent.mock.calls[0][0];
    expect(request.contents[0].parts[0]).toEqual({ inlineData: { mimeType: "application/pdf", data: "QUJD" } });
    expect(request.config.responseMimeType).toBe("application/json");
    expect(request.config.responseJsonSchema).toEqual(letterJsonSchema());
  });

  it("reports a refusal when Gemini blocks the content", async () => {
    generateContent.mockResolvedValue(reply({ text: undefined, candidates: [{ finishReason: "SAFETY" }] }));
    expect(await decodeLetter("QUJD", "image/png")).toEqual({ ok: false, reason: "refusal" });
  });

  it("rejects output that is not valid JSON or does not match the schema", async () => {
    generateContent.mockResolvedValue(reply({ text: "{not json" }));
    expect(await decodeLetter("QUJD", "image/png")).toEqual({ ok: false, reason: "unparseable" });
    generateContent.mockResolvedValue(reply({ text: JSON.stringify({ ...analysis, urgency: "extreme" }) }));
    expect(await decodeLetter("QUJD", "image/png")).toEqual({ ok: false, reason: "unparseable" });
  });

  it("produces a schema without the $schema keyword", () => {
    expect(letterJsonSchema()).not.toHaveProperty("$schema");
    expect(letterJsonSchema()).toMatchObject({ type: "object", required: expect.arrayContaining(["summary", "deadlines"]) });
  });
});

describe("geminiTextStreamResponse", () => {
  it("streams the text of each chunk", async () => {
    async function* chunks() {
      yield { text: "Dear " } as never;
      yield { text: "Sir," } as never;
    }
    const response = await geminiTextStreamResponse(async () => chunks());
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Dear Sir,");
  });

  it("turns an up-front rate limit into a 429", async () => {
    const response = await geminiTextStreamResponse(async () => {
      throw new ApiError({ message: "quota", status: 429 });
    });
    expect(response.status).toBe(429);
  });

  it("reports a network failure as a 502", async () => {
    const response = await geminiTextStreamResponse(async () => {
      throw new TypeError("fetch failed");
    });
    expect(response.status).toBe(502);
  });
});

describe("withGeminiFallback", () => {
  const overloaded = () => new ApiError({ message: "high demand", status: 503 });

  it("retries the main model once when it is overloaded", async () => {
    const call = vi.fn().mockRejectedValueOnce(overloaded()).mockResolvedValueOnce("ok");
    expect(await withGeminiFallback(["main", "backup"], call, 0)).toEqual({ model: "main", result: "ok" });
    expect(call.mock.calls.map((c) => c[0])).toEqual(["main", "main"]);
  });

  it("falls back to the next model, then gives up", async () => {
    const call = vi.fn().mockRejectedValueOnce(overloaded()).mockRejectedValueOnce(overloaded()).mockResolvedValueOnce("ok");
    expect(await withGeminiFallback(["main", "backup"], call, 0)).toEqual({ model: "backup", result: "ok" });

    const alwaysBusy = vi.fn().mockRejectedValue(overloaded());
    await expect(withGeminiFallback(["main", "backup"], alwaysBusy, 0)).rejects.toMatchObject({ status: 503 });
    expect(alwaysBusy).toHaveBeenCalledTimes(3);
  });

  it("does not retry other errors", async () => {
    const call = vi.fn().mockRejectedValue(new ApiError({ message: "bad key", status: 403 }));
    await expect(withGeminiFallback(["main", "backup"], call, 0)).rejects.toMatchObject({ status: 403 });
    expect(call).toHaveBeenCalledTimes(1);
  });
});
