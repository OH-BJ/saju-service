import { lunarMonthsOfYear, toLunarDate, tojungGwae, type Chart, type TojungGwae } from "@saju/engine";
import { ELEMENT_LUCK, luckTone, pillarLabel } from "../common.js";
import { LUNAR_MONTH_SCENE, TOJUNG_MONTH_TONE } from "../content/tojungMonths.js";
import { TOJUNG } from "../content/tojung.js";
import type { Tone, TojungGwaeText } from "../content/types.js";
import type { Chapter, Panel, ReadingBase } from "../types.js";
import { relationsWithLuck } from "./newyear.js";

export interface TojungReading extends ReadingBase {
  year: number;
  gwae: TojungGwae;
  text: TojungGwaeText;
  months: Panel[];
  lucky: { numbers: [number, number]; color: string; direction: string };
  birthLunar: { year: number; month: number; day: number; leap: boolean };
}

const toneAvg = (a: Tone, b: Tone): Tone => Math.round((a + b) / 2) as Tone;

export function buildTojungReading(chart: Chart, year: number): TojungReading {
  const { solarDate } = chart;
  const birthLunar = toLunarDate(solarDate.year, solarDate.month, solarDate.day);
  const gwae = tojungGwae(birthLunar, year);
  const text = TOJUNG[gwae.code]!;
  const s = gwae.steps;

  const months: Panel[] = lunarMonthsOfYear(year).map((m, i) => {
    const rel = relationsWithLuck(chart, m.pillar).filter((r) => r.slots.includes("day.branch"));
    // 괘의 바탕(올해 전체 톤)과 그 달 월건이 내 사주와 맞는 정도를 섞는다
    const tone = toneAvg(text.tone, luckTone(chart, m.pillar, rel));
    return {
      label: `음${m.month}월`,
      pillar: m.pillar,
      caption: `양력 ${m.solarStart.month}/${m.solarStart.day}부터 · ${m.days === 30 ? "큰달" : "작은달"}`,
      tone,
      text: `${LUNAR_MONTH_SCENE[i]} ${TOJUNG_MONTH_TONE[tone][(i + gwae.code) % 3]}`,
    };
  });

  const lucky = ELEMENT_LUCK[chart.analysis.yongsin.element];
  const chapters: Chapter[] = [
    {
      key: "summary",
      title: `${year}년의 괘 — ${text.title}`,
      body: [text.summary, `상반기: ${text.firstHalf}`, `하반기: ${text.secondHalf}`],
      evidence: text.keywords.map((k) => ({ label: k })),
    },
    {
      key: "how",
      title: "괘는 이렇게 지었습니다",
      body: [
        `상괘 ${gwae.upper}: 세는나이 ${s.age} + 태세수 ${s.taese.num}(${pillarLabel(s.taese.pillar)}) = ${s.age + s.taese.num}, 8로 나눈 나머지.`,
        `중괘 ${gwae.middle}: 음력 ${birthLunar.month}월의 날수 ${s.monthDays} + 월건수 ${s.wolgeon.num}(${pillarLabel(s.wolgeon.pillar)}) = ${s.monthDays + s.wolgeon.num}, 6으로 나눈 나머지.`,
        `하괘 ${gwae.lower}: 음력 생일 ${s.birthDay} + 일진수 ${s.iljin.num}(${pillarLabel(s.iljin.pillar)}) = ${s.birthDay + s.iljin.num}, 3으로 나눈 나머지.`,
        `나머지가 0이면 각각 8·6·3으로 봅니다. 태세수·월건수·일진수는 전통 조견표의 값을 썼습니다.${birthLunar.leap ? " 윤달에 태어나 평달로 계산했습니다." : ""}`,
      ],
      evidence: [{ label: `음력 생일 ${birthLunar.month}/${birthLunar.day}${birthLunar.leap ? " 윤" : ""}` }, { label: `괘 ${gwae.code}`, term: "토정비결" }],
    },
    {
      key: "advice",
      title: "올해 지킬 한 가지",
      body: [text.advice, `행운의 숫자 ${lucky.numbers.join("·")}, 색은 ${lucky.color}, 방향은 ${lucky.direction}입니다. 사주에 반가운 오행(${chart.analysis.yongsin.role})에서 골랐습니다.`],
      evidence: [{ label: "용신", term: "용신", tone: "good" }],
    },
  ];

  return {
    headline: `${gwae.code} · ${text.title}`,
    subline: text.firstHalf,
    chapters,
    factsForAi: [
      `토정비결 ${year}년 괘 ${gwae.code} (상${gwae.upper} 중${gwae.middle} 하${gwae.lower}) 제목 ${text.title}, 기조 ${text.tone}/5`,
      `괘 요지: ${text.summary}`,
      `음력 월별 톤: ${months.map((m) => `${m.label} ${m.tone}`).join(", ")}`,
      `원국 일주 ${chart.pillars.day.hanja}, 용신 ${chart.analysis.yongsin.role}`,
    ],
    year,
    gwae,
    text,
    months,
    lucky,
    birthLunar,
  };
}
