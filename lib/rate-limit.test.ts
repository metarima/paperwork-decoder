import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows up to the limit then blocks until the window resets", () => {
    const key = `test-${Math.random()}`;
    const t = 1_000_000;
    expect(checkRateLimit(key, 2, t).ok).toBe(true);
    expect(checkRateLimit(key, 2, t).ok).toBe(true);
    const blocked = checkRateLimit(key, 2, t);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBe(3600);
    expect(checkRateLimit(key, 2, t + 60 * 60 * 1000).ok).toBe(true);
  });
});
