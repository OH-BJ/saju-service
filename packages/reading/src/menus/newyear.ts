import { chartSlots, findRelations, monthsOfYear, yearGanji, BRANCHES, STEMS, type Chart, type Pillar, type Relation, type Slot } from "@saju/engine";
import { SLOT_NAME, groupOf, luckInfo, luckTone, pillarLabel, toneKey, josa } from "../common.js";
import { MONTH_BRANCH, PERIOD } from "../content/period.js";
import { RELATIONS } from "../content/relations.js";
import { SIPSIN_GROUP, type SipsinGroup } from "../content/sipsin.js";
import type { Tone } from "../content/types.js";
import type { Chapter, Panel, ReadingBase } from "../types.js";

export interface FieldScore {
  key: "money" | "love" | "work" | "health" | "study";
  label: string;
  score: number;
  note: string;
}

export interface NewyearReading extends ReadingBase {
  year: number;
  seun: Pillar;
  tone: Tone;
  fields: FieldScore[];
  months: Panel[];
}

/** 원국과 운 기둥 사이의 관계 (운 쪽 슬롯 id는 "luck.stem" 등) */
export function relationsWithLuck(chart: Chart, p: Pillar): Relation[] {
  const luck: Slot[] = [
    { id: "luck.stem", kind: "stem", value: p.stem },
    { id: "luck.branch", kind: "branch", value: p.branch },
  ];
  return findRelations([...chartSlots(chart.pillars), ...luck], (a, b) => a.id.startsWith("luck") !== b.id.startsWith("luck"));
}

const describeRel = (r: Relation) => {
  const natal = r.slots.filter((s) => !s.startsWith("luck")).map((s) => SLOT_NAME[s] ?? s);
  const chars = r.values.map((v, i) => (r.slots[i]!.endsWith("stem") ? STEMS[v] : BRANCHES[v])).join("");
  return `${josa(natal.join("·"), "과", "와")} ${chars} ${r.type}`;
};

const clamp = (n: number) => Math.max(35, Math.min(95, Math.round(n)));

