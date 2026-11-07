import type Anthropic from "@anthropic-ai/sdk";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";
import type { GenerateContentResponse } from "@google/genai";
import { apiErrorResponse } from "./provider";

// Turns an async stream of text chunks into a plain-text HTTP response.
// We wait for the first chunk before responding so that failures that happen
// up front (auth, rate limits, bad input) become a proper error status instead
// of a 200 with a broken body.
async function chunkedTextResponse(open: () => Promise<AsyncIterator<string>>, abort?: () => void) {
  let chunks: AsyncIterator<string>;
  let first: IteratorResult<string>;
  try {
    chunks = await open();
    first = await chunks.next();
  } catch (error) {
    return apiErrorResponse(error);
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (let next = first; !next.done; next = await chunks.next()) {
          if (next.value) controller.enqueue(encoder.encode(next.value));
        }
        controller.close();
      } catch (error) {
        console.error("Stream failed:", error);
        controller.enqueue(encoder.encode("\n\n[The response was interrupted. Please try again.]"));
        controller.close();
      }
    },
    cancel() {
      abort?.();
      void chunks.return?.();
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

// Claude: pipe the text deltas of a MessageStream.
export function textStreamResponse(stream: MessageStream) {
  async function* text() {
    for await (const event of stream as AsyncIterable<Anthropic.MessageStreamEvent>) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield event.delta.text;
    }
  }
  return chunkedTextResponse(async () => text(), () => stream.abort());
}

// Gemini: pipe the text of each streamed chunk.
export function geminiTextStreamResponse(start: () => Promise<AsyncGenerator<GenerateContentResponse>>) {
  return chunkedTextResponse(async () => {
    const stream = await start();
    async function* text() {
      for await (const chunk of stream) yield chunk.text ?? "";
    }
    return text();
  });
}
