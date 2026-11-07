"use client";

import { useEffect, useRef, useState } from "react";
import { ACCEPTED_TYPES, MAX_UPLOAD_MB } from "@/lib/schema";
import { CameraIcon, CheckIcon, CopyIcon, UploadIcon } from "./icons";

// Shared button styles. Every control is at least 44px tall.
const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

export const button = {
  primary: `${base} min-h-12 bg-accent px-5 text-[15px] text-on-accent hover:bg-accent-hover`,
  secondary: `${base} min-h-12 border border-border-strong bg-surface px-5 text-[15px] text-foreground hover:border-accent hover:text-accent`,
  small: `${base} min-h-11 border border-border-strong bg-surface px-3.5 text-sm text-foreground hover:border-accent hover:text-accent`,
};

export const card = "rounded-2xl border border-border bg-surface";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-4 rounded-full border-2 border-current border-r-transparent ${className}`}
      style={{ animation: "spin 0.8s linear infinite" }}
    />
  );
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  srLabel,
  iconOnly = false,
  className = "",
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  srLabel?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the value is
      // still visible and selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={srLabel ? (copied ? `${srLabel}: copied` : srLabel) : undefined}
      className={`${base} min-h-11 shrink-0 border px-3 text-sm ${
        copied ? "border-accent bg-accent-soft text-accent" : "border-border-strong bg-surface text-foreground hover:border-accent hover:text-accent"
      } ${iconOnly ? "min-w-11 px-0" : ""} ${className}`}
    >
      {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
      {!iconOnly && <span aria-live="polite">{copied ? copiedLabel : label}</span>}
    </button>
  );
}

// Hidden camera and file inputs, opened by buttons anywhere on the page.
export function useFilePicker(onFile: (file: File) => void) {
  const photoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) onFile(file);
  };
  return {
    openCamera: () => photoRef.current?.click(),
    openFiles: () => fileRef.current?.click(),
    inputs: (
      <>
        <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} tabIndex={-1} />
        <input ref={fileRef} type="file" accept={ACCEPTED_TYPES.join(",")} className="hidden" onChange={pick} tabIndex={-1} />
      </>
    ),
  };
}

// The main way in: the camera on touch screens, the file picker with a mouse.
export function PickButtons({
  onFile,
  disabled = false,
  cameraLabel = "Take a photo",
  fileLabel = "Choose a file",
  secondary = true,
  className = "",
}: {
  onFile: (file: File) => void;
  disabled?: boolean;
  cameraLabel?: string;
  fileLabel?: string;
  secondary?: boolean;
  className?: string;
}) {
  const { openCamera, openFiles, inputs } = useFilePicker(onFile);
  return (
    <div className={`flex flex-col gap-2 sm:flex-row ${className}`}>
      {/* Wrappers carry the pointer switch, so the buttons' own display can't override it. */}
      <span className="hidden pointer-coarse:contents">
        <button type="button" disabled={disabled} onClick={openCamera} className={button.primary}>
          <CameraIcon size={20} />
          {cameraLabel}
        </button>
        {secondary && (
          <button type="button" disabled={disabled} onClick={openFiles} className={button.secondary}>
            <UploadIcon size={18} />
            Upload a file
          </button>
        )}
      </span>
      <span className="contents pointer-coarse:hidden">
        <button type="button" disabled={disabled} onClick={openFiles} className={button.primary}>
          <UploadIcon size={18} />
          {fileLabel}
        </button>
      </span>
      {inputs}
      <span className="sr-only">JPG, PNG or PDF, up to {MAX_UPLOAD_MB}MB</span>
    </div>
  );
}
