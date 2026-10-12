import { SECTIONS, type ReadingSection, type SectionKey } from "../types.js";
import type { ChartFacts, LuckFact } from "./facts.js";
import { OHAENG } from "./ohaeng.js";
import { SIPSIN_GROUP, type SipsinGroup } from "./sipsin.js";

const STRENGTH_TEXT = {
  강: "일간의 힘이 강한 편이라 스스로 밀고 나가는 힘이 좋습니다. 에너지를 밖으로 쓰는 활동(표현·재물·직무)에서 균형을 찾으면 좋습니다.",
  중: "일간의 힘이 비교적 균형 잡혀 있어 상황에 따라 주도하기도, 협력하기도 하는 유연함이 있습니다.",
  약: "일간의 힘이 약한 편이라 혼자 짊어지기보다 배움과 사람의 도움을 받을 때 능력이 잘 발휘됩니다.",
} as const;

const joinGroups = (gs: SipsinGroup[]) => gs.join("·");
/** "~시기입니다. ..." 에서 첫 문장만 소문자 연결용으로 */
const firstSentence = (t: string) => t.split(". ")[0]!.replace(/시기입니다$/, "시기가 됩니다") + ".";

function describePeriod(label: string, luck: LuckFact[]): string {
  if (luck.length === 0) return `${label}에 해당하는 대운 정보가 없습니다.`;
  const lines = luck.map((d) => {
    const [first, second] = d.groups;
    const head = `${Math.floor(d.age)}세부터 ${d.hanja}(${d.hangul}) 대운입니다. 앞 5년은 천간 ${d.stemSipsin}, 뒤 5년은 지지 ${d.branchSipsin}의 영향이 큽니다.`;
    const tail = second ? ` 후반에는 ${second}의 흐름으로 바뀌어 ${firstSentence(SIPSIN_GROUP[second].asLuck)}` : "";
    return `${head} ${SIPSIN_GROUP[first!].asLuck}${tail}`;
  });
  return lines.join("\n\n");
}

/** 근거 사실만으로 섹션별 기본 해석을 만든다 (LLM 없이, 같은 입력엔 항상 같은 결과). */
export function buildBasicSections(f: ChartFacts): ReadingSection[] {
  const dm = f.dayMaster.rule;
  const top = f.dominant[0];
  const strongEl = f.ohaeng.strong.map((i) => OHAENG[i]!);
  const lackEl = f.ohaeng.lacking.map((i) => OHAENG[i]!);

  const body: Record<SectionKey, string> = {
    summary: [
      `${f.dayMaster.hanja}(${f.dayMaster.elementName}) 일간으로, ${dm.image}에 비유되는 사주입니다. ${dm.nature}`,
      `태어난 날의 기둥인 일주는 ${f.ilju.hanja}(${f.ilju.hangul})로, ${f.ilju.rule.image}의 모습입니다. ${f.ilju.rule.text}`,
      top
        ? `원국에서는 ${top}(${SIPSIN_GROUP[top].meaning})의 기운이 두드러집니다. ${SIPSIN_GROUP[top].strong}`
        : "원국의 십신이 고르게 분포해 어느 한쪽으로 치우치지 않은 편입니다.",
      STRENGTH_TEXT[f.strength],
    ].join("\n\n"),

    personality: [
      `핵심 키워드는 ${dm.keywords.join(", ")}입니다. ${dm.strengths}`,
      dm.cautions,
      ...strongEl.map((o) => `${o.name} 기운이 많아 ${o.excess}`),
      ...lackEl.map((o) => `${o.name} 기운이 없어 ${o.lack}`),
    ].join("\n\n"),

    early: describePeriod("초년", f.periods.early),
    middle: describePeriod("중년", f.periods.middle),
    late: describePeriod("말년", f.periods.late),

    wealth: [
      f.groups.재성 > 0 ? SIPSIN_GROUP.재성.money : "",
      f.groups.재성 === 0
        ? SIPSIN_GROUP.재성.weak
        : f.groups.재성 >= 3
          ? SIPSIN_GROUP.재성.strong
          : "재성이 적당히 있어 벌고 지키는 균형을 잡기 좋은 구조입니다.",
      top && top !== "재성" ? SIPSIN_GROUP[top].money : "",
    ]
      .filter(Boolean)
      .join("\n\n"),

    love: [
      top ? SIPSIN_GROUP[top].love : SIPSIN_GROUP.재성.love,
      f.missing.length > 0
        ? `원국에 ${joinGroups(f.missing)} 기운이 없어, 이 기운이 운에서 들어오는 시기에 인연과 관계의 변화가 생기기 쉽습니다.`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n"),

    career: [
      top ? `잘 맞는 분야: ${SIPSIN_GROUP[top].career}` : "",
      f.groups.관성 >= 2 ? SIPSIN_GROUP.관성.strong : f.groups.식상 >= 2 ? SIPSIN_GROUP.식상.strong : dm.strengths,
    ]
      .filter(Boolean)
      .join("\n\n"),

    health: [
      ...strongEl.map((o) => `${o.name} 기운이 많은 편이니 ${o.care}`),
      ...lackEl.map((o) => `${o.name} 기운을 보완하는 데는 ${o.boost} 같은 생활 요소가 도움이 됩니다. ${o.care}`),
      strongEl.length + lackEl.length === 0 ? "오행이 고르게 분포한 편이라 규칙적인 생활만 지켜도 균형을 유지하기 좋습니다." : "",
      "건강 관련 내용은 생활 습관 참고용이며, 증상이 있다면 전문의와 상담하세요.",
    ]
      .filter(Boolean)
      .join("\n\n"),

    daeun: [
      `대운은 ${f.periods.early[0] ? Math.floor(f.periods.early[0].age) : "-"}세 무렵부터 10년 단위로 바뀝니다.`,
      f.currentDaeun
        ? `현재(${f.seun.year}년, 약 ${f.ageInTargetYear}세)는 ${f.currentDaeun.hanja}(${f.currentDaeun.hangul}) 대운으로 ${joinGroups(f.currentDaeun.groups)}의 시기입니다. ${SIPSIN_GROUP[f.currentDaeun.groups[0]!].asLuck}`
        : "아직 첫 대운이 시작되기 전입니다.",
    ].join("\n\n"),

    year: [
      `${f.seun.year}년은 ${f.seun.hanja}(${f.seun.hangul})년으로, 천간은 ${f.seun.stemSipsin}, 지지는 ${f.seun.branchSipsin}에 해당합니다.`,
      SIPSIN_GROUP[f.seun.groups[0]!].asLuck,
    ].join("\n\n"),
  };

  return SECTIONS.map((s) => ({ key: s.key, title: s.title, body: body[s.key] }));
}
