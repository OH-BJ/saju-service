import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { Chart } from "@saju/engine";
import type { ChartFacts } from "../rules/facts.js";
import { SECTIONS, type ReadingSection, type SectionKey } from "../types.js";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompt.js";

export const DEFAULT_MODEL = "claude-opus-5-5";

const ReadingSchema = z.object({
  sections: z.object(
    Object.fromEntries(SECTIONS.map((s) => [s.key, z.string().describe(s.title)])) as Record<SectionKey, z.ZodString>,
  ),
});

export interface LlmOptions {
  /** 테스트나 공용 클라이언트 주입용. 없으면 환경변수(ANTHROPIC_API_KEY)로 생성 */
  client?: Anthropic;
  model?: string;
  effort?: "low" | "medium" | "high";
}

export class ReadingGenerationError extends Error {
  constructor(
    message: string,
    readonly reason: "refusal" | "max_tokens" | "parse",
  ) {
    super(message);
    this.name = "ReadingGenerationError";
  }
}

/** 명식과 근거 사실, 룰 초안을 Claude에 보내 섹션별 해석을 받는다. */
export async function generateLlmSections(
  chart: Chart,
  facts: ChartFacts,
  draft: ReadingSection[],
  opts: LlmOptions = {},
): Promise<{ sections: ReadingSection[]; model: string }> {
  const client = opts.client ?? new Anthropic();
  const model = opts.model ?? process.env.SAJU_LLM_MODEL ?? DEFAULT_MODEL;

  const response = await client.beta.messages.parse({
    model,
    max_tokens: 16000,
    // 안전 분류기가 거절하면 서버가 대체 모델로 자동 재시도
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: opts.effort ?? "medium", format: betaZodOutputFormat(ReadingSchema) },
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: buildUserMessage(chart, facts, draft) }],
  });

  if (response.stop_reason === "refusal") {
    throw new ReadingGenerationError(`해석 생성이 거절되었습니다: ${response.stop_details?.category ?? "unknown"}`, "refusal");
  }
  if (response.stop_reason === "max_tokens") {
    throw new ReadingGenerationError("해석이 최대 길이에서 잘렸습니다.", "max_tokens");
  }
  const parsed = response.parsed_output;
  if (!parsed) throw new ReadingGenerationError("해석 응답을 해석할 수 없습니다.", "parse");

  return {
    model: response.model,
    sections: SECTIONS.map((s) => ({ key: s.key, title: s.title, body: parsed.sections[s.key].trim() })),
  };
}
