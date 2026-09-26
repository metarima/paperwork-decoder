import { describe, expect, it } from "vitest";
import type { LetterAnalysis } from "../lib/schema";
import { extractionAccuracy, scoreCase } from "./score";

const base: LetterAnalysis = {
  sender: "x",
  letterType: "x",
  language: "Portuguese (Portugal)",
  summary: "x",
  explanation: "x",
  urgency: "medium",
  deadlines: [{ date: "2026-10-31", what: "pay" }],
  amounts: [{ value: 312.4, currency: "eur", reason: "tax" }],
  actions: [],
  consequencesIfIgnored: "x",
  referenceNumbers: [],
  confidence: "high",
  uncertainties: [],
};

describe("scoreCase", () => {
  it("matches language loosely, amounts to the cent and dates exactly", () => {
    const s = scoreCase(
      {
        language: "Portuguese",
        urgency: "high",
        deadlines: ["2026-10-31", "2026-11-30"],
        amounts: [{ value: 312.4, currency: "EUR" }],
      },
      base,
    );
    expect(s).toEqual({
      language: true,
      urgency: false,
      deadlinesFound: 1,
      deadlinesExpected: 2,
      amountsFound: 1,
      amountsExpected: 1,
    });
    expect(extractionAccuracy([s])).toBeCloseTo(2 / 3);
  });
});
