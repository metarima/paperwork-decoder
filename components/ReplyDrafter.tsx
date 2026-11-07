"use client";

import { useEffect, useRef, useState } from "react";
import { streamText } from "@/lib/client";
import type { ReplyIntent } from "@/lib/prompts";
import type { LetterAnalysis } from "@/lib/schema";
import { button, card, CopyButton, Spinner } from "./ui";

const INTENTS: { id: ReplyIntent; label: string; hint: string }[] = [
  { id: "pay", label: "I'll pay", hint: "Confirm payment and ask for a receipt" },
  { id: "dispute", label: "Dispute it", hint: "Say it's wrong and ask for a review" },
  { id: "extension", label: "Ask for more time", hint: "Request a later deadline" },
  { id: "info", label: "Ask a question", hint: "Ask them to explain something" },
];

export type ReplyPreview = { intent: ReplyIntent; text: string; busy?: boolean };

export default function ReplyDrafter({ analysis, initial }: { analysis: LetterAnalysis; initial?: ReplyPreview }) {
  const [intent, setIntent] = useState<ReplyIntent | null>(initial?.intent ?? null);
  const [notes, setNotes] = useState("");
  const [text, setText] = useState(initial?.text ?? "");
  const [busy, setBusy] = useState(initial?.busy ?? false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function draft(chosen: ReplyIntent) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIntent(chosen);
    setText("");
    setError(null);
    setBusy(true);
    try {
      await streamText("/api/reply", { analysis, intent: chosen, notes: notes || undefined }, setText, controller.signal);
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      if (abortRef.current === controller) setBusy(false);
    }
  }

  const [reply = "", translation] = text.split(/\n-{3,}\n/);
  const sameLanguage = /^english$/i.test(analysis.language.trim());
  const hasPlaceholders = /\[[^\]]+\]/.test(reply);

  return (
    <section id="reply" aria-labelledby="reply-title" className={`${card} scroll-mt-6 p-5 sm:p-6`}>
      <h2 id="reply-title" className="text-xl font-semibold tracking-[-0.01em]">
        Draft a reply
      </h2>
      <p className="mt-1 text-[15px] text-muted">
        {sameLanguage
          ? "A short, polite reply you can send as it is."
          : `Written in ${analysis.language}, the letter's language, with an English translation for you.`}
      </p>

      <label className="mt-5 block">
        <span className="text-[15px] font-medium">
          Anything they should know? <span className="font-normal text-muted">(optional)</span>
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
          rows={2}
          placeholder="e.g. I already paid on 3 October"
          className="mt-2 block w-full resize-y rounded-xl border border-border-strong bg-surface px-3.5 py-3 text-[16px] leading-snug placeholder:text-muted hover:border-accent"
        />
      </label>

      <fieldset className="mt-5">
        <legend className="text-[15px] font-medium">What do you want to say?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {INTENTS.map((i) => {
            const selected = intent === i.id;
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => draft(i.id)}
                disabled={busy && !selected}
                aria-pressed={selected}
                className={`flex min-h-16 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                  selected ? "border-accent bg-accent-soft" : "border-border-strong/60 bg-surface hover:border-accent"
                }`}
              >
                <span>
                  <span className={`block text-[16px] font-semibold ${selected ? "text-accent" : ""}`}>{i.label}</span>
                  <span className="block text-sm text-muted">{i.hint}</span>
                </span>
                {selected && busy && <Spinner className="text-accent" />}
              </button>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-high-soft px-4 py-3 text-[15px] text-high">
          {error}
        </p>
      )}

      {(text || busy) && (
        <div className="mt-6 animate-rise" aria-live="polite" aria-busy={busy}>
          <div className={`grid gap-3 ${sameLanguage ? "" : "sm:grid-cols-2"}`}>
            <div className="flex flex-col rounded-xl border border-border-strong/60 bg-surface">
              <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border py-1.5 pr-1.5 pl-4">
                <p className="text-sm">
                  <span className="font-semibold">{analysis.language}</span>
                  <span className="text-muted"> · to send</span>
                </p>
                {busy ? (
                  <span className="flex min-h-11 items-center gap-2 px-3 text-sm text-muted">
                    <Spinner className="size-3.5" /> Writing…
                  </span>
                ) : (
                  <CopyButton value={reply.trim()} label="Copy reply" />
                )}
              </div>
              <div className="px-4 py-4 text-[15px] leading-relaxed whitespace-pre-wrap">
                {reply ? withPlaceholders(reply.trim()) : <span className="text-muted">Starting…</span>}
              </div>
            </div>

            {!sameLanguage && (
              <div className="flex flex-col rounded-xl bg-surface-2">
                <div className="flex min-h-14 items-center border-b border-border px-4">
                  <p className="text-sm">
                    <span className="font-semibold">English</span>
                    <span className="text-muted"> · for you to read</span>
                  </p>
                </div>
                <div className="px-4 py-4 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {translation?.trim() ? (
                    withPlaceholders(translation.trim())
                  ) : (
                    <span className="text-muted">The translation appears when the reply is written.</span>
                  )}
                </div>
              </div>
            )}
          </div>
          {!busy && hasPlaceholders && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted">
              <span aria-hidden className="mark mark-money h-4 w-6" />
              Fill in the highlighted parts before you send it.
            </p>
          )}
          {!busy && intent && (
            <button type="button" onClick={() => draft(intent)} className={`${button.small} mt-4`}>
              Write it again
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// Highlights [placeholders] such as [Your name] so they aren't sent unfilled.
function withPlaceholders(text: string) {
  return text.split(/(\[[^\]\n]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <span key={i} className="mark mark-money font-medium">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
