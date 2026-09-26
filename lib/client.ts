"use client";

import type { DecodeUsage } from "./decode";
import type { LetterAnalysis } from "./schema";

export type DecodeResponse = { analysis: LetterAnalysis; usage: DecodeUsage | null };

const MAX_IMAGE_SIDE = 2000;

// Phone photos are often 4000px+ and several MB. The model doesn't benefit from
// more than ~2000px, so shrink before upload to save bandwidth and tokens.
export async function downscaleImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 3 * 1024 * 1024) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  return blob ? new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }) : file;
}

export async function decodeFile(file: File, language: string): Promise<DecodeResponse> {
  const form = new FormData();
  form.append("file", await downscaleImage(file));
  form.append("language", language);
  const res = await fetch("/api/decode", { method: "POST", body: form });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
  return body as DecodeResponse;
}

// POSTs JSON and calls onText with the accumulated text as it streams in.
export async function streamText(url: string, payload: unknown, onText: (text: string) => void, signal?: AbortSignal) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Something went wrong.");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  return text;
}
