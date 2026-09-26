import { describe, expect, it } from "vitest";
import { buildIcs, escapeIcsText, foldLine } from "./ics";

const NOW = new Date("2026-09-26T10:00:00Z");

describe("buildIcs", () => {
  it("creates an all-day event per valid deadline", () => {
    const ics = buildIcs([{ date: "2026-10-31", what: "Pay IMI" }], "Tax notice", NOW);
    expect(ics).toContain("DTSTART;VALUE=DATE:20261031");
    expect(ics).toContain("DTEND;VALUE=DATE:20261101");
    expect(ics).toContain("SUMMARY:Tax notice: Pay IMI");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });

  it("rolls DTEND over month and year boundaries", () => {
    const ics = buildIcs([{ date: "2026-12-31", what: "x" }], "t", NOW);
    expect(ics).toContain("DTEND;VALUE=DATE:20270101");
  });

  it("skips deadlines that aren't ISO dates", () => {
    const ics = buildIcs([{ date: "end of October", what: "x" }], "t", NOW);
    expect(ics).not.toContain("BEGIN:VEVENT");
  });

  it("uses CRLF line endings", () => {
    const ics = buildIcs([], "t", NOW);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
  });
});

describe("escapeIcsText", () => {
  it("escapes commas, semicolons, backslashes and newlines", () => {
    expect(escapeIcsText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
  });
});

describe("foldLine", () => {
  it("leaves short lines alone and folds long ones", () => {
    expect(foldLine("short")).toBe("short");
    const folded = foldLine("x".repeat(200));
    expect(folded.split("\r\n").every((l) => l.length <= 75)).toBe(true);
    expect(folded.replace(/\r\n /g, "")).toBe("x".repeat(200));
  });
});
