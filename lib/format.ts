export function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

export function formatDate(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

// Whole days from today until an ISO date (negative if it has passed).
export function daysUntil(iso: string, today = new Date()) {
  const target = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

export function relativeDays(days: number) {
  if (days < 0) return `${-days} day${days === -1 ? "" : "s"} ago`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

// Masks long account-like numbers (IBANs, tax IDs) except their last 4 chars,
// so screenshots of results don't leak them. Payment references stay intact
// because the user needs them to pay.
export function maskSensitive(value: string) {
  const compact = value.replace(/\s/g, "");
  const looksLikeIban = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(compact);
  return looksLikeIban ? `${"•".repeat(Math.max(0, compact.length - 4))}${compact.slice(-4)}` : value;
}
