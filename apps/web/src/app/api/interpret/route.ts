import { buildPrompt, type AiMenu, type AiRequest } from "@saju/reading";
import { streamGemini } from "@/lib/gemini";

const MENUS: AiMenu[] = ["saju", "newyear", "tojung", "gunghap", "today"];

// IP별 간단한 요청 제한 (무료 사용량 보호용, 서버 인스턴스마다 따로 센다)
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

/** 요청 검증: 메뉴가 맞고, 근거 문자열이 적당한 길이인지 */
function parse(body: unknown): AiRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Partial<AiRequest>;
  if (!MENUS.includes(b.menu as AiMenu)) return null;
  const strs = (v: unknown, max: number) =>
    Array.isArray(v) && v.length <= max && v.every((x) => typeof x === "string" && x.length <= 500) ? (v as string[]) : null;
  const facts = strs(b.facts, 14);
  const outline = strs(b.outline, 10);
  if (!facts || !outline || facts.length === 0) return null;
  return { menu: b.menu as AiMenu, facts, outline };
}

/** POST /api/interpret — 계산된 근거로 AI 풀이를 텍스트 스트림으로. 실패 시 { error } */
export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: "no-key" }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return Response.json({ error: "rate-limit" }, { status: 429 });

  const req = parse(await request.json().catch(() => null));
  if (!req) return Response.json({ error: "bad-request" }, { status: 400 });

  try {
    const res = await streamGemini(apiKey, buildPrompt(req), request.signal);
    if (res.ok) return res;
    console.error("[interpret] Gemini 응답 오류", res.status, (await res.text().catch(() => "")).slice(0, 300));
    return Response.json({ error: res.status === 429 ? "quota" : "upstream" }, { status: res.status === 429 ? 429 : 502 });
  } catch (e) {
    console.error("[interpret] Gemini 호출 실패", e);
    return Response.json({ error: "upstream" }, { status: 502 });
  }
}
