"use client";

import { useRef, useState } from "react";
import { type DecodeResponse, decodeFile, RequestError } from "@/lib/client";
import type { Sample } from "@/lib/samples";
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/schema";
import FollowUpChat, { type Message } from "./FollowUpChat";
import { ClosingBand, Hero, HOME_LINKS, HowSection, LetterPreview, LettersSection, PrivacySection, UploadPanel } from "./Home";
import { ArrowLeftIcon, LetterMark } from "./icons";
import ReplyDrafter, { type ReplyPreview } from "./ReplyDrafter";
import ResultCard from "./ResultCard";
import { ErrorPanel, type ErrorKind, errorKind, LoadingView } from "./Status";
import { button } from "./ui";

export type DecoderState =
  | { status: "idle" }
  | { status: "loading"; source: string; initialElapsed?: number }
  | { status: "done"; result: DecodeResponse; source: string; cached: boolean }
  | { status: "error"; kind: ErrorKind; message: string };

// Lets the dev-only /preview route open the reply and chat mid-conversation.
export type DecoderDemo = { reply?: ReplyPreview; chat?: Message[] };

export default function Decoder({ initialState, demo }: { initialState?: DecoderState; demo?: DecoderDemo }) {
  const [state, setState] = useState<DecoderState>(initialState ?? { status: "idle" });
  const [language, setLanguage] = useState("English");
  const runId = useRef(0);
  const lastRun = useRef<(() => void) | null>(null);

  function show(next: DecoderState) {
    setState(next);
    window.scrollTo({ top: 0 });
  }

  function fail(error: unknown) {
    const status = error instanceof RequestError ? error.status : undefined;
    show({ status: "error", kind: errorKind(status), message: error instanceof Error ? error.message : "Something went wrong." });
  }

  async function run(file: File, source: string) {
    lastRun.current = () => run(file, source);
    if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      show({ status: "error", kind: "fileType", message: "Upload a JPG, PNG, WebP or PDF." });
      return;
    }
    // Photos are shrunk before upload, so only PDFs can be too big here.
    if (file.size > MAX_UPLOAD_BYTES && file.type === "application/pdf") {
      show({ status: "error", kind: "tooLarge", message: "That file is too big." });
      return;
    }
    const id = ++runId.current;
    show({ status: "loading", source });
    try {
      const result = await decodeFile(file, language);
      if (id === runId.current) show({ status: "done", result, source, cached: false });
    } catch (error) {
      if (id === runId.current) fail(error);
    }
  }

  async function runSample(sample: Sample) {
    lastRun.current = () => runSample(sample);
    const id = ++runId.current;
    show({ status: "loading", source: sample.title });
    // Prefer the pre-computed result so the demo is instant and free. Fall back
    // to a live decode of the sample PDF if it hasn't been generated yet.
    if (language === "English") {
      const cached = await fetch(`/samples/${sample.id}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      if (id !== runId.current) return;
      if (cached?.analysis) {
        show({ status: "done", result: cached, source: sample.title, cached: true });
        return;
      }
    }
    try {
      const blob = await fetch(`/samples/${sample.id}.pdf`).then((r) => r.blob());
      if (id !== runId.current) return;
      await run(new File([blob], `${sample.id}.pdf`, { type: "application/pdf" }), sample.title);
    } catch (error) {
      if (id === runId.current) fail(error);
    }
  }

  function reset() {
    runId.current++;
    show({ status: "idle" });
  }

  const onFile = (file: File) => run(file, file.name);
  const home = state.status === "idle" || state.status === "error";

  return (
    <div className={`flex min-h-dvh flex-col ${state.status === "done" ? "pb-24 sm:pb-0" : ""}`}>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-5">
        <button type="button" onClick={reset} className="-ml-2 flex min-h-11 items-center gap-2 rounded-xl px-2 text-[16px] font-semibold tracking-[-0.01em]">
          <LetterMark />
          Paperwork Decoder
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
          <button type="button" onClick={reset} className={button.small}>
            <ArrowLeftIcon size={18} />
            New letter
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
                  <ErrorPanel kind={state.kind} detail={state.message} onRetry={() => lastRun.current?.()} onFile={onFile} />
                )}
                <UploadPanel busy={false} language={language} onLanguage={setLanguage} onFile={onFile} onSample={runSample} />
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
          <div className="px-4 pt-8 pb-16 sm:px-6 sm:pt-16">
            <LoadingView source={state.source} language={language} initialElapsed={state.initialElapsed} />
          </div>
        )}

        {state.status === "done" && (
          <div className="mx-auto max-w-3xl space-y-5 px-4 pt-4 pb-12 sm:px-6 sm:pt-6">
            <ResultCard analysis={state.result.analysis} usage={state.result.usage} cached={state.cached} />
            <div className="space-y-5 pt-6">
              <ReplyDrafter analysis={state.result.analysis} initial={demo?.reply} />
              <FollowUpChat key={state.source} analysis={state.result.analysis} initialMessages={demo?.chat} />
            </div>
          </div>
        )}
      </main>

      <footer className={`mx-auto w-full px-4 pb-10 sm:px-6 ${home ? "max-w-6xl" : state.status === "loading" ? "max-w-lg" : "max-w-3xl"}`}>
        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Not legal or financial advice. Always check the original letter. Files are sent to an AI model to be read and
            aren&apos;t stored by this app.
          </p>
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
