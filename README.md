# Paperwork Decoder

Snap a photo of an official letter (a tax notice, a parking fine, a landlord letter, an immigration appointment) and get back:

- **What it means**, in plain language and in your language
- **Deadlines**, with a one-click calendar export
- **What you owe**, and why
- **What to do**, as a checklist, including the payment references from the letter
- **What happens if you ignore it**
- **A draft reply** in the letter's own language, with an English translation
- **A chat** for follow-up questions ("can I pay in instalments?")

<!-- TODO: demo GIF + live link -->

## Why I built this

<!-- TODO: write this in your own words: the letter that made you want it, who it's for. -->

## How it works

```
 photo / PDF ──► downscale in browser ──► /api/decode ──► Claude Sonnet 5 (vision + PDF)
                                               │            structured output (zod schema)
                                               ▼
                                      LetterAnalysis JSON ──► result card, .ics export
                                               │
                     ┌─────────────────────────┴─────────────────────────┐
                     ▼                                                   ▼
              /api/reply (streaming)                             /api/chat (streaming)
              Claude Haiku 4.5                                   Claude Haiku 4.5, analysis cached
```

- **One model call does the reading.** Sonnet 5 reads the image or PDF directly, so there's no separate OCR step. The response is constrained to a zod schema (`lib/schema.ts`) with structured outputs, so the UI never has to parse free text.
- **Cheaper model for the follow-ups.** Reply drafting and chat only need the extracted JSON, not the image, so they run on Haiku 4.5 and stream to the browser. The chat keeps the analysis in a cached system-prompt block, so later turns are cheap.
- **Honest about uncertainty.** The schema has `confidence` and `uncertainties` fields. The prompt tells the model to lower confidence rather than guess, and the UI shows a warning when it does.
- **Privacy.** Nothing is stored server-side. IBAN-like numbers are masked in the UI so screenshots don't leak them. Files are sent to the Anthropic API for analysis.
- **Guardrails.** The server validates file type and size, requests are rate-limited per IP, and every route returns typed errors instead of a stack trace.

## Evals

`evals/cases.ts` has six synthetic letters in Portuguese, English, German and Spanish (all names and numbers are made up). Each has known deadlines and amounts. `npm run eval` renders them through the real pipeline and scores the extraction.

<!-- TODO: paste the table from evals/results.md after running `npm run eval` -->

## Running it

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

| Script | What it does |
|---|---|
| `npm run dev` | Start the app on http://localhost:3000 |
| `npm test` | Unit tests (calendar export, formatting, rate limiter, eval scoring) |
| `npm run samples` | Regenerate the sample letter PDFs in `public/samples` |
| `npm run eval` | Run the eval set against the API (costs a few cents) |
| `npm run eval -- --cache` | Same, and save the results as instant demo samples |

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Anthropic SDK · zod · Vitest · pdf-lib

## Disclaimer

This isn't legal or financial advice. Always check the original letter.
