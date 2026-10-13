// 서버 전용: Gemini REST API 스트리밍 (타로 프로젝트와 같은 방식, SDK 없이 fetch)
import { SYSTEM_PROMPT } from "@saju/reading";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/** Gemini SSE 응답을 순수 텍스트 스트림으로 바꿔 돌려준다 */
export async function streamGemini(apiKey: string, prompt: string, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 1500,
        thinkingConfig: { thinkingBudget: 0 }, // 빠른 응답 + 무료 사용량 절약
      },
    }),
  });
  if (!res.ok || !res.body) return res;

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = res.body.getReader();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const ev of events) {
        const data = ev
          .split(/\r?\n/)
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trim())
          .join("");
        if (!data) continue;
        try {
          const json = JSON.parse(data) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
          const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        } catch {
          /* 잘린 조각은 무시 */
        }
      }
    },
    cancel() {
      void reader.cancel();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
