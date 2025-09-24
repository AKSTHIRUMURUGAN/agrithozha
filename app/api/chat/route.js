import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";

function createSSEStream() {
  const encoder = new TextEncoder();
  let controller;

  const readable = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  const send = async (event, data) => {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(encoder.encode(payload));
  };

  const close = () => controller.close();

  return { readable, send, close };
}

export async function POST(req) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: "Missing GEMINI_API_KEY" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const { message, language, system } = await req.json();
    if (!message || typeof message !== "string") {
      return new NextResponse(
        JSON.stringify({ error: "'message' is required" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    const systemPrefix = system ? `${system}\n\n` : "";
    const languageHint = language
      ? `Please respond in ${language} and write at least 2 complete sentences.`
      : `Please write at least 2 complete sentences.`;
    const fullPrompt = `${systemPrefix}${message}\n\n${languageHint}`.trim();

    const { readable, send, close } = createSSEStream();

    // Fire and stream
    (async () => {
      try {
        const result = await model.generateContentStream(fullPrompt);
        for await (const chunk of result.stream) {
          const text = chunk?.text();
          if (text) {
            await send("token", { text });
          }
        }
        const finalResponse = await result.response;
        const finalText = typeof finalResponse?.text === "function" ? finalResponse.text() : "";
        await send("done", { text: finalText || "" });
      } catch (e) {
        await send("error", { message: e?.message || "Generation error" });
      } finally {
        close();
      }
    })();

    return new NextResponse(readable, {
      status: 200,
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "x-accel-buffering": "no",
      },
    });
  } catch (err) {
    return new NextResponse(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}


