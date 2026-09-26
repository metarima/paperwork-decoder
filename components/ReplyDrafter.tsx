"use client";

import { useEffect, useRef, useState } from "react";
import { streamText } from "@/lib/client";
import type { ReplyIntent } from "@/lib/prompts";
import type { LetterAnalysis } from "@/lib/schema";

const INTENTS: { id: ReplyIntent; label: string }[] = [
  { id: "pay", label: "I'll pay" },
  { id: "dispute", label: "Dispute it" },
  { id: "extension", label: "Ask for more time" },
  { id: "info", label: "Ask a question" },
];

export default function ReplyDrafter({ analysis }: { analysis: LetterAnalysis }) {
  const [intent, setIntent] = useState<ReplyIntent | null>(null);
  const [notes, setNotes] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  const [reply, translation] = text.split(/\n-{3,}\n/);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h3 className="text-lg font-semibold">Draft a reply</h3>
      <p className="mt-1 text-sm text-muted">Written in {analysis.language}, with an English translation.</p>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={1000}
        rows={2}
        placeholder="Anything to add? e.g. “I already paid on 3 October”, “I was abroad when this was sent”"
        className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {INTENTS.map((i) => (
          <button
            key={i.id}
            onClick={() => draft(i.id)}
            disabled={busy}
            className={`rounded-full border px-3 py-1.5 text-sm disabled:opacity-50 ${
              intent === i.id ? "border-accent bg-accent-soft text-accent" : "border-border hover:border-accent"
            }`}
          >
            {i.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-high">{error}</p>}

      {text && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="relative rounded-lg bg-background p-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{reply}</pre>
            {!busy && (
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(reply.trim());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="mt-3 rounded-md border border-border px-2 py-1 text-xs hover:border-accent"
              >
                {copied ? "Copied" : "Copy reply"}
              </button>
            )}
          </div>
          {translation !== undefined && (
            <div className="rounded-lg border border-dashed border-border p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">English translation</p>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted">{translation.trim()}</pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
