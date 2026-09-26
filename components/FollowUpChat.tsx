"use client";

import { useEffect, useRef, useState } from "react";
import { streamText } from "@/lib/client";
import type { LetterAnalysis } from "@/lib/schema";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["Can I pay in instalments?", "What happens if I'm late?", "Is this letter legit?"];

export default function FollowUpChat({ analysis }: { analysis: LetterAnalysis }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    // Keep it short and starting with a user turn (odd length, ending on the question).
    const history = [...messages, { role: "user", content: q } as Message].slice(-19);
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const setAnswer = (content: string) => setMessages([...history, { role: "assistant", content }]);
    try {
      await streamText("/api/chat", { analysis, messages: history }, setAnswer, controller.signal);
    } catch (e) {
      if (!controller.signal.aborted) setAnswer(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h3 className="text-lg font-semibold">Ask about this letter</h3>

      {messages.length > 0 && (
        <div className="mt-4 space-y-3" aria-live="polite">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                m.role === "user" ? "ml-auto bg-accent text-surface" : "bg-background"
              }`}
            >
              {m.content || <span className="text-muted">Thinking…</span>}
            </div>
          ))}
        </div>
      )}

      {messages.length === 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-full border border-border px-3 py-1 text-sm text-muted hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={4000}
          placeholder="e.g. Who do I call if I can't pay?"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </section>
  );
}
