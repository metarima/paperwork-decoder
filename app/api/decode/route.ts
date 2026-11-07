import { apiErrorResponse } from "@/lib/provider";
import { decodeLetter } from "@/lib/decode";
import { DEFAULT_LOCALE, isLocale } from "@/lib/locales";
import { checkRateLimit, clientKey, rateLimitedResponse } from "@/lib/rate-limit";
import { isAcceptedType, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/schema";

export const maxDuration = 60;

export async function POST(request: Request) {
  const limit = checkRateLimit(`decode:${clientKey(request)}`, 20);
  if (!limit.ok) return rateLimitedResponse(limit.retryAfterSec);

  const form = await request.formData();
  const file = form.get("file");
  const requested = form.get("language");
  const explainIn = isLocale(requested) ? requested : DEFAULT_LOCALE;

  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!isAcceptedType(file.type)) {
    return Response.json({ error: "Upload a JPG, PNG, WebP or PDF." }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: `That file is over ${MAX_UPLOAD_MB}MB.` }, { status: 413 });
  }

  try {
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await decodeLetter(data, file.type, explainIn);
    if (!result.ok) {
      const error =
        result.reason === "refusal"
          ? "This document couldn't be processed."
          : "Couldn't make sense of that letter. Try a clearer photo.";
      return Response.json({ error }, { status: 422 });
    }
    return Response.json({ analysis: result.analysis, usage: result.usage });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
