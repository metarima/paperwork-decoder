import { notFound } from "next/navigation";
import Decoder, { type DecoderDemo, type DecoderState } from "@/components/Decoder";
import { blurryReminder, chatMessages, chatMessagesPt, fixtureUsage, propertyTax, propertyTaxPt, replyText } from "@/lib/fixtures";
import { DEFAULT_LOCALE, isLocale, type Locale, LOCALES } from "@/lib/locales";

// Development-only gallery of every screen state, filled with made-up data.
// Open /preview to see the list; add &lang=pt (or es, fr, de, it, uk) to see
// the interface in another language. Returns 404 in production builds.

function states(locale: Locale): Record<string, { label: string; state: DecoderState; demo?: DecoderDemo }> {
  const tax = (days: number) => (locale === "pt" ? propertyTaxPt(days) : propertyTax(days));
  // A Portuguese reader replying to a Portuguese letter gets no translation.
  const reply = locale === "pt" ? replyText.split(/\n-{3,}\n/)[0] : replyText;
  const done = (analysis: ReturnType<typeof propertyTax>, source: string): DecoderState => ({
    status: "done",
    result: { analysis, usage: fixtureUsage },
    source,
    cached: false,
    locale,
  });
  return {
    home: { label: "Home", state: { status: "idle" } },
    loading: { label: "Loading (12s in)", state: { status: "loading", source: "IMG_4021.jpg", initialElapsed: 12_000, locale } },
    result: { label: "Result", state: done(tax(12), "a") },
    overdue: { label: "Result: overdue", state: done(tax(-7), "b") },
    "low-confidence": { label: "Result: low confidence", state: done(blurryReminder(), "c") },
    reply: { label: "Drafted reply", state: done(tax(12), "d"), demo: { reply: { intent: "pay", text: reply } } },
    "reply-writing": {
      label: "Reply being written",
      state: done(tax(12), "e"),
      demo: { reply: { intent: "pay", text: reply.slice(0, 260), busy: true } },
    },
    chat: { label: "Chat", state: done(tax(12), "f"), demo: { chat: locale === "pt" ? chatMessagesPt : chatMessages } },
    "error-busy": { label: "Error: busy", state: { status: "error", kind: "busy", message: "The AI service is busy.", locale } },
    "error-too-large": { label: "Error: too large", state: { status: "error", kind: "tooLarge", message: "That file is over 4MB.", locale } },
    "error-unreadable": {
      label: "Error: unreadable",
      state: { status: "error", kind: "unreadable", message: "Couldn't make sense of that letter.", locale },
    },
  };
}

export default async function Preview({ searchParams }: { searchParams: Promise<{ state?: string; lang?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { state, lang } = await searchParams;
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const all = states(locale);
  const entry = state ? all[state] : undefined;

  if (!entry) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Screen states</h1>
        <p className="mt-1 text-muted">Made-up data, development only.</p>
        <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {LOCALES.map((l) => (
            <a key={l.code} href={`/preview?lang=${l.code}`} className={l.code === locale ? "font-semibold" : "text-muted hover:text-accent"}>
              {l.label}
            </a>
          ))}
        </p>
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
          {Object.entries(all).map(([id, s]) => (
            <li key={id}>
              <a href={`/preview?state=${id}&lang=${locale}`} className="flex min-h-12 items-center px-4 hover:text-accent">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return <Decoder key={`${state}-${locale}`} initialState={entry.state} demo={entry.demo} />;
}
