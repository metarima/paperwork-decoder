// Tiny fixed-window limiter kept in memory. Good enough for a demo on a single
// instance; swap for Upstash/Redis if this ever gets real traffic.
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, now = Date.now()) {
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { ok: true, remaining: limit - entry.count };
}

export function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

export function rateLimitedResponse(retryAfterSec = 3600) {
  return Response.json(
    { error: "You've hit the demo limit for now. Try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
