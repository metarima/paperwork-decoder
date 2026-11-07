# Paperwork Decoder

Snap a photo of an official letter (a work contract, a tax notice, a parking fine, a landlord letter, an immigration appointment) and get back:

- **What it means**, in plain language and in your language
- **Deadlines**, with a one-click calendar export
- **What you owe**, and why
- **What to do**, as a checklist, including the payment references from the letter
- **What happens if you ignore it**
- **A draft reply** in the letter's own language, with an English translation
- **A chat** for follow-up questions ("can I pay in instalments?")

**Live demo:** not hosted yet. For now you can [run it on your own computer](#install-on-your-pc) in a few minutes.

<!-- TODO: demo GIF -->

## Why I built this

<!-- TODO: write this in your own words: the letter that made you want it, who it's for. -->

## How it works

```
 photo / PDF ──► downscale in browser ──► /api/decode ──► Claude Sonnet 5 or Gemini Flash
                                               │            (vision + PDF, structured output)
                                               ▼
                                      LetterAnalysis JSON ──► result card, .ics export
                                               │
                     ┌─────────────────────────┴─────────────────────────┐
                     ▼                                                   ▼
              /api/reply (streaming)                             /api/chat (streaming)
              Claude Haiku 4.5 / Gemini Flash-Lite              Claude Haiku 4.5 / Gemini Flash-Lite
```

- **Two backends.** It runs on Anthropic (Claude) or Google (Gemini), picked with one environment variable. Both paths use the same prompts and the same zod schema, so the rest of the app doesn't know which one answered.
- **One model call does the reading.** The model reads the image or PDF directly, so there's no separate OCR step. The response is constrained to a zod schema (`lib/schema.ts`) with structured outputs, so the UI never has to parse free text.
- **Cheaper model for the follow-ups.** Reply drafting and chat only need the extracted JSON, not the image, so they run on a smaller, faster model and stream to the browser. The chat keeps the analysis in a cached system-prompt block, so later turns are cheap.
- **Honest about uncertainty.** The schema has `confidence` and `uncertainties` fields. The prompt tells the model to lower confidence rather than guess, and the UI shows a warning when it does.
- **Privacy.** Nothing is stored server-side. IBAN-like numbers are masked in the UI so screenshots don't leak them. Files are sent to the configured AI provider (Anthropic or Google) for analysis. On Gemini's free tier, Google may use what you send to improve its products, so don't upload real documents to a free-tier deployment.
- **Guardrails.** The server validates file type and size (4MB max, which keeps uploads under Vercel's request limit), requests are rate-limited per IP, and every route returns typed errors instead of a stack trace.

## Evals

`evals/cases.ts` has eight synthetic letters in Portuguese, English, German and Spanish (all names and numbers are made up). Each has known deadlines and amounts. `npm run eval` renders them through the real pipeline and scores the extraction.

<!-- TODO: paste the table from evals/results.md after running `npm run eval` -->

## Install on your PC

You need [Node.js](https://nodejs.org) 20.9 or newer and [Git](https://git-scm.com). Check with `node -v` and `git -v`.

**1. Get the code**

```bash
git clone https://github.com/metarima/paperwork-decoder.git
cd paperwork-decoder
npm install
```

**2. Get an API key** (pick one)

- **Gemini (free tier):** sign in at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and create a key. No credit card needed.
- **Claude (paid):** create a key at [console.anthropic.com](https://console.anthropic.com).

**3. Add the key**

Copy the example config:

```bash
cp .env.example .env.local      # macOS / Linux
copy .env.example .env.local    # Windows (Command Prompt)
```

Open `.env.local` and paste your key after `GEMINI_API_KEY=` or `ANTHROPIC_API_KEY=`. If you only set one key, the app picks the matching provider automatically. `.env.local` is git-ignored, so the key never gets committed.

**4. Run it**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and try one of the sample letters, or upload your own.

**Troubleshooting**

- *"Server is not configured correctly"*: the key is missing or wrong. Check `.env.local`, then stop the server (Ctrl+C) and run `npm run dev` again.
- *"The AI service is busy"*: you hit the provider's rate limit (common on the free tier). Wait a minute.
- *Port 3000 already in use*: run `npm run dev -- -p 3001` and open port 3001 instead.

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the app on http://localhost:3000 |
| `npm test` | Unit tests (calendar export, formatting, rate limiter, eval scoring, both AI backends) |
| `npm run build` | Production build |
| `npm run samples` | Regenerate the sample letter PDFs in `public/samples` |
| `npm run eval` | Run the eval set against the API (a few cents on Claude, free on Gemini's free tier) |
| `npm run eval -- --cache` | Same, and save the results as instant demo samples |

## Hosting

Not hosted yet. The app is ready for [Vercel](https://vercel.com); the plan when it goes live:

1. Run `npm run eval -- --cache` once and commit the generated `public/samples/*.json`, so the sample letters load instantly and cost nothing.
2. Import the repo in Vercel and set `GEMINI_API_KEY` (or `ANTHROPIC_API_KEY`) under Project Settings > Environment Variables.
3. Deploy. The upload limit (4MB) and the 60-second decode timeout already fit Vercel's free plan.

The rate limiter keeps its counts in memory, so on serverless hosting each instance counts separately. That's fine for a demo; for real traffic it should move to Redis or Upstash.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Anthropic SDK · Google Gen AI SDK · zod · Vitest · pdf-lib

## Disclaimer

This isn't legal or financial advice. Always check the original letter.
