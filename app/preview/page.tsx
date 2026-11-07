import { notFound } from "next/navigation";
import Decoder, { type DecoderDemo, type DecoderState } from "@/components/Decoder";
import { blurryReminder, chatMessages, fixtureUsage, propertyTax, replyText } from "@/lib/fixtures";

// Development-only gallery of every screen state, filled with made-up data.
// Open /preview to see the list. Returns 404 in production builds.

const STATES: Record<string, { label: string; state: DecoderState; demo?: DecoderDemo }> = {
  home: { label: "Home", state: { status: "idle" } },
  loading: { label: "Loading (12s in)", state: { status: "loading", source: "IMG_4021.jpg", initialElapsed: 12_000 } },
  result: {
    label: "Result",
    state: { status: "done", result: { analysis: propertyTax(12), usage: fixtureUsage }, source: "a", cached: false },
  },
  overdue: {
    label: "Result: overdue",
    state: { status: "done", result: { analysis: propertyTax(-7), usage: fixtureUsage }, source: "b", cached: false },
  },
  "low-confidence": {
    label: "Result: low confidence",
    state: { status: "done", result: { analysis: blurryReminder(), usage: fixtureUsage }, source: "c", cached: false },
  },
  reply: {
    label: "Drafted reply",
    state: { status: "done", result: { analysis: propertyTax(12), usage: fixtureUsage }, source: "d", cached: false },
    demo: { reply: { intent: "pay", text: replyText } },
  },
  "reply-writing": {
    label: "Reply being written",
    state: { status: "done", result: { analysis: propertyTax(12), usage: fixtureUsage }, source: "e", cached: false },
    demo: { reply: { intent: "pay", text: replyText.slice(0, 260), busy: true } },
  },
  chat: {
    label: "Chat",
    state: { status: "done", result: { analysis: propertyTax(12), usage: fixtureUsage }, source: "f", cached: false },
    demo: { chat: chatMessages },
  },
  "error-busy": { label: "Error: busy", state: { status: "error", kind: "busy", message: "The AI service is busy." } },
  "error-too-large": { label: "Error: too large", state: { status: "error", kind: "tooLarge", message: "That file is over 4MB." } },
  "error-unreadable": {
    label: "Error: unreadable",
    state: { status: "error", kind: "unreadable", message: "Couldn't make sense of that letter." },
  },
};

export default async function Preview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { state } = await searchParams;
  const entry = state ? STATES[state] : undefined;

  if (!entry) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Screen states</h1>
        <p className="mt-1 text-muted">Made-up data, development only.</p>
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {Object.entries(STATES).map(([id, s]) => (
            <li key={id}>
              <a href={`/preview?state=${id}`} className="flex min-h-12 items-center px-4 hover:text-accent">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return <Decoder key={state} initialState={entry.state} demo={entry.demo} />;
}
