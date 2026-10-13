import type { ReadingBase } from "./types.js";

export type AiMenu = "saju" | "newyear" | "tojung" | "gunghap" | "today";

/** 브라우저 → 서버로 보내는 AI 해석 요청. 이름·생년월일은 담지 않고 계산된 근거만 보낸다 */
export interface AiRequest {
  menu: AiMenu;
  facts: string[];
  /** 룰 해석 요약 (장 제목 + 첫 문단) */
  outline: string[];
}

const FOCUS: Record<AiMenu, string> = {
  saju: "타고난 기질, 힘의 균형과 필요한 기운, 일·재물·관계에서 그 기질이 드러나는 방식, 지금 대운에서의 조언",
  newyear: "올해의 큰 흐름, 원국과 세운이 만나는 지점(합·충), 분야별로 기회와 조심할 점, 좋은 달과 쉬어 갈 달",
  tojung: "올해 괘의 비유를 살려 한 해의 이야기, 상반기와 하반기, 달마다의 리듬, 올해 지킬 한 가지",
  gunghap: "두 사람의 기운이 만나는 방식, 끌리는 점과 부딪히는 점, 서로를 편하게 하는 구체적인 말과 행동",
  today: "오늘 하루의 결, 일·관계·마음가짐에서 오늘 기운을 쓰는 법, 오늘 해 볼 작은 행동",
};

export const SYSTEM_PROMPT = `당신은 한지 위에 먹으로 사주를 풀어 주는 차분하고 다정한 명리 해설가입니다. 계산은 이미 끝났고, 주어진 근거만으로 한국어 풀이를 씁니다.

규칙:
- 존댓말(~입니다/~습니다)로, 담백하고 따뜻하게. 상대를 부를 때는 '당신'이라고 합니다(궁합은 '두 분'). 과장·공포·확정적 예언은 하지 않습니다.
- 5~6개의 문단, 전체 700~1100자. 마크다운 기호(#, *, -, 목록, 굵게)를 쓰지 말고 문단만 씁니다.
- 첫 문단은 핵심을 한 문장의 비유로 시작합니다.
- 근거에 있는 간지·십신·합충·용신만 문장 속에서 짚습니다. 근거에 없는 간지 글자, 신살, 합충, 십신을 새로 만들거나 계산하지 않습니다. 확실하지 않으면 간지 대신 쉬운 말로만 씁니다.
- 한자는 근거에 나온 글자 그대로만 쓰고, 한자 뒤에 괄호로 독음을 붙이지 않습니다.
- 어려운 용어는 쉬운 말로 풀어 씁니다.
- 마지막 문단은 오늘 또는 이번 주에 해 볼 수 있는 구체적이고 작은 행동 하나를 제안합니다.
- 건강·법률·투자에 대해 단정하거나 전문가 판단을 대신하는 말은 하지 않습니다.`;

export function buildPrompt(req: AiRequest): string {
  return [
    `풀이 종류: ${req.menu} — 중점: ${FOCUS[req.menu]}`,
    "",
    "계산된 근거:",
    ...req.facts.map((f) => `- ${f}`),
    "",
    "기본 풀이 요약 (참고만, 그대로 반복하지 말 것):",
    ...req.outline.map((o) => `- ${o}`),
    "",
    "위 근거로 이 사람만을 위한 풀이를 들려주세요.",
  ].join("\n");
}

/** 룰 해석에서 AI 요청을 만든다 */
export function toAiRequest(menu: AiMenu, r: ReadingBase): AiRequest {
  return {
    menu,
    facts: r.factsForAi.slice(0, 12).map((f) => f.slice(0, 400)),
    outline: r.chapters.slice(0, 8).map((c) => `${c.title}: ${(c.body[0] ?? "").slice(0, 160)}`),
  };
}
