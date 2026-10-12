/** 서버 전용: Claude 해석 생성과 캐시 (API 키와 node:fs 를 사용한다) */
import type { Chart } from "@saju/engine";
import { readingCacheKey, type ReadingCache } from "./cache.js";
import { DEFAULT_MODEL, generateLlmSections, type LlmOptions } from "./llm/generate.js";
import { PROMPT_VERSION } from "./llm/prompt.js";
import { buildBasicSections } from "./rules/basicReading.js";
import { buildFacts } from "./rules/facts.js";
import type { Reading } from "./types.js";

export * from "./index.js";
export { MemoryReadingCache, FileReadingCache, readingCacheKey, type ReadingCache } from "./cache.js";
export { ReadingGenerationError, DEFAULT_MODEL, type LlmOptions } from "./llm/generate.js";

/**
 * Claude로 상세 해석 생성. 캐시에 있으면 API를 호출하지 않는다.
 * 실패하면 예외를 던지므로 호출 측에서 buildRuleReading으로 대체한다.
 */
export async function buildLlmReading(
  chart: Chart,
  opts: { targetYear?: number; cache?: ReadingCache; llm?: LlmOptions } = {},
): Promise<Reading> {
  const targetYear = opts.targetYear ?? new Date().getFullYear();
  const model = opts.llm?.model ?? process.env.SAJU_LLM_MODEL ?? DEFAULT_MODEL;
  const key = readingCacheKey(chart, { targetYear, model, promptVersion: PROMPT_VERSION });

  const cached = await opts.cache?.get(key);
  if (cached) return cached;

  const facts = buildFacts(chart, targetYear);
  const draft = buildBasicSections(facts);
  const { sections, model: servedBy } = await generateLlmSections(chart, facts, draft, { ...opts.llm, model });

  const reading: Reading = {
    sections,
    source: "llm",
    model: servedBy,
    promptVersion: PROMPT_VERSION,
    targetYear,
    createdAt: new Date().toISOString(),
  };
  await opts.cache?.set(key, reading);
  return reading;
}
