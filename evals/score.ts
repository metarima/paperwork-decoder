import type { LetterAnalysis } from "../lib/schema";
import type { EvalCase } from "./cases";

export type Score = {
  language: boolean;
  urgency: boolean;
  deadlinesFound: number;
  deadlinesExpected: number;
  amountsFound: number;
  amountsExpected: number;
};

const LANGUAGE_ALIASES: Record<string, string[]> = {
  Portuguese: ["portuguese", "português", "portugues"],
  English: ["english"],
  German: ["german", "deutsch"],
  Spanish: ["spanish", "español", "espanol", "castellano"],
};

export function scoreCase(expected: EvalCase["expected"], actual: LetterAnalysis): Score {
  const lang = actual.language.toLowerCase();
  const aliases = LANGUAGE_ALIASES[expected.language] ?? [expected.language.toLowerCase()];

  const foundDates = new Set(actual.deadlines.map((d) => d.date));
  const deadlinesFound = expected.deadlines.filter((d) => foundDates.has(d)).length;

  const amountsFound = expected.amounts.filter((e) =>
    actual.amounts.some((a) => Math.abs(a.value - e.value) < 0.005 && a.currency.toUpperCase() === e.currency),
  ).length;

  return {
    language: aliases.some((a) => lang.includes(a)),
    urgency: actual.urgency === expected.urgency,
    deadlinesFound,
    deadlinesExpected: expected.deadlines.length,
    amountsFound,
    amountsExpected: expected.amounts.length,
  };
}

// Extraction accuracy: share of expected deadlines and amounts that were found.
// Urgency is reported separately because it's a judgement call, not a fact.
export function extractionAccuracy(scores: Score[]) {
  const found = scores.reduce((n, s) => n + s.deadlinesFound + s.amountsFound, 0);
  const expected = scores.reduce((n, s) => n + s.deadlinesExpected + s.amountsExpected, 0);
  return expected === 0 ? 1 : found / expected;
}
