"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_UPLOAD_MB } from "@/lib/schema";
import { AlertIcon, CameraIcon, CheckIcon, FileIcon, RetryIcon, UploadIcon } from "./icons";
import { button, card, Spinner, useFilePicker } from "./ui";

// The decode is one request, so these steps are paced estimates of what the
// model is doing, not live progress. The last step holds until it finishes.
const STEPS = [
  { label: "Reading the letter", at: 0 },
  { label: "Finding deadlines", at: 4_000 },
  { label: "Working out what you owe", at: 10_000 },
  { label: "Writing the steps to take", at: 17_000 },
];

export function LoadingView({ source, language, initialElapsed = 0 }: { source: string; language: string; initialElapsed?: number }) {
  const [elapsed, setElapsed] = useState(initialElapsed);
  useEffect(() => {
    const started = Date.now() - initialElapsed;
    const id = setInterval(() => setElapsed(Date.now() - started), 500);
    return () => clearInterval(id);
  }, [initialElapsed]);

  const current = STEPS.findLastIndex((s) => elapsed >= s.at);

  return (
    <section aria-labelledby="loading-title" className={`${card} mx-auto w-full max-w-lg p-5 sm:p-7`}>
      <p className="flex min-w-0 items-center gap-2 text-sm text-muted">
        <FileIcon size={16} className="shrink-0" />
        <span className="truncate">{source}</span>
      </p>
      <h1 id="loading-title" className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
        Reading your letter
      </h1>
      <p className="mt-1.5 text-[15px] text-muted">
        This usually takes 10 to 30 seconds. Keep this page open.
      </p>

      <ol className="mt-6 space-y-1" aria-live="polite">
        {STEPS.map((step, i) => {
          const state = i < current ? "done" : i === current ? "active" : "todo";
          return (
            <li key={step.label} className="flex min-h-11 items-center gap-3 text-[16px]">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                  state === "done"
                    ? "border-accent bg-accent text-on-accent"
                    : state === "active"
                      ? "border-accent text-accent"
                      : "border-border-strong/50 text-muted"
                }`}
              >
                {state === "done" ? <CheckIcon size={16} /> : state === "active" ? <Spinner className="size-3.5" /> : null}
              </span>
              <span className={state === "todo" ? "text-muted" : state === "active" ? "font-medium" : "text-muted"}>
                {step.label}
                {state === "active" && <span className="sr-only"> (in progress)</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 border-t border-border pt-4 text-sm text-muted">
        Explaining in {language}. Your letter isn&apos;t stored.
      </p>
    </section>
  );
}

export type ErrorKind = "busy" | "tooLarge" | "unreadable" | "fileType" | "generic";

export function errorKind(status: number | undefined): ErrorKind {
  if (status === 429 || status === 502 || status === 503 || status === 529) return "busy";
  if (status === 413) return "tooLarge";
  if (status === 415) return "fileType";
  if (status === 400 || status === 422) return "unreadable";
  return "generic";
}

const ERRORS: Record<ErrorKind, { title: string; body: string }> = {
  busy: {
    title: "The service is busy right now",
    body: "Too many letters are being read at the moment. Wait a minute, then try again.",
  },
  tooLarge: {
    title: "That file is too big",
    body: `The limit is ${MAX_UPLOAD_MB}MB. Take a photo of the letter instead, or save the PDF at a smaller size.`,
  },
  unreadable: {
    title: "We couldn't read that letter",
    body: "Try a sharper photo: lay the letter flat in good light, with all four corners in the frame.",
  },
  fileType: {
    title: "That file type doesn't work here",
    body: "Upload a photo (JPG, PNG or WebP) or a PDF.",
  },
  generic: {
    title: "Something went wrong",
    body: "The letter couldn't be read this time. Try again in a moment.",
  },
};

export function ErrorPanel({
  kind,
  detail,
  onRetry,
  onFile,
}: {
  kind: ErrorKind;
  detail?: string;
  onRetry?: () => void;
  onFile: (file: File) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { openCamera, openFiles, inputs } = useFilePicker(onFile);
  useEffect(() => ref.current?.focus(), []);

  const copy = ERRORS[kind];
  const canRetry = (kind === "busy" || kind === "generic") && onRetry;

  return (
    <div ref={ref} role="alert" tabIndex={-1} className="animate-rise rounded-2xl border border-high/40 bg-high-soft p-5 outline-none sm:p-6">
      <div className="flex gap-3">
        <AlertIcon size={22} className="mt-0.5 shrink-0 text-high" />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{copy.title}</h2>
          <p className="mt-1 text-[15px] leading-relaxed">{copy.body}</p>
          {kind === "generic" && detail && <p className="mt-1 text-sm text-muted">{detail}</p>}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:pl-9">
        {canRetry ? (
          <button type="button" onClick={onRetry} className={button.primary}>
            <RetryIcon size={18} />
            Try again
          </button>
        ) : (
          <>
            <span className="hidden pointer-coarse:contents">
              <button type="button" onClick={openCamera} className={button.primary}>
                <CameraIcon size={20} />
                Take another photo
              </button>
            </span>
            <span className="contents pointer-coarse:hidden">
              <button type="button" onClick={openFiles} className={button.primary}>
                <UploadIcon size={18} />
                Choose another file
              </button>
            </span>
          </>
        )}
      </div>
      {inputs}
    </div>
  );
}
