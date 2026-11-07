"use client";

import { useEffect, useRef, useState } from "react";
import { streamText } from "@/lib/client";
import type { LetterAnalysis } from "@/lib/schema";
import { ArrowUpIcon } from "./icons";
import { button, card, Spinner } from "./ui";

export type Message = { role: "user" | "assistant"; content: string; error?: boolean };

const SUGGESTIONS = ["Can I pay in instalments?", "What happens if I'm late?", "Is this letter legit?"];

export default function FollowUpChat({ analysis, initialMessages = [] }: { analysis: LetterAnalysis; initialMessages?: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    // Keep it short and starting with a user turn (odd length, ending on the
    // question). Failed answers aren't sent back to the model.
    const history = [...messages.filter((m) => !m.error), { role: "user", content: q } as Message]
      .map(({ role, content }) => ({ role, content }))
      .slice(-19);
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const setAnswer = (content: string, error = false) => setMessages([...history, { role: "assistant", content, error }]);
    try {
      await streamText("/api/chat", { analysis, messages: history }, (t) => setAnswer(t), controller.signal);
    } catch (e) {
      if (!controller.signal.aborted) setAnswer(e instanceof Error ? e.message : "Something went wrong.", true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="ask" aria-labelledby="ask-title" className={`${card} scroll-mt-6 p-5 sm:p-6`}>
      <h2 id="ask-title" className="text-xl font-semibold tracking-[-0.01em]">
        Ask about this letter
      </h2>
      <p className="mt-1 text-[15px] text-muted">Anything you&apos;re unsure about: what it means, what to do next.</p>

      {messages.length > 0 && (
        <ol className="mt-5 space-y-3" aria-live="polite">
          {messages.map((m, i) => (
            <li key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap sm:max-w-[80%] ${
                  m.role === "user"
                    ? "rounded-br-md bg-accent text-on-accent"
                    : m.error
                      ? "rounded-bl-md bg-high-soft text-high"
                      : "rounded-bl-md bg-surface-2"
                }`}
              >
                <span className="sr-only">{m.role === "user" ? "You: " : "Answer: "}</span>
                {m.content ? (
                  withBold(m.content)
                ) : (
                  <span className="inline-flex items-center gap-2 text-muted">
                    <Spinner className="size-3.5" /> Thinking…
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {messages.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="min-h-11 rounded-full border border-border-strong/60 bg-surface px-4 text-[15px] transition-colors hover:border-accent hover:text-accent"
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
        className="mt-5 flex gap-2"
      >
        <label className="sr-only" htmlFor="ask-input">
          Your question
        </label>
        <input
          id="ask-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={4000}
          autoComplete="off"
          placeholder="e.g. Who do I call if I can't pay?"
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-border-strong bg-surface px-3.5 text-[16px] placeholder:text-muted hover:border-accent"
        />
        <button type="submit" disabled={busy || !input.trim()} className={`${button.primary} px-4`}>
          <ArrowUpIcon size={18} />
          Ask
        </button>
      </form>
    </section>
  );
}

// Answers sometimes use **bold**; show it as bold rather than asterisks.
function withBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}
