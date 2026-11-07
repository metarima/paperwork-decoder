// Formatting follows the reader's locale (an Intl tag such as "pt-PT").
// en-GB is the default so the home page and tests read the same as before.
const DEFAULT_INTL = "en-GB";

export function formatMoney(value: number, currency: string, intl = DEFAULT_INTL) {
  try {
    return new Intl.NumberFormat(intl, { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function formatDate(iso: string, intl = DEFAULT_INTL) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(intl, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// Whole days from today until an ISO date (negative if it has passed).
export function daysUntil(iso: string, today = new Date()) {
  const target = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

// "in 5 days", "yesterday", "há 7 dias", "7 днів тому": grammar and plurals
// come from Intl, so every language gets them right.
export function relativeDays(days: number, intl = DEFAULT_INTL) {
  return new Intl.RelativeTimeFormat(intl, { numeric: "auto" }).format(days, "day");
}

// A count of days with its unit, e.g. "7 days", "1 dia", "2 дні".
export function formatDays(count: number, intl = DEFAULT_INTL) {
  return new Intl.NumberFormat(intl, { style: "unit", unit: "day", unitDisplay: "long" }).format(count);
}

// Masks long account-like numbers (IBANs, tax IDs) except their last 4 chars,
// so screenshots of results don't leak them. Payment references stay intact
// because the user needs them to pay.
export function maskSensitive(value: string) {
  const compact = value.replace(/\s/g, "");
  const looksLikeIban = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(compact);
  return looksLikeIban ? `${"•".repeat(Math.max(0, compact.length - 4))}${compact.slice(-4)}` : value;
}

export type KeyDeadline = { date: string; what: string; days: number; overdue: boolean };

// The deadline the summary strip leads with: the next one still to come or,
// when every date has passed, the most recent one (which makes it overdue).
export function keyDeadline(deadlines: { date: string; what: string }[], today = new Date()): KeyDeadline | null {
  const dated = deadlines
    .map((d) => ({ ...d, days: daysUntil(d.date, today) }))
    .filter((d): d is { date: string; what: string; days: number } => d.days !== null)
    .sort((a, b) => a.days - b.days);
  if (dated.length === 0) return null;
  const upcoming = dated.find((d) => d.days >= 0);
  const pick = upcoming ?? dated[dated.length - 1];
  return { ...pick, overdue: pick.days < 0 };
}

// Splits text into plain and reference parts, so payment references quoted in
// a step can be set apart. Matching ignores spacing ("481293776" matches
// "481 293 776").
export function splitOnReferences(text: string, values: string[]) {
  const patterns = values
    .map((v) => v.replace(/\s+/g, ""))
    .filter((v) => v.length >= 4)
    .sort((a, b) => b.length - a.length)
    .map((v) => v.split("").map(escapeRegExp).join("\\s*"));
  const parts: { text: string; ref: boolean }[] = [];
  if (patterns.length === 0) return [{ text, ref: false }];
  let last = 0;
  for (const match of text.matchAll(new RegExp(patterns.join("|"), "g"))) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), ref: false });
    parts.push({ text: match[0], ref: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), ref: false });
  return parts;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Stable key for a decoded letter, so ticked steps can be remembered on this
// device without storing the letter itself.
export function letterKey(parts: string[]) {
  let hash = 5381;
  for (const ch of parts.join("|")) hash = ((hash << 5) + hash + ch.charCodeAt(0)) >>> 0;
  return hash.toString(36);
}
