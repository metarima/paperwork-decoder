"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { DecodeUsage } from "@/lib/decode";
import {
  daysUntil,
  formatDate,
  formatMoney,
  keyDeadline,
  letterKey,
  maskSensitive,
  relativeDays,
  splitOnReferences,
} from "@/lib/format";
import { downloadIcs } from "@/lib/ics";
import type { LetterAnalysis } from "@/lib/schema";
import { AlertIcon, AskIcon, CalendarIcon, CheckIcon, ChevronIcon, ClockIcon, EyeIcon, ReplyIcon } from "./icons";
import { button, card, CopyButton } from "./ui";

const URGENCY = {
  high: { label: "Urgent", hint: "Deal with this now", text: "text-high", dot: "bg-high", soft: "bg-high-soft" },
  medium: { label: "Needs attention", hint: "Deal with it in the next few days", text: "text-medium", dot: "bg-medium", soft: "bg-medium-soft" },
  low: { label: "Low priority", hint: "No rush, but keep the letter", text: "text-low", dot: "bg-low", soft: "bg-low-soft" },
} as const;

type Props = { analysis: LetterAnalysis; usage: DecodeUsage | null; cached: boolean };

export default function ResultCard({ analysis, usage, cached }: Props) {
  const key = keyDeadline(analysis.deadlines);
  const calendarDeadlines = analysis.deadlines.filter((d) => (daysUntil(d.date) ?? -1) >= 0);
  const addToCalendar = calendarDeadlines.length > 0 ? () => downloadIcs(calendarDeadlines, analysis.letterType) : null;

  return (
    <article className="space-y-4 sm:space-y-5" aria-labelledby="result-summary">
      <header className="pb-1">
        <p className="text-[15px] text-muted">
          {analysis.sender} <span aria-hidden>·</span> {analysis.letterType} <span aria-hidden>·</span> in {analysis.language}
        </p>
        <h1 id="result-summary" className="mt-2 text-[1.625rem] leading-[1.2] font-semibold tracking-[-0.02em] text-balance sm:text-[2rem]">
          {analysis.summary}
        </h1>
      </header>

      {analysis.confidence !== "high" && <ConfidenceNotice confidence={analysis.confidence} uncertainties={analysis.uncertainties} />}

      <SummaryStrip analysis={analysis} keyDate={key} />

      <div className="hidden flex-wrap gap-2 sm:flex">
        {addToCalendar && (
          <button type="button" onClick={addToCalendar} className={button.small}>
            <CalendarIcon size={18} />
            Add to calendar
          </button>
        )}
        <a href="#reply" className={button.small}>
          <ReplyIcon size={18} />
          Draft a reply
        </a>
        <a href="#ask" className={button.small}>
          <AskIcon size={18} />
          Ask about this letter
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Deadlines deadlines={analysis.deadlines} />
        <Money amounts={analysis.amounts} />
      </div>

      {analysis.referenceNumbers.length > 0 && <References refs={analysis.referenceNumbers} />}

      <Steps analysis={analysis} />

      <section aria-labelledby="ignore-title" className={`${card} p-5 sm:p-6`}>
        <h2 id="ignore-title" className="flex items-center gap-2 text-[17px] font-semibold">
          <AlertIcon size={18} className="text-high" />
          If you ignore it
        </h2>
        <p className="mt-2 max-w-[65ch] text-[16px] leading-relaxed">{analysis.consequencesIfIgnored}</p>
      </section>

      {analysis.confidence === "high" && analysis.uncertainties.length > 0 && (
        <section aria-labelledby="check-title" className="rounded-2xl border border-dashed border-border-strong/60 p-5 sm:p-6">
          <h2 id="check-title" className="text-[17px] font-semibold">
            Worth double-checking
          </h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-muted marker:text-border-strong">
            {analysis.uncertainties.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </section>
      )}

      <details className={`${card} group`}>
        <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3 hover:bg-surface-2 sm:px-6 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-[17px] font-semibold">Full explanation</span>
            <span className="block text-sm text-muted">The whole letter, in plain words</span>
          </span>
          <ChevronIcon size={22} className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="max-w-[65ch] space-y-3 px-5 pb-6 text-[16px] leading-relaxed sm:px-6">
          {analysis.explanation.split(/\n+/).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </details>

      <TechNote usage={usage} cached={cached} />

      <MobileActionBar onCalendar={addToCalendar} />
    </article>
  );
}

function SummaryStrip({ analysis, keyDate }: { analysis: LetterAnalysis; keyDate: ReturnType<typeof keyDeadline> }) {
  const overdue = keyDate?.overdue ?? false;
  const urgency = URGENCY[overdue ? "high" : analysis.urgency];
  const [amount, ...moreAmounts] = analysis.amounts;

  return (
    <section aria-label="Key facts" className={`overflow-hidden ${card} ${overdue ? "border-high" : ""}`}>
      {overdue && keyDate && (
        <div className="flex items-start gap-3 bg-high px-5 py-3.5 text-on-high sm:px-6">
          <ClockIcon size={22} className="mt-0.5 shrink-0" />
          <p className="text-[16px] leading-snug">
            <strong className="font-semibold">
              Overdue by {-keyDate.days} day{keyDate.days === -1 ? "" : "s"}.
            </strong>{" "}
            The deadline was {formatDate(keyDate.date)}. Deal with this today.
          </p>
        </div>
      )}
      <dl className={`grid grid-cols-2 ${overdue ? "" : "sm:grid-cols-3"}`}>
        {/* When overdue, the red band above says how urgent it is. */}
        {!overdue && (
          <div className={`col-span-2 flex items-center justify-between gap-3 px-5 py-4 sm:col-span-1 sm:block sm:px-6 sm:py-5 ${urgency.soft}`}>
            <dt className="text-[13px] text-muted max-sm:sr-only">How urgent</dt>
            <dd className={`flex shrink-0 items-center gap-2 text-lg font-semibold whitespace-nowrap sm:mt-1 ${urgency.text}`}>
              <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${urgency.dot}`} />
              {urgency.label}
            </dd>
            <dd className="min-w-0 text-right text-sm leading-snug text-muted sm:mt-0.5 sm:text-left">{urgency.hint}</dd>
          </div>
        )}
        <div className={`border-r border-border px-5 py-4 sm:px-6 sm:py-5 ${overdue ? "" : "sm:border-l"}`}>
          <dt className="text-[13px] text-muted">How much</dt>
          {amount ? (
            <>
              <dd className="mt-1 text-2xl font-semibold tracking-[-0.01em] tabular-nums">{formatMoney(amount.value, amount.currency)}</dd>
              <dd className="mt-0.5 line-clamp-2 text-sm text-muted">
                {moreAmounts.length > 0 ? `${moreAmounts.length} other amount${moreAmounts.length > 1 ? "s" : ""} below` : amount.reason}
              </dd>
            </>
          ) : (
            <dd className="mt-1 text-lg font-semibold">Nothing to pay</dd>
          )}
        </div>
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <dt className="text-[13px] text-muted">By when</dt>
          {keyDate ? (
            <>
              <dd className={`mt-1 text-lg leading-snug font-semibold ${overdue ? "text-high" : ""}`}>{formatDate(keyDate.date)}</dd>
              <dd className={`mt-0.5 text-sm ${overdue ? "font-medium text-high" : keyDate.days <= 7 ? "font-medium text-medium" : "text-muted"}`}>
                {overdue ? `Passed ${relativeDays(keyDate.days)}` : relativeDays(keyDate.days)}
              </dd>
            </>
          ) : (
            <dd className="mt-1 text-lg font-semibold">No date given</dd>
          )}
        </div>
      </dl>
    </section>
  );
}

function ConfidenceNotice({ confidence, uncertainties }: { confidence: "low" | "medium"; uncertainties: string[] }) {
  return (
    <section aria-labelledby="confidence-title" className="rounded-2xl border border-medium/40 bg-medium-soft p-5 sm:p-6">
      <h2 id="confidence-title" className="flex items-center gap-2 text-[17px] font-semibold text-medium">
        <EyeIcon size={20} />
        {confidence === "low" ? "Check this one against the letter" : "Mostly clear, but check a few things"}
      </h2>
      <p className="mt-1.5 text-[15px] leading-relaxed">
        {confidence === "low"
          ? "Parts of this letter were hard to read, so some details below may be wrong. Compare them with the original before you act."
          : "Most of the letter was clear. Compare these points with the original before you act."}
      </p>
      {uncertainties.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-[15px] leading-snug">
          {uncertainties.map((u, i) => (
            <li key={i} className="flex gap-2.5">
              <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-medium" />
              {u}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Deadlines({ deadlines }: { deadlines: LetterAnalysis["deadlines"] }) {
  return (
    <section aria-labelledby="deadlines-title" className={`${card} p-5 sm:p-6`}>
      <h2 id="deadlines-title" className="text-[17px] font-semibold">
        Deadlines
      </h2>
      {deadlines.length === 0 ? (
        <p className="mt-2 text-[15px] text-muted">The letter doesn&apos;t give a deadline.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {deadlines.map((d, i) => {
            const days = daysUntil(d.date);
            return (
              <li key={i} className="py-3 first:pt-0 last:pb-0">
                <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-[16px] font-semibold">{formatDate(d.date)}</span>
                  {days !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[13px] font-medium ${
                        days < 0 ? "bg-high-soft text-high" : days <= 7 ? "bg-medium-soft text-medium" : "text-muted"
                      }`}
                    >
                      {days < 0 ? `Passed ${relativeDays(days)}` : relativeDays(days)}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[15px] leading-snug text-muted">{d.what}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Money({ amounts }: { amounts: LetterAnalysis["amounts"] }) {
  return (
    <section aria-labelledby="money-title" className={`${card} p-5 sm:p-6`}>
      <h2 id="money-title" className="text-[17px] font-semibold">
        Money
      </h2>
      {amounts.length === 0 ? (
        <p className="mt-2 text-[15px] text-muted">The letter doesn&apos;t ask for money.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {amounts.map((a, i) => (
            <li key={i} className="py-3 first:pt-0 last:pb-0">
              <p className="text-xl font-semibold tabular-nums">{formatMoney(a.value, a.currency)}</p>
              <p className="mt-0.5 text-[15px] leading-snug text-muted">{a.reason}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function References({ refs }: { refs: LetterAnalysis["referenceNumbers"] }) {
  return (
    <section aria-labelledby="refs-title" className={`${card} p-5 sm:p-6`}>
      <h2 id="refs-title" className="text-[17px] font-semibold">
        Reference numbers
      </h2>
      <p className="mt-0.5 text-[15px] text-muted">Quote these when you pay or reply.</p>
      <dl className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {refs.map((r, i) => (
          <RefField key={i} label={r.label} value={r.value} />
        ))}
      </dl>
    </section>
  );
}

function RefField({ label, value }: { label: string; value: string }) {
  const masked = maskSensitive(value);
  const sensitive = masked !== value;
  const [shown, setShown] = useState(!sensitive);
  return (
    <div className="flex min-h-16 items-center gap-2 rounded-xl bg-surface-2 py-2 pr-2 pl-4">
      <div className="min-w-0 flex-1">
        <dt className="text-[13px] text-muted">{label}</dt>
        <dd className="font-mono text-[16px] tracking-[0.02em] break-all">{shown ? value : masked}</dd>
      </div>
      {sensitive && (
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-pressed={shown}
          className="min-h-11 shrink-0 rounded-xl px-3 text-sm font-medium text-accent hover:bg-accent-soft"
        >
          {shown ? "Hide" : "Show"}
        </button>
      )}
      <CopyButton value={value.trim()} iconOnly srLabel={`Copy ${label}`} />
    </div>
  );
}

// Ticked steps are kept in this browser only (no accounts), keyed by a hash of
// the letter so the same letter decoded again shows the same ticks.
const memory = new Map<string, string>();
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
function readStored(key: string) {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStored(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: ticks still work for this visit.
  }
  listeners.forEach((l) => l());
}

function Steps({ analysis }: { analysis: LetterAnalysis }) {
  const storageKey = `pd:steps:${letterKey([analysis.sender, analysis.letterType, analysis.summary])}`;
  const raw = useSyncExternalStore(subscribe, () => readStored(storageKey), () => null);
  const done = useMemo(() => {
    try {
      return new Set<number>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set<number>();
    }
  }, [raw]);
  const refValues = analysis.referenceNumbers.map((r) => r.value);

  function toggle(i: number) {
    const next = new Set(done);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    writeStored(storageKey, JSON.stringify([...next]));
  }

  return (
    <section aria-labelledby="steps-title" className={`${card} p-5 sm:p-6`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="steps-title" className="text-[17px] font-semibold">
          What to do
        </h2>
        {analysis.actions.length > 0 && (
          <p className="text-sm text-muted tabular-nums" aria-live="polite">
            {done.size} of {analysis.actions.length} done
          </p>
        )}
      </div>
      <ol className="mt-3 space-y-2">
        {analysis.actions.map((a, i) => {
          const checked = done.has(i);
          return (
            <li key={i}>
              <label
                className={`flex cursor-pointer gap-3.5 rounded-xl border px-3.5 py-3.5 transition-colors ${
                  checked ? "border-transparent bg-surface-2" : "border-border hover:border-accent"
                }`}
              >
                <input type="checkbox" checked={checked} onChange={() => toggle(i)} className="peer sr-only" />
                <span
                  aria-hidden
                  className={`mt-px flex size-6 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
                    checked ? "border-accent bg-accent text-on-accent" : "border-border-strong bg-surface"
                  }`}
                >
                  {checked && <CheckIcon size={16} />}
                </span>
                <span className="min-w-0">
                  <span className={`block text-[16px] leading-snug font-semibold ${checked ? "text-muted line-through decoration-1" : ""}`}>
                    {a.step}
                  </span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-muted">
                    {splitOnReferences(a.how, refValues).map((part, j) =>
                      part.ref ? (
                        <span key={j} className="rounded bg-surface-2 px-1 font-mono text-[14px] whitespace-nowrap text-foreground">
                          {part.text}
                        </span>
                      ) : (
                        part.text
                      ),
                    )}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-muted">Ticks are saved on this device only.</p>
    </section>
  );
}

function TechNote({ usage, cached }: { usage: DecodeUsage | null; cached: boolean }) {
  if (cached) return <p className="px-1 text-[13px] text-muted">Sample result, generated earlier with the same pipeline.</p>;
  if (!usage) return null;
  return (
    <details className="group px-1 text-[13px] text-muted">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 hover:text-foreground [&::-webkit-details-marker]:hidden">
        Technical details
        <ChevronIcon size={14} className="transition-transform group-open:rotate-180" />
      </summary>
      <p className="font-mono text-[12px]">
        {usage.model} · {usage.inputTokens.toLocaleString()} in / {usage.outputTokens.toLocaleString()} out tokens ·{" "}
        {usage.costUsd !== null ? `$${usage.costUsd.toFixed(4)}` : "cost n/a"} · {(usage.ms / 1000).toFixed(1)}s
      </p>
    </details>
  );
}

function MobileActionBar({ onCalendar }: { onCalendar: (() => void) | null }) {
  const item =
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-[13px] font-medium text-foreground active:bg-surface-2";
  return (
    <nav
      aria-label="Result actions"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_rgb(0_0_0/0.25)] sm:hidden"
    >
      <div className="mx-auto flex max-w-md gap-1">
        {onCalendar && (
          <button type="button" onClick={onCalendar} className={item}>
            <CalendarIcon size={22} className="text-accent" />
            Calendar
          </button>
        )}
        <a href="#reply" className={item}>
          <ReplyIcon size={22} className="text-accent" />
          Reply
        </a>
        <a href="#ask" className={item}>
          <AskIcon size={22} className="text-accent" />
          Ask
        </a>
      </div>
    </nav>
  );
}
