import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let fullResponse = ""; // This will accumulate the concatenated text

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: message },
          ],
        //   max_tokens: 300,
          stream: true,
        });

        for await (const chunk of completion) {
          try {
            const content = chunk.choices[0].delta?.content || "";

            fullResponse += content; // Accumulate the full response

            // Construct the JSON data with the concatenated response
            const sseData = JSON.stringify({
              message: {
                content: { parts: [fullResponse] },
              },
            });

            // Send the data back in SSE format
            controller.enqueue(encoder.encode(`data: ${sseData}\n\n`));

            // Close the stream if the response is fully complete
            if (chunk.choices[0].finish_reason === "stop") {
              controller.close();
              break;
            }
          } catch (err) {
            console.error("Error processing chunk", err);
            controller.error(err);
            controller.close();
            break;
          }
        }
        controller.close();
      } catch (err) {
        console.error("Error in OpenAI stream", err);
        controller.error(err);
        controller.close();
      }
    },
  });

  return new NextResponse(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
