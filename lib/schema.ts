import { z } from "zod";

// Shape of everything we pull out of a letter. Kept flat and explicit so the
// model has little room to improvise, and so the UI can render it directly.
// "Reader's language" fields are written in the language the person chose to
// have the letter explained in; everything quoted from the letter stays as
// printed.
export const LetterAnalysisSchema = z.object({
  sender: z.string().describe("Who sent the letter, e.g. 'Autoridade Tributária'"),
  letterType: z.string().describe("Short label in the reader's language, e.g. 'Property tax notice'"),
  language: z.string().describe("Name in English of the language the letter is written in, e.g. 'Portuguese'"),
  languageCode: z.string().describe("ISO 639-1 code of the language the letter is written in, e.g. 'pt'"),
  summary: z.string().describe("One or two sentence TL;DR in plain words, in the reader's language"),
  explanation: z.string().describe("A friendly plain-language explanation in the reader's language, a few short paragraphs"),
  urgency: z.enum(["low", "medium", "high"]),
  deadlines: z.array(
    z.object({
      date: z.string().describe("ISO date YYYY-MM-DD"),
      what: z.string().describe("What has to happen by this date, in the reader's language"),
    }),
  ),
  amounts: z.array(
    z.object({
      value: z.number(),
      currency: z.string().describe("ISO currency code, e.g. EUR"),
      reason: z.string().describe("What the amount is for, in the reader's language"),
    }),
  ),
  actions: z.array(
    z.object({
      step: z.string().describe("What to do, imperative, short, in the reader's language"),
      how: z.string().describe("How to do it in the reader's language, quoting references exactly as printed"),
    }),
  ),
  consequencesIfIgnored: z.string().describe("What happens if it's ignored, in the reader's language"),
  referenceNumbers: z.array(
    z.object({
      label: z.string().describe("The reference's label exactly as printed, e.g. 'Entidade'"),
      value: z.string().describe("The reference exactly as printed"),
    }),
  ),
  confidence: z.enum(["low", "medium", "high"]),
  uncertainties: z
    .array(z.string())
    .describe("Anything unreadable, ambiguous or that the reader should double-check, in the reader's language"),
});

export type LetterAnalysis = z.infer<typeof LetterAnalysisSchema>;

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
export type AcceptedType = (typeof ACCEPTED_TYPES)[number];

// Vercel rejects request bodies over 4.5MB, so stay safely under that.
export const MAX_UPLOAD_MB = 4;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export function isAcceptedType(type: string): type is AcceptedType {
  return (ACCEPTED_TYPES as readonly string[]).includes(type);
}
