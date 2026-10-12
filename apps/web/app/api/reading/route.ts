import path from "node:path";
import { computeChart, type BirthInput } from "@saju/engine";
import { FileReadingCache, buildLlmReading } from "@saju/interpretation/server";

/*
 * Claude 해석 API (서버 전용).
 * GitHub Pages 정적 빌드에서는 pageExtensions 설정으로 이 파일이 제외된다 (next.config.ts 참고).
 */

// 개발용 파일 캐시. 운영에서는 DB 캐시로 교체
const cache = new FileReadingCache(path.join(process.cwd(), ".cache", "readings"));

function toInput(body: unknown): BirthInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === "number" && Number.isInteger(v) ? v : undefined);
  const year = num(b.year);
  const month = num(b.month);
  const day = num(b.day);
  if (!year || !month || !day) return null;
  if (!["solar", "lunar", "lunar-leap"].includes(String(b.calendar))) return null;
  if (!["male", "female"].includes(String(b.gender))) return null;
  const hour = num(b.hour);
  return {
    year,
    month,
    day,
    calendar: b.calendar as BirthInput["calendar"],
    gender: b.gender as BirthInput["gender"],
    ...(hour !== undefined && hour >= 0 && hour < 24 ? { hour, minute: num(b.minute) ?? 0 } : {}),
  };
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "AI 해석이 설정되지 않았습니다." }, { status: 503 });
  }
  const input = toInput(await request.json().catch(() => null));
  if (!input) return Response.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });

  try {
    const chart = computeChart(input);
    const reading = await buildLlmReading(chart, { cache });
    return Response.json(reading);
  } catch (e) {
    console.error("AI 해석 생성 실패:", e);
    return Response.json({ error: "해석을 생성하지 못했습니다." }, { status: 502 });
  }
}
