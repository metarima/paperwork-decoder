"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { type DecodeResponse, decodeFile, RequestError } from "@/lib/client";
import { DEFAULT_LOCALE, isLocale, type Locale, localeFromBrowser } from "@/lib/locales";
import { MESSAGES } from "@/lib/messages";
import type { Sample } from "@/lib/samples";
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/schema";
import FollowUpChat, { type Message } from "./FollowUpChat";
import { ClosingBand, Hero, HOME_LINKS, HowSection, LetterPreview, LettersSection, PrivacySection, UploadPanel } from "./Home";
import { ArrowLeftIcon, LetterMark } from "./icons";
import { LocaleProvider } from "./LocaleContext";
import ReplyDrafter, { type ReplyPreview } from "./ReplyDrafter";
import ResultCard from "./ResultCard";
import { ErrorPanel, type ErrorKind, errorKind, LoadingView } from "./Status";
import { button } from "./ui";

// Each state remembers the language it was produced in, so the loading,
// error and result screens speak the language the letter is explained in.
export type DecoderState =
  | { status: "idle" }
  | { status: "loading"; source: string; locale: Locale; initialElapsed?: number }
  | { status: "done"; result: DecodeResponse; source: string; cached: boolean; locale: Locale; rerun?: (locale: Locale) => void }
  | { status: "error"; kind: ErrorKind; message: string; locale: Locale };

// Lets the dev-only /preview route open the reply and chat mid-conversation.
export type DecoderDemo = { reply?: ReplyPreview; chat?: Message[] };

// The "Explain in" choice is remembered on this device. Before anyone has
// chosen, it follows the browser's language when that's one we support.
const LANGUAGE_KEY = "pd:explain-in";
const noSubscribe = () => () => {};
function preferredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // Storage blocked: fall through to the browser's language.
  }
  return localeFromBrowser(navigator.languages?.length ? navigator.languages : [navigator.language]);
}

