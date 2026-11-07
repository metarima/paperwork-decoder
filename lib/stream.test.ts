import Anthropic from "@anthropic-ai/sdk";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";
import { describe, expect, it } from "vitest";
import { textStreamResponse } from "./stream";

// Minimal stand-in for the Anthropic MessageStream: async-iterable events + abort().
function fakeStream(events: unknown[], failFirst?: Error) {
  return {
    async *[Symbol.asyncIterator]() {
      if (failFirst) throw failFirst;
      yield* events;
    },
    abort() {},
  } as unknown as MessageStream;
}

describe("textStreamResponse (Claude)", () => {
  it("streams only the text deltas", async () => {
    const response = await textStreamResponse(
      fakeStream([
        { type: "message_start" },
        { type: "content_block_delta", delta: { type: "text_delta", text: "Hello " } },
        { type: "content_block_delta", delta: { type: "input_json_delta", partial_json: "{}" } },
        { type: "content_block_delta", delta: { type: "text_delta", text: "there" } },
        { type: "message_stop" },
      ]),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("Hello there");
  });

  it("turns an up-front rate limit into a 429", async () => {
    const error = new Anthropic.RateLimitError(429, undefined, "rate limited", new Headers());
    const response = await textStreamResponse(fakeStream([], error));
    expect(response.status).toBe(429);
  });
});
