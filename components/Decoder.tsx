"use client";

import { useRef, useState } from "react";
import { type DecodeResponse, decodeFile } from "@/lib/client";
import { SAMPLES, type Sample } from "@/lib/samples";
import { ACCEPTED_TYPES, MAX_UPLOAD_BYTES } from "@/lib/schema";
import FollowUpChat from "./FollowUpChat";
import ReplyDrafter from "./ReplyDrafter";
import ResultCard from "./ResultCard";

const LANGUAGES = ["English", "Português", "Español", "Français", "Deutsch", "Italiano", "Українська"];

type State =
  | { status: "idle" }
  | { status: "loading"; label: string }
  | { status: "done"; result: DecodeResponse; source: string; cached: boolean }
  | { status: "error"; message: string };

export default function Decoder() {
  const [state, setState] = useState<State>({ status: "idle" });
  const [language, setLanguage] = useState("English");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function run(file: File, source: string) {
    if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
      setState({ status: "error", message: "Upload a JPG, PNG, WebP or PDF." });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES && file.type === "application/pdf") {
      setState({ status: "error", message: "That PDF is over 10MB." });
      return;
    }
    setState({ status: "loading", label: `Reading ${source}…` });
    try {
      const result = await decodeFile(file, language);
      setState({ status: "done", result, source, cached: false });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Something went wrong." });
    }
  }

  async function runSample(sample: Sample) {
    setState({ status: "loading", label: `Reading ${sample.title}…` });
    // Prefer the pre-computed result so the demo is instant and free. Fall back
    // to a live decode of the sample PDF if it hasn't been generated yet.
    if (language === "English") {
      const cached = await fetch(`/samples/${sample.id}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      if (cached?.analysis) {
        setState({ status: "done", result: cached, source: sample.title, cached: true });
        return;
      }
    }
    const blob = await fetch(`/samples/${sample.id}.pdf`).then((r) => r.blob());
    await run(new File([blob], `${sample.id}.pdf`, { type: "application/pdf" }), sample.title);
  }

  const busy = state.status === "loading";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div
          role="button"
          tabIndex={0}
          aria-disabled={busy}
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !busy && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file && !busy) run(file, file.name);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
            dragging ? "border-accent bg-accent-soft" : "border-border hover:border-accent"
          } ${busy ? "pointer-events-none opacity-60" : ""}`}
        >
          <svg aria-hidden width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-accent">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5M9 13h6M9 17h4" />
          </svg>
          <p className="font-medium">Take a photo or drop a letter here</p>
          <p className="mt-1 text-sm text-muted">JPG, PNG or PDF, up to 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) run(file, file.name);
            }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="text-muted">Explain in</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-border bg-surface px-2 py-1"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted">No letter handy? Try:</span>
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                disabled={busy}
                onClick={() => runSample(s)}
                className="rounded-full border border-border px-3 py-1 hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {s.flag} {s.short}
              </button>
            ))}
          </div>
        </div>
      </section>

      {state.status === "loading" && <LoadingCard label={state.label} />}

      {state.status === "error" && (
        <div role="alert" className="rounded-xl border border-high bg-high-soft px-4 py-3 text-high">
          {state.message}
        </div>
      )}

      {state.status === "done" && (
        <>
          <ResultCard analysis={state.result.analysis} usage={state.result.usage} cached={state.cached} />
          <ReplyDrafter analysis={state.result.analysis} />
          <FollowUpChat key={state.source} analysis={state.result.analysis} />
        </>
      )}
    </div>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <div aria-live="polite" className="rounded-2xl border border-border bg-surface p-6">
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted">Finding deadlines, amounts and what you need to do. This takes 10 to 30 seconds.</p>
      <div className="mt-4 space-y-2">
        {[80, 60, 70].map((w) => (
          <div key={w} className="h-3 animate-pulse rounded bg-border" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