export function buildNewyearReading(chart: Chart, year: number): NewyearReading {
  const seun = yearGanji(year);
  const info = luckInfo(chart, seun);
  const rels = relationsWithLuck(chart, seun);
  const dayRels = rels.filter((r) => r.slots.includes("day.branch") || r.slots.includes("day.stem"));
  const tone = luckTone(chart, seun, dayRels);
  const tk = toneKey(tone);
  const g = info.groups;
  const has = (x: SipsinGroup) => g.includes(x);
  const base = 55 + (tone - 3) * 8;
  const dayHarmony = dayRels.some((r) => r.tone === "harmony");
  const dayClash = dayRels.some((r) => r.tone === "clash");

  const fields: FieldScore[] = [
    { key: "money", label: "재물", score: clamp(base + (has("재성") ? 14 : 0) + (has("식상") ? 6 : 0) - (has("비겁") ? 8 : 0)), note: has("재성") ? "재물의 별이 들어오는 해" : has("비겁") ? "나가는 돈을 살필 해" : "꾸준함이 쌓이는 해" },
    {
      key: "love",
      label: "애정",
      score: clamp(base + (dayHarmony ? 12 : 0) - (dayClash ? 10 : 0) + (has(chart.input.gender === "male" ? "재성" : "관성") ? 10 : 0)),
      note: dayHarmony ? "배우자 자리가 합을 이루는 해" : dayClash ? "배우자 자리가 흔들리는 해" : "관계를 다지는 해",
    },
    { key: "work", label: "일", score: clamp(base + (has("관성") ? 14 : 0) + (has("식상") ? 5 : 0)), note: has("관성") ? "책임과 자리가 커지는 해" : has("식상") ? "실력을 보여 주는 해" : "기반을 다지는 해" },
    { key: "health", label: "건강", score: clamp(base + 5 - (dayClash ? 10 : 0) - (rels.some((r) => r.type === "충") ? 5 : 0)), note: dayClash ? "몸의 리듬을 살필 해" : "무난하게 지나는 해" },
    { key: "study", label: "배움·문서", score: clamp(base + (has("인성") ? 15 : 0)), note: has("인성") ? "공부·계약에 힘이 실리는 해" : "작게 꾸준히 배우는 해" },
  ];

  const months: Panel[] = monthsOfYear(year).map((m, i) => {
    const mi = luckInfo(chart, m.pillar);
    const mr = relationsWithLuck(chart, m.pillar).filter((r) => r.slots.includes("day.branch"));
    const mt = luckTone(chart, m.pillar, mr);
    const tk = toneKey(mt);
    // 천간(앞 보름)의 문장 + 지지(생활 바탕)의 문장
    const text = `${PERIOD[groupOf(mi.stemSipsin)][tk][i % 2]!} ${MONTH_BRANCH[mi.branchSipsin]?.[tk] ?? ""}`.trim();
    const relText = mr[0] ? ` 이달은 ${describeRel(mr[0])}이 있어 ${RELATIONS[mr[0].type].withLuck}` : "";
    const [, mo, d] = m.startDate.split("-");
    return {
      label: `${Number(mo)}월`,
      pillar: m.pillar,
      caption: `${Number(mo)}/${Number(d)}부터 · ${mi.stemSipsin}`,
      tone: mt,
      text: text + relText,
    };
  });
  const best = [...months].sort((a, b) => b.tone - a.tone)[0]!;
  const worst = [...months].sort((a, b) => a.tone - b.tone)[0]!;

  const chapters: Chapter[] = [
    {
      key: "overview",
      title: `${year}년 한눈에`,
      body: [
        `${year}년은 ${pillarLabel(seun)}의 해입니다. 내 일간에게 천간 ${josa(`${seun.hangul[0]}(${seun.hanja[0]})`, "은", "는")} ${info.stemSipsin}, 지지 ${josa(`${seun.hangul[1]}(${seun.hanja[1]})`, "은", "는")} ${info.branchSipsin}에 해당합니다.`,
        PERIOD[g[0]!][tk][0]!,
        SIPSIN_GROUP[g[0]!].asLuck,
      ],
      evidence: [
        { label: `세운 ${seun.hanja}`, term: "세운" },
        { label: `${info.stemSipsin}·${info.branchSipsin}`, term: info.stemSipsin },
        { label: tone >= 4 ? "반가운 기운" : tone === 3 ? "무난한 기운" : "조심할 기운", term: "용신", tone: tone >= 4 ? "good" : tone <= 2 ? "caution" : "neutral" },
      ],
    },
    {
      key: "meet",
      title: "올해의 글자가 내 사주와 만나는 곳",
      body: rels.length
        ? rels.slice(0, 4).map((r) => `${describeRel(r)}: ${RELATIONS[r.type].withLuck}`)
        : ["올해의 글자가 원국과 크게 묶이거나 부딪히지 않아, 기운이 비교적 조용하게 흘러갑니다."],
      evidence: rels.slice(0, 4).map((r) => ({ label: describeRel(r), term: r.type.includes("합") ? "합" : r.type === "충" ? "충" : "형·파·해", tone: r.tone === "harmony" ? "good" : "caution" })),
    },
    {
      key: "fields",
      title: "분야별 흐름",
      body: fields.map((f) => `${f.label} ${f.score}점 — ${f.note}.`),
      evidence: [{ label: "점수는 세운·용신·합충으로 계산" }],
    },
    {
      key: "months",
      title: "열두 달",
      body: [`가장 순한 달은 ${best.label}(${best.pillar.hanja}), 가장 조심할 달은 ${worst.label}(${worst.pillar.hanja})입니다. 월은 절기(입춘·경칩 …)로 바뀝니다.`],
      evidence: [{ label: "월운", term: "월운" }],
    },
  ];

  return {
    headline: `${year} ${seun.hanja}년`,
    subline: `내게는 ${info.stemSipsin}과 ${info.branchSipsin}의 해. ${tone >= 4 ? "반가운 기운이 들어옵니다." : tone === 3 ? "무난하게 흘러갑니다." : "속도를 조절하면 지나갑니다."}`,
    chapters,
    factsForAi: [
      `대상 연도 ${year} 세운 ${seun.hanja}: 일간 기준 천간 ${info.stemSipsin}, 지지 ${info.branchSipsin}`,
      `원국 일주 ${chart.pillars.day.hanja}, 용신 오행 인덱스 ${chart.analysis.yongsin.element}(${chart.analysis.yongsin.role}), 신강약 ${chart.analysis.strength.label}`,
      `세운과 원국 관계: ${rels.map(describeRel).join(", ") || "없음"}`,
      `분야 점수: ${fields.map((f) => `${f.label} ${f.score}`).join(", ")}`,
      `월운: ${months.map((m) => `${m.label} ${m.pillar.hanja}(톤${m.tone})`).join(", ")}`,
    ],
    year,
    seun,
    tone,
    fields,
    months,
  };
}
