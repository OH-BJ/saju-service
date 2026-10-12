import type { Chart } from "@saju/engine";
import { SIPSIN_GROUP } from "../rules/sipsin.js";
import { OHAENG } from "../rules/ohaeng.js";
import type { ChartFacts } from "../rules/facts.js";
import { SECTIONS, type ReadingSection } from "../types.js";

/** 프롬프트를 바꾸면 올린다 — 캐시 키에 포함되어 이전 해석이 재사용되지 않는다. */
export const PROMPT_VERSION = "2026-10-12.2";

/**
 * 시스템 프롬프트. 요청마다 바뀌는 값(날짜, 사용자 정보)을 넣지 않아야 프롬프트 캐시가 유지된다.
 */
export const SYSTEM_PROMPT = `당신은 사주명리 해석을 쓰는 작가입니다. 사용자에게 제공된 사주 명식과 분석 사실을 바탕으로, 한 사람에게 들려주듯 따뜻하고 구체적인 한국어 해석을 씁니다.

# 근거
- 해석은 사용자 메시지의 <chart>, <facts>, <draft>에 있는 내용만 근거로 삼습니다. 명식·십신·오행·대운·세운을 새로 계산하거나 바꾸지 마세요. 사실과 어긋나는 내용을 쓰지 마세요.
- <draft>는 룰 기반으로 만든 초안입니다. 방향은 따르되 문장은 새로 쓰고, 여러 사실을 엮어 그 사람만의 이야기로 풀어 주세요. 초안 문장을 그대로 옮기지 마세요.
- 근거가 약한 부분은 단정하지 말고 "~한 경향이 있습니다", "~하기 쉽습니다"처럼 가능성으로 표현합니다.

# 금지
- 질병·사고·사망·이혼 등을 단정하거나 겁을 주는 예언을 하지 않습니다. 건강은 생활 관리 관점으로만 쓰고 진단처럼 쓰지 않습니다.
- 특정 투자 상품·종목·시점을 권하거나 수익을 장담하지 않습니다.
- 부적·굿·유료 상담 등을 권하지 않습니다.

# 문체
- 존댓말(~습니다/~요)을 쓰고, 독자를 "당신"으로 부릅니다.
- 명리 용어(일간, 십신, 대운 등)를 쓸 때는 한 번은 쉬운 말로 풀어 줍니다.
- 각 섹션은 2~4개 문단, 섹션당 350~700자 정도로 씁니다. 문단은 빈 줄로 구분하고 마크다운 기호(#, *, -)는 쓰지 않습니다.
- 좋은 점과 주의할 점을 함께 쓰되, 마지막은 실천할 수 있는 조언으로 마무리합니다.

# 섹션
${SECTIONS.map((s) => `- ${s.key}: ${s.title}`).join("\n")}
초년운은 대략 20세 이전, 중년운은 20~49세, 말년운은 50세 이후의 대운을 근거로 씁니다. 올해의 운세는 세운과 현재 대운을 함께 봅니다.`;

/** 요청마다 바뀌는 사용자 메시지 */
export function buildUserMessage(chart: Chart, facts: ChartFacts, draft: ReadingSection[]): string {
  const p = chart.pillars;
  const chartInfo = {
    성별: chart.input.gender === "male" ? "남" : "여",
    양력생일: `${chart.solarDate.year}-${chart.solarDate.month}-${chart.solarDate.day}`,
    시간: p.hour ? "앎" : "모름(시주 없이 6글자로 해석)",
    사주: {
      년주: p.year.hanja,
      월주: p.month.hanja,
      일주: p.day.hanja,
      시주: p.hour?.hanja ?? null,
    },
    십신: chart.analysis.sipsin,
    "12운성": chart.analysis.unseong12,
    오행개수: Object.fromEntries(OHAENG.map((o, i) => [o.name, chart.analysis.ohaeng[i]])),
    대운: { 방향: chart.daeun.forward ? "순행" : "역행", 목록: chart.daeun.list.map((d) => `${Math.floor(d.age)}세 ${d.pillar.hanja}`) },
  };
  const factInfo = {
    일간: `${facts.dayMaster.hanja}(${facts.dayMaster.elementName}) — ${facts.dayMaster.rule.image}`,
    일주: `${facts.ilju.hanja} — ${facts.ilju.rule.image}`,
    일간세력: facts.strength,
    두드러진십신: facts.dominant.map((g) => `${g}: ${SIPSIN_GROUP[g].meaning}`),
    없는십신: facts.missing,
    많은오행: facts.ohaeng.strong.map((i) => OHAENG[i]!.name),
    없는오행: facts.ohaeng.lacking.map((i) => OHAENG[i]!.name),
    현재대운: facts.currentDaeun,
    세운: facts.seun,
  };
  const draftText = draft.map((s) => `## ${s.key} (${s.title})\n${s.body}`).join("\n\n");

  return `<chart>\n${JSON.stringify(chartInfo, null, 2)}\n</chart>\n\n<facts>\n${JSON.stringify(factInfo, null, 2)}\n</facts>\n\n<draft>\n${draftText}\n</draft>\n\n위 내용을 근거로 모든 섹션의 해석을 작성해 주세요.`;
}
