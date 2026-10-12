/**
 * 브라우저에서도 동작하는 부분 (룰 기반 해석).
 * Claude 호출·파일 캐시는 서버 전용 진입점 "@saju/interpretation/server" 에 있다.
 */
import type { Chart } from "@saju/engine";
import { PROMPT_VERSION } from "./llm/prompt.js";
import { buildBasicSections } from "./rules/basicReading.js";
import { buildFacts } from "./rules/facts.js";
import type { Reading } from "./types.js";

export * from "./types.js";
export { buildFacts, type ChartFacts } from "./rules/facts.js";
export { PROMPT_VERSION } from "./llm/prompt.js";

/** 룰 기반 해석 — API 호출 없이 즉시 생성 (무료 영역, LLM 실패 시 대체용) */
export function buildRuleReading(chart: Chart, opts: { targetYear?: number } = {}): Reading {
  const targetYear = opts.targetYear ?? new Date().getFullYear();
  return {
    sections: buildBasicSections(buildFacts(chart, targetYear)),
    source: "rules",
    promptVersion: PROMPT_VERSION,
    targetYear,
    createdAt: new Date().toISOString(),
  };
}
