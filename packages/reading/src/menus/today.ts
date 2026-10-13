import { dayGanji, monthGanjiOn, unseong12, BRANCHES, type Chart, type Pillar } from "@saju/engine";
import { ELEMENT_LUCK, charElement, luckInfo, luckTone, pick, pillarLabel, josa } from "../common.js";
import { TODAY, TODAY_BRANCH } from "../content/today.js";
import type { Tone } from "../content/types.js";
import { UNSEONG } from "../content/unseong.js";
import type { Chapter, ReadingBase } from "../types.js";
import { relationsWithLuck } from "./newyear.js";

export interface TodayReading extends ReadingBase {
  date: { year: number; month: number; day: number };
  iljin: Pillar;
  wolun: Pillar;
  tone: Tone;
  score: number;
  items: { key: "love" | "wish" | "work" | "money"; label: string; text: string }[];
  tip: string;
  lucky: { color: string; direction: string; number: number };
}

export function buildTodayReading(chart: Chart, date: { year: number; month: number; day: number }): TodayReading {
  const iljin = dayGanji(date.year, date.month, date.day);
  const wolun = monthGanjiOn(date.year, date.month, date.day);
  const info = luckInfo(chart, iljin);
  const rels = relationsWithLuck(chart, iljin);
  const dayBranchRel = rels.find((r) => r.slots.includes("day.branch") && r.slots.includes("luck.branch"));
  const tone = luckTone(chart, iljin, dayBranchRel ? [dayBranchRel] : []);
  const t = TODAY[info.stemSipsin]!;
  const seed = date.year * 372 + date.month * 31 + date.day;
  const us = unseong12(chart.pillars.day.stem, iljin.branch);
  const score = Math.max(30, Math.min(97, 50 + (tone - 3) * 13 + ((seed * 7) % 9) - 4));
  const yong = ELEMENT_LUCK[chart.analysis.yongsin.element];
  const branchLine = TODAY_BRANCH[dayBranchRel?.type ?? "없음"] ?? TODAY_BRANCH["없음"] ?? "";

  const chapters: Chapter[] = [
    {
      key: "why",
      title: "오늘의 일진이 내게 오는 방식",
      body: [
        `오늘은 ${pillarLabel(iljin)}일입니다. 일진의 천간 ${josa(`${iljin.hangul[0]}(${iljin.hanja[0]})`, "은", "는")} 내 일간에게 ${info.stemSipsin}, 지지 ${josa(`${iljin.hangul[1]}(${iljin.hanja[1]})`, "은", "는")} ${info.branchSipsin}입니다.`,
        `내 일간이 오늘 지지 위에서 맞는 12운성은 ${us}${UNSEONG[us] ? `, ${UNSEONG[us]!.image}의 기운입니다. ${UNSEONG[us]!.short}` : "입니다."}`,
        branchLine,
      ].filter(Boolean),
      evidence: [
        { label: `일진 ${iljin.hanja}`, term: "일진" },
        { label: `${info.stemSipsin}·${info.branchSipsin}`, term: info.stemSipsin },
        { label: `12운성 ${us}`, term: "12운성" },
        ...(dayBranchRel ? [{ label: `일지와 ${BRANCHES[iljin.branch]} ${dayBranchRel.type}`, term: dayBranchRel.type.includes("합") ? "합" : dayBranchRel.type === "충" ? "충" : "형·파·해", tone: dayBranchRel.tone === "harmony" ? ("good" as const) : ("caution" as const) }] : []),
      ],
    },
  ];

  return {
    headline: pick(t.headlines, seed),
    subline: `${pillarLabel(iljin)}일 · 이달 ${wolun.hanja}월`,
    chapters,
    factsForAi: [
      `오늘 ${date.year}-${date.month}-${date.day} 일진 ${iljin.hanja}, 월운 ${wolun.hanja}`,
      `원국 일주 ${chart.pillars.day.hanja}, 일진 천간 십신 ${info.stemSipsin}, 지지 십신 ${info.branchSipsin}, 12운성 ${us}`,
      `일지와 관계: ${dayBranchRel?.type ?? "없음"}, 용신 ${chart.analysis.yongsin.role}, 오늘 점수 ${score}`,
    ],
    date,
    iljin,
    wolun,
    tone,
    score,
    items: [
      { key: "love", label: "애정", text: t.love },
      { key: "wish", label: "소망", text: t.wish },
      { key: "work", label: "일", text: t.work },
      { key: "money", label: "금전", text: t.money },
    ],
    tip: t.tip,
    lucky: {
      color: yong.color,
      direction: yong.direction,
      number: yong.numbers[seed % 2]!,
    },
  };
}

/** 오늘 기운의 오행 (부적 카드 색) */
export const iljinElement = (p: Pillar) => charElement("stem", p.stem);
