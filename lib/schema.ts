import { z } from "zod";

// Shape of everything we pull out of a letter. Kept flat and explicit so the
// model has little room to improvise, and so the UI can render it directly.
export const LetterAnalysisSchema = z.object({
  sender: z.string().describe("Who sent the letter, e.g. 'Autoridade Tributária'"),
  letterType: z.string().describe("Short label, e.g. 'Property tax notice'"),
  language: z.string().describe("Language the letter is written in, e.g. 'Portuguese'"),
  summary: z.string().describe("One or two sentence TL;DR in plain words"),
  explanation: z.string().describe("A friendly plain-language explanation, a few short paragraphs"),
  urgency: z.enum(["low", "medium", "high"]),
  deadlines: z.array(
    z.object({
      date: z.string().describe("ISO date YYYY-MM-DD"),
      what: z.string().describe("What has to happen by this date"),
    }),
  ),
  amounts: z.array(
    z.object({
      value: z.number(),
      currency: z.string().describe("ISO currency code, e.g. EUR"),
      reason: z.string(),
    }),
  ),
  actions: z.array(
    z.object({
      step: z.string().describe("What to do, imperative, short"),
      how: z.string().describe("How to do it, with any references from the letter"),
    }),
  ),
  consequencesIfIgnored: z.string(),
  referenceNumbers: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    }),
  ),
  confidence: z.enum(["low", "medium", "high"]),
  uncertainties: z
    .array(z.string())
    .describe("Anything unreadable, ambiguous or that the reader should double-check"),
});

export type LetterAnalysis = z.infer<typeof LetterAnalysisSchema>;

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export type AcceptedType = (typeof ACCEPTED_TYPES)[number];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function isAcceptedType(type: string): type is AcceptedType {
  return (ACCEPTED_TYPES as readonly string[]).includes(type);
}
