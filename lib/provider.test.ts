import { describe, expect, it } from "vitest";
import { getProvider } from "./provider";

describe("getProvider", () => {
  it("uses AI_PROVIDER when it is set", () => {
    expect(getProvider({ AI_PROVIDER: "gemini", ANTHROPIC_API_KEY: "a" })).toBe("gemini");
    expect(getProvider({ AI_PROVIDER: "Anthropic", GEMINI_API_KEY: "g" })).toBe("anthropic");
  });

  it("picks Gemini when only a Gemini key is configured", () => {
    expect(getProvider({ GEMINI_API_KEY: "g" })).toBe("gemini");
  });

  it("defaults to Anthropic otherwise", () => {
    expect(getProvider({})).toBe("anthropic");
    expect(getProvider({ ANTHROPIC_API_KEY: "a", GEMINI_API_KEY: "g" })).toBe("anthropic");
    expect(getProvider({ AI_PROVIDER: "openai", ANTHROPIC_API_KEY: "a" })).toBe("anthropic");
  });
});
