"use client";

import { useEffect, useRef, useState } from "react";
import { streamText } from "@/lib/client";
import type { ReplyIntent } from "@/lib/prompts";
import { languageName } from "@/lib/locales";
import type { LetterAnalysis } from "@/lib/schema";
import { capitalize, useLocale } from "./LocaleContext";
import { button, card, CopyButton, Spinner } from "./ui";

const INTENTS: ReplyIntent[] = ["pay", "dispute", "extension", "info"];

export type ReplyPreview = { intent: ReplyIntent; text: string; busy?: boolean };

export default function ReplyDrafter({ analysis, initial }: { analysis: LetterAnalysis; initial?: ReplyPreview }) {
  const [intent, setIntent] = useState<ReplyIntent | null>(initial?.intent ?? null);
  const [notes, setNotes] = useState("");
  const [text, setText] = useState(initial?.text ?? "");
  const [busy, setBusy] = useState(initial?.busy ?? false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { t, locale, intl } = useLocale();

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
      await streamText("/api/reply", { analysis, intent: chosen, notes: notes || undefined, locale }, setText, controller.signal);
    } catch (e) {
      if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      if (abortRef.current === controller) setBusy(false);
    }
  }

  const [reply = "", translation] = text.split(/\n-{3,}\n/);
  // No translation pane when the letter is already in the reader's language.
  const sameLanguage = analysis.languageCode.toLowerCase().split("-")[0] === locale;
  const letterLang = languageName(analysis.languageCode, locale);
  const readerLang = languageName(locale, locale);
  const hasPlaceholders = /\[[^\]]+\]/.test(reply);

  return (
    <section id="reply" aria-labelledby="reply-title" className={`${card} scroll-mt-6 p-5 sm:p-6`}>
      <h2 id="reply-title" className="text-xl font-semibold tracking-[-0.01em]">
        {t.reply.title}
      </h2>
      <p className="mt-1 text-[15px] text-muted">{sameLanguage ? t.reply.introSame : t.reply.intro(letterLang, readerLang)}</p>

      <label className="mt-5 block">
        <span className="text-[15px] font-medium">
          {t.reply.notesLabel} <span className="font-normal text-muted">{t.reply.optional}</span>
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
          rows={2}
          placeholder={t.reply.notesPlaceholder}
          className="mt-2 block w-full resize-y rounded-xl border border-border-strong bg-surface px-3.5 py-3 text-[16px] leading-snug placeholder:text-muted hover:border-accent"
        />
      </label>

      <fieldset className="mt-5">
        <legend className="text-[15px] font-medium">{t.reply.whatToSay}</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {INTENTS.map((id) => {
            const selected = intent === id;
            const i = t.reply.intents[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => draft(id)}
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
              <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border py-1.5 pr-1.5 pl-4">
                <p className="text-sm">
                  <span className="font-semibold">{capitalize(letterLang, intl)}</span>
                  <span className="text-muted"> · {t.reply.toSend}</span>
                </p>
                {busy ? (
                  <span className="flex min-h-11 items-center gap-2 px-3 text-sm text-muted">
                    <Spinner className="size-3.5" /> {t.reply.writing}
                  </span>
                ) : (
                  <CopyButton value={reply.trim()} label={t.reply.copyReply} copiedLabel={t.copied} />
                )}
              </div>
              <div lang={analysis.languageCode} className="px-4 py-4 text-[15px] leading-relaxed whitespace-pre-wrap">
                {reply ? withPlaceholders(reply.trim()) : <span className="text-muted">{t.reply.starting}</span>}
              </div>
            </div>

            {!sameLanguage && (
              <div className="flex flex-col rounded-xl bg-surface-2">
                <div className="flex min-h-14 items-center border-b border-border px-4">
                  <p className="text-sm">
                    <span className="font-semibold">{capitalize(readerLang, intl)}</span>
                    <span className="text-muted"> · {t.reply.forYou}</span>
                  </p>
                </div>
                <div className="px-4 py-4 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {translation?.trim() ? (
                    withPlaceholders(translation.trim())
                  ) : (
                    <span className="text-muted">{t.reply.translationPending}</span>
                  )}
                </div>
              </div>
            )}
          </div>
          {!busy && hasPlaceholders && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted">
              <span aria-hidden className="h-1.5 w-5 shrink-0 rounded-full bg-mark-money" />
              {t.reply.fillIn}
            </p>
          )}
          {!busy && intent && (
            <button type="button" onClick={() => draft(intent)} className={`${button.small} mt-4`}>
              {t.reply.writeAgain}
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
