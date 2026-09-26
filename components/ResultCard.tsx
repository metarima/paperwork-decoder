"use client";

import { useState } from "react";
import type { DecodeUsage } from "@/lib/decode";
import { daysUntil, formatDate, formatMoney, maskSensitive, relativeDays } from "@/lib/format";
import { downloadIcs } from "@/lib/ics";
import type { LetterAnalysis } from "@/lib/schema";

const URGENCY = {
  high: { label: "Urgent", className: "bg-high-soft text-high" },
  medium: { label: "Needs attention", className: "bg-medium-soft text-medium" },
  low: { label: "Low priority", className: "bg-low-soft text-low" },
} as const;

type Props = { analysis: LetterAnalysis; usage: DecodeUsage | null; cached: boolean };

export default function ResultCard({ analysis, usage, cached }: Props) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const urgency = URGENCY[analysis.urgency];
  const datedDeadlines = analysis.deadlines.filter((d) => daysUntil(d.date) !== null);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={`rounded-full px-2.5 py-0.5 font-medium ${urgency.className}`}>{urgency.label}</span>
          <span className="text-muted">
            {analysis.sender} · {analysis.letterType} · {analysis.language}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-semibold leading-snug">{analysis.summary}</h2>
      </div>

      {analysis.confidence !== "high" && (
        <div className="border-b border-border bg-medium-soft px-5 py-3 text-sm text-medium sm:px-6">
          I&apos;m {analysis.confidence === "low" ? "not very" : "fairly but not fully"} sure about this reading. Check
          the details below against the original letter.
        </div>
      )}

      <div className="grid gap-px bg-border sm:grid-cols-2">
        <Section title="Deadlines">
          {analysis.deadlines.length === 0 ? (
            <Empty>No deadlines found.</Empty>
          ) : (
            <ul className="space-y-3">
              {analysis.deadlines.map((d, i) => {
                const days = daysUntil(d.date);
                return (
                  <li key={i}>
                    <p className="font-medium">
                      {formatDate(d.date)}
                      {days !== null && (
                        <span className={`ml-2 text-sm ${days < 7 ? "text-high" : "text-muted"}`}>{relativeDays(days)}</span>
                      )}
                    </p>
                    <p className="text-sm text-muted">{d.what}</p>
                  </li>
                );
              })}
            </ul>
          )}
          {datedDeadlines.length > 0 && (
            <button
              onClick={() => downloadIcs(datedDeadlines, analysis.letterType)}
              className="mt-4 rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
            >
              Add to calendar (.ics)
            </button>
          )}
        </Section>

        <Section title="Money">
          {analysis.amounts.length === 0 ? (
            <Empty>No amounts mentioned.</Empty>
          ) : (
            <ul className="space-y-3">
              {analysis.amounts.map((a, i) => (
                <li key={i}>
                  <p className="text-lg font-semibold">{formatMoney(a.value, a.currency)}</p>
                  <p className="text-sm text-muted">{a.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <div className="border-t border-border p-5 sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">What to do</h3>
        <ol className="mt-3 space-y-3">
          {analysis.actions.map((a, i) => (
            <li key={i} className="flex gap-3">
              <input
                type="checkbox"
                aria-label={`Mark "${a.step}" as done`}
                checked={done.has(i)}
                onChange={() =>
                  setDone((prev) => {
                    const next = new Set(prev);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    return next;
                  })
                }
                className="mt-1 size-4 accent-[var(--accent)]"
              />
              <div className={done.has(i) ? "text-muted line-through" : ""}>
                <p className="font-medium">{a.step}</p>
                <p className="text-sm text-muted">{a.how}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="border-t border-border bg-high-soft/50 p-5 sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">If you ignore it</h3>
        <p className="mt-2">{analysis.consequencesIfIgnored}</p>
      </div>

      <details className="group border-t border-border p-5 sm:p-6">
        <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-muted">
          Full explanation, references and notes
        </summary>
        <div className="mt-4 space-y-5">
          <div className="space-y-3 leading-relaxed">
            {analysis.explanation.split(/\n+/).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {analysis.referenceNumbers.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {analysis.referenceNumbers.map((r, i) => (
                <div key={i} className="contents">
                  <dt className="text-muted">{r.label}</dt>
                  <dd className="font-mono">{maskSensitive(r.value)}</dd>
                </div>
              ))}
            </dl>
          )}
          {analysis.uncertainties.length > 0 && (
            <div>
              <p className="text-sm font-medium">Double-check these:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted">
                {analysis.uncertainties.map((u, i) => (
                  <li key={i}>{u}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>

      <footer className="border-t border-border px-5 py-3 text-xs text-muted sm:px-6">
        {cached
          ? "Sample result, generated earlier with the same pipeline."
          : usage &&
            `${usage.model} · ${usage.inputTokens.toLocaleString()} in / ${usage.outputTokens.toLocaleString()} out tokens · ${
              usage.costUsd !== null ? `$${usage.costUsd.toFixed(4)}` : "cost n/a"
            } · ${(usage.ms / 1000).toFixed(1)}s`}
      </footer>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface p-5 sm:p-6">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h3>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