export default function Decoder({ initialState, demo }: { initialState?: DecoderState; demo?: DecoderDemo }) {
  const [state, setState] = useState<DecoderState>(initialState ?? { status: "idle" });
  const preferred = useSyncExternalStore(noSubscribe, preferredLocale, () => DEFAULT_LOCALE);
  const [chosen, setChosen] = useState<Locale | null>(null);
  const language = chosen ?? preferred;
  const runId = useRef(0);
  const lastRun = useRef<(() => void) | null>(null);

  function chooseLanguage(locale: Locale) {
    setChosen(locale);
    try {
      localStorage.setItem(LANGUAGE_KEY, locale);
    } catch {
      // Not remembered this time; the choice still applies now.
    }
  }

  function show(next: DecoderState) {
    setState(next);
    window.scrollTo({ top: 0 });
  }

  function fail(error: unknown, locale: Locale) {
    const status = error instanceof RequestError ? error.status : undefined;
    show({ status: "error", kind: errorKind(status), message: error instanceof Error ? error.message : "Something went wrong.", locale });
  }

  async function run(file: File, source: string, locale: Locale = language) {
    lastRun.current = () => run(file, source, locale);
    if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      show({ status: "error", kind: "fileType", message: "Upload a JPG, PNG, WebP or PDF.", locale });
      return;
    }
    // Photos are shrunk before upload, so only PDFs can be too big here.
    if (file.size > MAX_UPLOAD_BYTES && file.type === "application/pdf") {
      show({ status: "error", kind: "tooLarge", message: "That file is too big.", locale });
      return;
    }
    const id = ++runId.current;
    show({ status: "loading", source, locale });
    try {
      const result = await decodeFile(file, locale);
      if (id === runId.current) {
        show({ status: "done", result, source, cached: false, locale, rerun: (next) => run(file, source, next) });
      }
    } catch (error) {
      if (id === runId.current) fail(error, locale);
    }
  }

  async function runSample(sample: Sample, locale: Locale = language) {
    lastRun.current = () => runSample(sample, locale);
    const id = ++runId.current;
    show({ status: "loading", source: sample.title, locale });
    const rerun = (next: Locale) => runSample(sample, next);
    // Prefer the pre-computed result so the demo is instant and free. Those
    // are English only; other languages decode the sample PDF live.
    if (locale === "en") {
      const cached = await fetch(`/samples/${sample.id}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      if (id !== runId.current) return;
      if (cached?.analysis) {
        show({ status: "done", result: cached, source: sample.title, cached: true, locale, rerun });
        return;
      }
    }
    try {
      const blob = await fetch(`/samples/${sample.id}.pdf`).then((r) => r.blob());
      if (id !== runId.current) return;
      const file = new File([blob], `${sample.id}.pdf`, { type: "application/pdf" });
      const result = await decodeFile(file, locale);
      if (id === runId.current) show({ status: "done", result, source: sample.title, cached: false, locale, rerun });
    } catch (error) {
      if (id === runId.current) fail(error, locale);
    }
  }

  function reset() {
    runId.current++;
    show({ status: "idle" });
  }

  const onFile = (file: File) => run(file, file.name);
  const home = state.status === "idle" || state.status === "error";
  // The home page is English; everything after an upload follows the letter's
  // explanation language.
  const pageLocale: Locale = home ? DEFAULT_LOCALE : state.locale;
  const chrome = MESSAGES[pageLocale];

  return (
    <div lang={pageLocale} className={`flex min-h-dvh flex-col ${state.status === "done" ? "pb-24 sm:pb-0" : ""}`}>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-5">
        <button
          type="button"
          onClick={reset}
          aria-label="Paperwork Decoder"
          className="-ml-2 flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-2 text-[16px] font-semibold tracking-[-0.01em] whitespace-nowrap"
        >
          <LetterMark />
          {/* On phones the result screens show just the mark, so the
              translated "New letter" button always fits. */}
          <span className={home ? "" : "max-sm:hidden"}>Paperwork Decoder</span>
        </button>
        {home && (
          <nav aria-label="Page sections" className="-mr-3 hidden items-center md:flex">
            {HOME_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="flex min-h-11 items-center rounded-xl px-3 text-[15px] text-muted transition-colors hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>
        )}
        {!home && (
          <button type="button" onClick={reset} className={`${button.small} min-w-0 whitespace-nowrap`}>
            <ArrowLeftIcon size={18} className="shrink-0" />
            <span className="truncate">{chrome.newLetter}</span>
          </button>
        )}
      </header>

      <main className="flex-1">
        {home && (
          <>
            <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-6 pb-16 sm:px-6 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-20 lg:pt-16 lg:pb-24">
              <div className="space-y-8">
                <Hero />
                {state.status === "error" && (
                  <LocaleProvider locale={state.locale}>
                    <div lang={state.locale}>
                      <ErrorPanel kind={state.kind} detail={state.message} onRetry={() => lastRun.current?.()} onFile={onFile} />
                    </div>
                  </LocaleProvider>
                )}
                <UploadPanel busy={false} language={language} onLanguage={chooseLanguage} onFile={onFile} onSample={(s) => runSample(s)} />
              </div>
              <LetterPreview />
            </div>
            <LettersSection />
            <HowSection />
            <PrivacySection />
            <ClosingBand onFile={onFile} />
          </>
        )}

        {state.status === "loading" && (
          <LocaleProvider locale={state.locale}>
            <div className="px-4 pt-8 pb-16 sm:px-6 sm:pt-16">
              <LoadingView source={state.source} initialElapsed={state.initialElapsed} />
            </div>
          </LocaleProvider>
        )}

        {state.status === "done" && (
          <LocaleProvider locale={state.locale}>
            <div className="mx-auto max-w-3xl space-y-5 px-4 pt-4 pb-12 sm:px-6 sm:pt-6">
              <ResultCard
                analysis={state.result.analysis}
                usage={state.result.usage}
                cached={state.cached}
                onExplainIn={
                  state.rerun
                    ? (locale) => {
                        chooseLanguage(locale);
                        state.rerun?.(locale);
                      }
                    : undefined
                }
              />
              <div className="space-y-5 pt-6">
                <ReplyDrafter key={`reply-${state.locale}`} analysis={state.result.analysis} initial={demo?.reply} />
                <FollowUpChat key={`${state.source}-${state.locale}`} analysis={state.result.analysis} initialMessages={demo?.chat} />
              </div>
            </div>
          </LocaleProvider>
        )}
      </main>

      <footer className={`mx-auto w-full px-4 pb-10 sm:px-6 ${home ? "max-w-6xl" : state.status === "loading" ? "max-w-lg" : "max-w-3xl"}`}>
        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <p className="max-w-xl text-sm leading-relaxed text-muted">{chrome.disclaimer}</p>
          {home && (
            <nav aria-label="Footer" className="-ml-3 flex flex-wrap sm:-mr-3 sm:ml-0">
              {HOME_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="flex min-h-11 items-center px-3 text-sm text-muted hover:text-foreground">
                  {l.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </footer>
    </div>
  );
}
