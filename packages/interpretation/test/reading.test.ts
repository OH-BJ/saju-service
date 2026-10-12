import type Anthropic from "@anthropic-ai/sdk";
import { computeChart } from "@saju/engine";
import { describe, expect, it, vi } from "vitest";
import {
  MemoryReadingCache,
  ReadingGenerationError,
  SECTIONS,
  buildFacts,
  buildLlmReading,
  buildRuleReading,
} from "../src/server.js";
import { SYSTEM_PROMPT } from "../src/llm/prompt.js";
import { ILJU } from "../src/rules/ilju.js";
import { pillarFromIndexForTest } from "./helpers.js";

const chart = computeChart({ year: 1990, month: 1, day: 1, hour: 12, calendar: "solar", gender: "male" });

/** client.beta.messages.parse 만 흉내 내는 목 클라이언트 */
function mockClient(response: Record<string, unknown>) {
  const parse = vi.fn().mockResolvedValue(response);
  return { client: { beta: { messages: { parse } } } as unknown as Anthropic, parse };
}

const okResponse = {
  model: "claude-opus-5-5",
  stop_reason: "end_turn",
  stop_details: null,
  parsed_output: { sections: Object.fromEntries(SECTIONS.map((s) => [s.key, ` ${s.title} 해석 본문 `])) },
};

describe("근거 사실", () => {
  it("1990-01-01 12시 남: 丙火 일간, 火 과다·金 없음", () => {
    const f = buildFacts(chart, 2026);
    expect(f.dayMaster.hanja).toBe("丙");
    expect(f.ohaeng.strong).toContain(1); // 火
    expect(f.ohaeng.lacking).toContain(3); // 金
    expect(f.seun.hanja).toBe("丙午"); // 2026년
    expect(f.ageInTargetYear).toBe(36);
  });
});

describe("일주 60개", () => {
  it("60갑자 전부에 해석이 있다", () => {
    const keys = Array.from({ length: 60 }, (_, i) => pillarFromIndexForTest(i));
    expect(Object.keys(ILJU).sort()).toEqual([...keys].sort());
  });
});

describe("룰 기반 해석", () => {
  it("11개 섹션을 모두 채운다", () => {
    const r = buildRuleReading(chart, { targetYear: 2026 });
    expect(r.source).toBe("rules");
    expect(r.sections.map((s) => s.key)).toEqual(SECTIONS.map((s) => s.key));
    for (const s of r.sections) expect(s.body.length).toBeGreaterThan(20);
  });
  it("같은 입력이면 같은 결과", () => {
    const a = buildRuleReading(chart, { targetYear: 2026 }).sections;
    const b = buildRuleReading(chart, { targetYear: 2026 }).sections;
    expect(a).toEqual(b);
  });
  it("시간을 몰라도 생성된다", () => {
    const noHour = computeChart({ year: 1990, month: 1, day: 1, calendar: "solar", gender: "female" });
    expect(buildRuleReading(noHour, { targetYear: 2026 }).sections).toHaveLength(SECTIONS.length);
  });
});

describe("LLM 해석", () => {
  it("요청 형식: 기본 모델, 구조화 출력, 거절 대체 모델, 캐시 가능한 시스템 프롬프트", async () => {
    const { client, parse } = mockClient(okResponse);
    const r = await buildLlmReading(chart, { targetYear: 2026, llm: { client } });

    const params = parse.mock.calls[0]![0];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.fallbacks).toBe("default");
    expect(params.betas).toContain("server-side-fallback-2026-07-01");
    expect(params.output_config.format).toBeDefined();
    expect(params.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(params.messages[0].content).toContain("丙寅"); // 일주가 근거로 들어감

    expect(r.source).toBe("llm");
    expect(r.sections[0]!.body).toBe("총평 해석 본문");
  });

  it("캐시에 있으면 API를 다시 부르지 않는다", async () => {
    const { client, parse } = mockClient(okResponse);
    const cache = new MemoryReadingCache();
    await buildLlmReading(chart, { targetYear: 2026, cache, llm: { client } });
    await buildLlmReading(chart, { targetYear: 2026, cache, llm: { client } });
    expect(parse).toHaveBeenCalledTimes(1);
  });

  it("거절되면 ReadingGenerationError", async () => {
    const { client } = mockClient({ ...okResponse, stop_reason: "refusal", stop_details: { category: "other" }, parsed_output: null });
    await expect(buildLlmReading(chart, { targetYear: 2026, llm: { client } })).rejects.toBeInstanceOf(ReadingGenerationError);
  });

  it("시스템 프롬프트에 요청마다 바뀌는 값이 없다 (캐시 유지)", () => {
    expect(SYSTEM_PROMPT).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
