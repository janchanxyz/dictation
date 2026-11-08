import { createAudioStream, getVoices, DEFAULT_VOICE } from "./lib/tts";
import {
  CORS_HEADERS,
  errorResponse,
  json,
  noContent,
  withCors,
} from "./lib/http";

export interface Env {
  ASSETS: Fetcher;
}

function isJsonContentType(value: string) {
  const mediaType = value.split(";")[0]?.trim().toLowerCase();
  return mediaType === "application/json";
}

function parseTtsBody(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("request body must be an object");
  }

  const { text, voice, rate } = body as {
    text?: unknown;
    voice?: unknown;
    rate?: unknown;
  };

  if (typeof text !== "string" || text.trim().length === 0) {
    throw new Error("text is required");
  }

  if (voice !== undefined) {
    if (typeof voice !== "string") {
      throw new Error("voice must be a string");
    }
    if (voice.trim().length === 0) {
      throw new Error("voice must be a non-empty string");
    }
  }

  let parsedRate: number | undefined;
  if (rate !== undefined) {
    const n = typeof rate === "number" ? rate : Number(rate);
    if (!Number.isFinite(n)) {
      throw new Error("rate must be a number");
    }
    parsedRate = Math.min(1.5, Math.max(0.5, n));
  }

  return {
    text: text.trim(),
    voice: typeof voice === "string" ? voice.trim() : undefined,
    rate: parsedRate,
  };
}

async function primeAudioStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const firstChunk = await reader.read();
  let firstChunkConsumed = false;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        if (!firstChunkConsumed) {
          firstChunkConsumed = true;
          if (firstChunk.done) {
            controller.close();
            return;
          }
          controller.enqueue(firstChunk.value);
          return;
        }

        const chunk = await reader.read();
        if (chunk.done) {
          controller.close();
          return;
        }
        controller.enqueue(chunk.value);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel(reason) {
      await reader.cancel(reason);
    },
  });
}

async function handleTts(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!isJsonContentType(contentType)) {
    return errorResponse(
      400,
      "INVALID_CONTENT_TYPE",
      "content-type must be application/json"
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      400,
      "INVALID_REQUEST",
      "request body must be valid json"
    );
  }

  let parsed: ReturnType<typeof parseTtsBody>;
  try {
    parsed = parseTtsBody(body);
  } catch (error) {
    return errorResponse(
      400,
      "INVALID_REQUEST",
      error instanceof Error ? error.message : "invalid request"
    );
  }

  try {
    const stream = await createAudioStream({
      text: parsed.text,
      voice: parsed.voice ?? DEFAULT_VOICE,
      rate: parsed.rate ?? 1,
    });
    const primedStream = await primeAudioStream(stream);
    return new Response(primedStream, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("tts synthesis failed", error);
    return errorResponse(
      502,
      "TTS_UPSTREAM_ERROR",
      "failed to synthesize audio"
    );
  }
}

async function handleVoices() {
  try {
    const voices = await getVoices();
    const simplified = voices
      .map((v) => ({
        ShortName: v.ShortName,
        Locale: v.Locale,
        Gender: v.Gender,
        FriendlyName: v.FriendlyName || v.ShortName,
      }))
      .sort((a, b) => a.Locale.localeCompare(b.Locale) || a.ShortName.localeCompare(b.ShortName));
    return json({ voices: simplified, defaultVoice: DEFAULT_VOICE });
  } catch (error) {
    console.error("voice list fetch failed", error);
    return errorResponse(502, "TTS_UPSTREAM_ERROR", "failed to fetch voices");
  }
}

async function routeApi(request: Request): Promise<Response | null> {
  const { pathname } = new URL(request.url);

  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    return noContent();
  }

  if (pathname === "/api/voices") {
    if (request.method !== "GET") {
      return errorResponse(405, "METHOD_NOT_ALLOWED", "method not allowed");
    }
    return handleVoices();
  }

  if (pathname === "/api/tts") {
    if (request.method !== "POST") {
      return errorResponse(405, "METHOD_NOT_ALLOWED", "method not allowed");
    }
    return handleTts(request);
  }

  if (pathname === "/api/health") {
    return json({ ok: true, service: "dictation" });
  }

  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const apiResponse = await routeApi(request);
      if (apiResponse) {
        return withCors(apiResponse);
      }
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error("unexpected error", error);
      return errorResponse(500, "INTERNAL_ERROR", "unexpected internal error");
    }
  },
} satisfies ExportedHandler<Env>;
