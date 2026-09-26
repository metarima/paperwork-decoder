import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";

// Pipes the text deltas of a Claude stream into a plain-text HTTP response.
export function textStreamResponse(stream: MessageStream) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
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
