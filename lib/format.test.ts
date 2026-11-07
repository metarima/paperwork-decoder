import { describe, expect, it } from "vitest";
import { daysUntil, formatDays, formatMoney, keyDeadline, letterKey, maskSensitive, relativeDays, splitOnReferences } from "./format";

describe("daysUntil", () => {
  const today = new Date(2026, 8, 26, 15, 30);
  it("counts whole days regardless of time of day", () => {
    expect(daysUntil("2026-09-26", today)).toBe(0);
    expect(daysUntil("2026-09-27", today)).toBe(1);
    expect(daysUntil("2026-10-31", today)).toBe(35);
    expect(daysUntil("2026-09-20", today)).toBe(-6);
  });
  it("returns null for garbage", () => {
    expect(daysUntil("soon", today)).toBeNull();
  });
});

describe("relativeDays", () => {
  it("reads naturally", () => {
    expect(relativeDays(0)).toBe("today");
    expect(relativeDays(1)).toBe("tomorrow");
    expect(relativeDays(5)).toBe("in 5 days");
    expect(relativeDays(-1)).toBe("yesterday");
    expect(relativeDays(-7)).toBe("7 days ago");
  });
  it("follows the reader's language", () => {
    expect(relativeDays(-7, "pt-PT")).toBe("há 7 dias");
    expect(relativeDays(3, "de-DE")).toBe("in 3 Tagen");
  });
});

describe("formatDays", () => {
  it("pluralises per language", () => {
    expect(formatDays(1)).toBe("1 day");
    expect(formatDays(7)).toBe("7 days");
    expect(formatDays(2, "uk-UA")).toBe("2 дні");
    expect(formatDays(7, "uk-UA")).toBe("7 днів");
  });
});

describe("formatMoney", () => {
  it("formats known currencies and falls back for unknown ones", () => {
    expect(formatMoney(312.4, "EUR")).toBe("€312.40");
    expect(formatMoney(10, "NOPE")).toBe("10.00 NOPE");
    expect(formatMoney(312.4, "EUR", "pt-PT")).toBe("312,40 €");
  });
});

describe("maskSensitive", () => {
  it("masks IBANs but keeps other references", () => {
    expect(maskSensitive("PT50 0002 0123 1234 5678 9015 4")).toBe("•••••••••••••••••••••0154");
    expect(maskSensitive("21312 123 456")).toBe("21312 123 456");
  });
});

describe("keyDeadline", () => {
  const today = new Date(2026, 10, 7);
  it("leads with the next upcoming deadline", () => {
    const d = keyDeadline(
      [
        { date: "2026-11-01", what: "discount ends" },
        { date: "2026-11-20", what: "pay in full" },
        { date: "2026-12-01", what: "later" },
      ],
      today,
    );
    expect(d).toMatchObject({ date: "2026-11-20", days: 13, overdue: false });
  });
  it("is overdue when every deadline has passed, using the latest one", () => {
    const d = keyDeadline(
      [
        { date: "2026-10-01", what: "first" },
        { date: "2026-10-31", what: "pay" },
      ],
      today,
    );
    expect(d).toMatchObject({ date: "2026-10-31", days: -7, overdue: true });
  });
  it("ignores undated entries", () => {
    expect(keyDeadline([{ date: "within 15 days", what: "reply" }], today)).toBeNull();
  });
});

describe("splitOnReferences", () => {
  it("finds references regardless of spacing", () => {
    const parts = splitOnReferences("Pay with Entidade 21312 and Referência 481293776 at an ATM.", ["21312", "481 293 776"]);
    expect(parts.filter((p) => p.ref).map((p) => p.text)).toEqual(["21312", "481293776"]);
    expect(parts.map((p) => p.text).join("")).toBe("Pay with Entidade 21312 and Referência 481293776 at an ATM.");
  });
  it("leaves text alone when there is nothing to match", () => {
    expect(splitOnReferences("Call them.", ["12"])).toEqual([{ text: "Call them.", ref: false }]);
  });
});

describe("letterKey", () => {
  it("is stable and differs between letters", () => {
    expect(letterKey(["a", "b"])).toBe(letterKey(["a", "b"]));
    expect(letterKey(["a", "b"])).not.toBe(letterKey(["a", "c"]));
  });
});
