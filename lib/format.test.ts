import { describe, expect, it } from "vitest";
import { daysUntil, formatMoney, maskSensitive, relativeDays } from "./format";

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
    expect(relativeDays(-1)).toBe("1 day ago");
  });
});

describe("formatMoney", () => {
  it("formats known currencies and falls back for unknown ones", () => {
    expect(formatMoney(312.4, "EUR")).toBe("€312.40");
    expect(formatMoney(10, "NOPE")).toBe("10.00 NOPE");
  });
});

describe("maskSensitive", () => {
  it("masks IBANs but keeps other references", () => {
    expect(maskSensitive("PT50 0002 0123 1234 5678 9015 4")).toBe("•••••••••••••••••••••0154");
    expect(maskSensitive("21312 123 456")).toBe("21312 123 456");
  });
});
