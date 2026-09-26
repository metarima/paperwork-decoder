// Builds an iCalendar (.ics) file for letter deadlines. All-day events with a
// reminder the day before, so it works in Google, Apple and Outlook calendars
// without any OAuth.

export type IcsDeadline = { date: string; what: string };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

// RFC 5545 text escaping.
export function escapeIcsText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (c) => `\\${c}`);
}

// Lines over 75 octets must be folded. We fold on characters, which is
// conservative enough for mostly-ASCII content.
export function foldLine(line: string) {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) parts.push(" " + line.slice(i, i + 74));
  return parts.join("\r\n");
}

function nextDay(y: number, m: number, d: number) {
  const date = new Date(Date.UTC(y, m - 1, d + 1));
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function stamp(now: Date) {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildIcs(deadlines: IcsDeadline[], title: string, now = new Date()) {
  const events = deadlines.flatMap((deadline, i) => {
    const match = ISO_DATE.exec(deadline.date);
    if (!match) return [];
    const [, y, m, d] = match;
    return [
      "BEGIN:VEVENT",
      `UID:${y}${m}${d}-${i}-${now.getTime()}@paperwork-decoder`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART;VALUE=DATE:${y}${m}${d}`,
      `DTEND;VALUE=DATE:${nextDay(+y, +m, +d)}`,
      `SUMMARY:${escapeIcsText(`${title}: ${deadline.what}`)}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-P1D",
      `DESCRIPTION:${escapeIcsText(deadline.what)}`,
      "END:VALARM",
      "END:VEVENT",
    ];
  });

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Paperwork Decoder//EN",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function downloadIcs(deadlines: IcsDeadline[], title: string) {
  const blob = new Blob([buildIcs(deadlines, title)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "deadlines"}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
