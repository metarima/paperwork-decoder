import type Anthropic from "@anthropic-ai/sdk";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";
import { apiErrorResponse } from "./anthropic";

// Pipes the text deltas of a Claude stream into a plain-text HTTP response.
// We wait for the first event before responding so that failures that happen
// up front (auth, rate limits, bad input) become a proper error status instead
// of a 200 with a broken body.
export async function textStreamResponse(stream: MessageStream) {
  const events = stream[Symbol.asyncIterator]();
  let first: IteratorResult<Anthropic.MessageStreamEvent>;
  try {
    first = await events.next();
  } catch (error) {
    return apiErrorResponse(error);
  }

  const encoder = new TextEncoder();
  const emit = (controller: ReadableStreamDefaultController<Uint8Array>, event: Anthropic.MessageStreamEvent) => {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      controller.enqueue(encoder.encode(event.delta.text));
    }
  };

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done) {
          emit(controller, first.value);
          for (let next = await events.next(); !next.done; next = await events.next()) emit(controller, next.value);
        }
        controller.close();
      } catch (error) {
        console.error("Stream failed:", error);
        controller.enqueue(encoder.encode("\n\n[The response was interrupted. Please try again.]"));
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
