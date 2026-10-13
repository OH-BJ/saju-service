import { STEMS, BRANCHES, stemElement, type Chart, type PillarKey, type Relation } from "@saju/engine";
import {
  ELEMENT_LUCK,
  PILLAR_NAME,
  SLOT_NAME,
  elementName,
  groupOf,
  josa,
  luckInfo,
  luckTone,
  pillarLabel,
} from "../common.js";
import { ILGAN } from "../content/ilgan.js";
import { ILJU } from "../content/ilju.js";
import { OHAENG } from "../content/ohaeng.js";
import { PERIOD } from "../content/period.js";
import { RELATIONS } from "../content/relations.js";
import { SIPSIN_GROUP, type SipsinGroup } from "../content/sipsin.js";
import { STARS } from "../content/stars.js";
import { UNSEONG } from "../content/unseong.js";
import type { Chapter, Evidence, Panel, ReadingBase } from "../types.js";

const GROUPS: SipsinGroup[] = ["비겁", "식상", "재성", "관성", "인성"];
const KEYS: PillarKey[] = ["year", "month", "day", "hour"];
/** 십신 묶음 칩을 눌렀을 때 열 대표 용어 */
const GROUP_TERM: Record<SipsinGroup, string> = { 비겁: "비견", 식상: "식신", 재성: "정재", 관성: "정관", 인성: "정인" };

export interface SajuReading extends ReadingBase {
  daeun: Panel[];
  groups: Record<SipsinGroup, number>;
}

function countGroups(chart: Chart): Record<SipsinGroup, number> {
  const g = Object.fromEntries(GROUPS.map((k) => [k, 0])) as Record<SipsinGroup, number>;
  for (const k of KEYS) {
    const s = chart.analysis.sipsin[k];
    if (!s) continue;
    if (k !== "day") g[groupOf(s.stem)]++;
    g[groupOf(s.branch)]++;
  }
  return g;
}

const relLabel = (r: Relation) =>
  `${r.slots.map((s) => SLOT_NAME[s] ?? s).join("·")} ${r.values.map((v, i) => (r.slots[i]!.endsWith("stem") ? STEMS[v] : BRANCHES[v])).join("")} ${r.type}`;

export function buildSajuReading(chart: Chart, targetYear: number): SajuReading {
  const { pillars, analysis, daeun } = chart;
  const ds = pillars.day.stem;
  const dayEl = stemElement(ds);
  const ilgan = ILGAN[ds]!;
  const ilju = ILJU[pillars.day.hanja]!;
  const groups = countGroups(chart);
  const max = Math.max(...Object.values(groups));
  const dominant = GROUPS.filter((g) => groups[g] === max && max >= 2);
  const missing = GROUPS.filter((g) => groups[g] === 0);
  const { strength, yongsin, ohaeng } = analysis;
  const strongEl = ohaeng.flatMap((n, i) => (n >= 3 ? [i] : []));
  const lackEl = ohaeng.flatMap((n, i) => (n === 0 ? [i] : []));
  const top = dominant[0];

  const chapters: Chapter[] = [];

  // 1. 총평
  chapters.push({
    key: "summary",
    title: "총평",
    body: [
      `${pillars.day.hanja} 일주, ${ilju.image}의 사주입니다. ${ilju.text}`,
      `나를 뜻하는 일간은 ${STEMS[ds]}, 오행으로 ${elementName(dayEl)}이며 ${ilgan.image}에 비유됩니다. ${ilgan.nature}`,
      top
        ? `여덟 글자 가운데 ${top}(${SIPSIN_GROUP[top].meaning})의 기운이 가장 두드러집니다. ${SIPSIN_GROUP[top].strong}`
        : "십신이 한쪽으로 치우치지 않고 고르게 놓여 있어 상황에 맞춰 여러 얼굴을 꺼내 쓸 수 있습니다.",
    ],
    evidence: [
      { label: `일주 ${pillars.day.hanja}`, term: "일주" },
      { label: `일간 ${STEMS[ds]} ${elementName(dayEl)}`, term: "일간" },
      ...(top ? [{ label: `${top} ${max}개`, term: GROUP_TERM[top] } as Evidence] : []),
    ],
  });

  // 2. 성격과 기질
  chapters.push({
    key: "personality",
    title: "성격과 기질",
    body: [
      `핵심 낱말은 ${ilgan.keywords.join(", ")}입니다. ${ilgan.strengths}`,
      ilgan.cautions,
      ...strongEl.map((i) => `${josa(OHAENG[i]!.name, "이", "가")} 많아 ${OHAENG[i]!.excess}`),
      ...lackEl.map((i) => `${josa(OHAENG[i]!.name, "이", "가")} 없어 ${OHAENG[i]!.lack}`),
    ],
    evidence: [
      ...strongEl.map((i) => ({ label: `${OHAENG[i]!.name} ${ohaeng[i]}개`, term: "오행" })),
      ...lackEl.map((i) => ({ label: `${OHAENG[i]!.name} 없음`, term: "오행", tone: "caution" as const })),
      { label: `일지 12운성 ${analysis.unseong12.day}`, term: "12운성" },
    ],
  });
  const dayUnseong = UNSEONG[analysis.unseong12.day ?? ""];
  if (dayUnseong) chapters[1]!.body.push(`배우자 자리이자 속마음을 뜻하는 일지는 12운성으로 ${analysis.unseong12.day}, ${dayUnseong.image}의 자리입니다. ${dayUnseong.short}`);

  // 3. 강약과 필요한 기운
  const luck = ELEMENT_LUCK[yongsin.element];
  chapters.push({
    key: "strength",
    title: "힘의 크기와 필요한 기운",
    body: [
      `일간을 돕는 기운이 전체의 ${strength.score}%로 ${strength.label}에 해당합니다. 태어난 계절의 도움(득령)은 ${strength.deukryeong ? "받았고" : "받지 못했고"}, 앉은 자리의 도움(득지)은 ${strength.deukji ? "있으며" : "없으며"}, 주변 글자의 도움(득세)은 ${strength.deukse ? "충분합니다" : "적은 편입니다"}.`,
      `${yongsin.reason} 이 사주에서 반가운 기운은 ${elementName(yongsin.element)}입니다.`,
      `${OHAENG[yongsin.element]!.name} 기운은 생활 속에서 ${OHAENG[yongsin.element]!.boost} 같은 것으로 가까이할 수 있습니다. 숫자로는 ${luck.numbers.join("·")}, 색으로는 ${luck.color}, 방향으로는 ${luck.direction}이 이 기운과 통합니다.`,
      "용신은 간단한 계산으로 고른 것이라, 전문 감정의 격국·용신과 다를 수 있습니다.",
    ],
    evidence: [
      { label: `신강약 ${strength.score}% ${strength.label}`, term: strength.score > 55 ? "신강" : "신약" },
      { label: `득령 ${strength.deukryeong ? "○" : "×"} · 득지 ${strength.deukji ? "○" : "×"} · 득세 ${strength.deukse ? "○" : "×"}` },
      { label: `용신 ${elementName(yongsin.element)} (${yongsin.method})`, term: "용신", tone: "good" },
    ],
  });

  // 4. 합과 충
  const rels = analysis.relations;
  const relBody: string[] = [];
  const seenType = new Set<string>();
  for (const r of rels) {
    const t = RELATIONS[r.type];
    if (seenType.has(r.type)) {
      relBody.push(`${relLabel(r)}도 함께 있습니다.`);
      continue;
    }
    seenType.add(r.type);
    relBody.push(`${relLabel(r)}${r.element !== undefined ? `(${elementName(r.element)} 기운)` : ""}: ${t.natal}`);
  }
  if (analysis.gongmang.at.length) {
    relBody.push(
      `${analysis.gongmang.at.map((k) => PILLAR_NAME[k]).join("·")}의 지지가 공망(${analysis.gongmang.branches.map((b) => BRANCHES[b]).join("")})에 걸립니다. ${STARS["공망"]?.detail ?? ""}`,
    );
  }
  chapters.push({
    key: "relations",
    title: "글자끼리의 만남 — 합과 충",
    body: relBody.length ? relBody : ["원국 안에서 서로 강하게 묶이거나 부딪히는 글자가 없어, 기운이 비교적 조용하고 안정적으로 흐릅니다."],
    evidence: [
      ...rels.slice(0, 6).map((r) => ({ label: relLabel(r), term: r.type.includes("합") ? "합" : r.type === "충" ? "충" : r.type === "원진" ? "원진" : "형·파·해", tone: r.tone === "harmony" ? ("good" as const) : ("caution" as const) })),
      { label: `공망 ${analysis.gongmang.branches.map((b) => BRANCHES[b]).join("")}`, term: "공망" },
    ],
  });

  // 5. 신살
  const stars = analysis.stars;
  const uniqStars = [...new Map(stars.map((s) => [s.name, s])).values()];
  chapters.push({
    key: "stars",
    title: "타고난 별 — 신살",
    body: uniqStars.length
      ? uniqStars.map((s) => {
          const t = STARS[s.name];
          const at = stars.filter((x) => x.name === s.name).map((x) => PILLAR_NAME[x.at]).join("·");
          return t ? `${s.name}(${at}): ${t.detail} ${t.tip}` : `${s.name}(${at})`;
        })
      : ["두드러진 신살이 없는 담백한 사주입니다. 특별한 별에 기대기보다 스스로 쌓은 것이 그대로 결과가 됩니다."],
    evidence: uniqStars.map((s) => ({ label: s.name, term: s.name, tone: s.tone === "good" ? ("good" as const) : s.tone === "caution" ? ("caution" as const) : ("neutral" as const) })),
  });

  // 6~9. 재물·애정·직업·건강
  chapters.push({
    key: "wealth",
    title: "재물",
    body: [
      groups.재성 === 0 ? SIPSIN_GROUP.재성.weak : groups.재성 >= 3 ? SIPSIN_GROUP.재성.strong : "재성이 알맞게 있어 벌고 지키는 균형을 잡기 좋은 구조입니다.",
      groups.재성 > 0 ? SIPSIN_GROUP.재성.money : "",
      top && top !== "재성" ? SIPSIN_GROUP[top].money : "",
    ].filter(Boolean),
    evidence: [{ label: `재성 ${groups.재성}개`, term: "정재" }],
  });
  const spouseGroup: SipsinGroup = chart.input.gender === "male" ? "재성" : "관성";
  chapters.push({
    key: "love",
    title: "애정과 인연",
    body: [
      SIPSIN_GROUP[spouseGroup].love,
      top && top !== spouseGroup ? SIPSIN_GROUP[top].love : "",
      `${chart.input.gender === "male" ? "남성" : "여성"}에게 배우자의 별은 ${spouseGroup}입니다. 원국에 ${spouseGroup}이 ${groups[spouseGroup]}개 있습니다.${groups[spouseGroup] === 0 ? ` 운에서 ${spouseGroup}이 들어오는 해에 인연의 변화가 생기기 쉽습니다.` : ""}`,
      dayUnseong ? `일지(배우자 자리)는 ${pillars.day.hanja[1]} — ${analysis.sipsin.day?.branch}의 자리라, 가까운 사람에게는 이 모습이 더 잘 드러납니다.` : "",
    ].filter(Boolean),
    evidence: [
      { label: `${spouseGroup} ${groups[spouseGroup]}개`, term: chart.input.gender === "male" ? "정재" : "정관" },
      { label: `일지 ${pillars.day.hanja[1]} ${analysis.sipsin.day?.branch}`, term: "일주" },
    ],
  });
  chapters.push({
    key: "career",
    title: "일과 적성",
    body: [
      top ? `잘 맞는 분야: ${SIPSIN_GROUP[top].career}.` : `잘 맞는 분야: ${SIPSIN_GROUP[yongsin.role === "비겁" ? "비겁" : yongsin.role].career}.`,
      groups.관성 >= 2 ? SIPSIN_GROUP.관성.strong : groups.식상 >= 2 ? SIPSIN_GROUP.식상.strong : ilgan.strengths,
      `용신이 ${yongsin.role}이라, ${SIPSIN_GROUP[yongsin.role].career} 쪽의 역할을 곁들이면 힘이 덜 듭니다.`,
    ],
    evidence: [{ label: `관성 ${groups.관성} · 식상 ${groups.식상}`, term: "정관" }],
  });
  chapters.push({
    key: "health",
    title: "몸과 마음 관리",
    body: [
      ...strongEl.map((i) => `${josa(OHAENG[i]!.name, "이", "가")} 많은 편이니 ${OHAENG[i]!.care}`),
      ...lackEl.map((i) => `${OHAENG[i]!.name} 기운을 채우는 데는 ${OHAENG[i]!.boost} 같은 생활 요소가 도움이 됩니다. ${OHAENG[i]!.care}`),
      strongEl.length + lackEl.length === 0 ? "오행이 고르게 놓여 규칙적인 생활만 지켜도 균형을 유지하기 좋습니다." : "",
      "건강 이야기는 생활 습관 참고용입니다. 불편한 증상이 있다면 꼭 전문가와 상의하세요.",
    ].filter(Boolean),
    evidence: [...strongEl, ...lackEl].map((i) => ({ label: `${OHAENG[i]!.name} ${ohaeng[i]}개`, term: "오행" })),
  });

  // 10. 대운
  const age = targetYear - chart.solarDate.year;
  const shownAge = (a: number) => Math.max(1, Math.round(a));
  const panels: Panel[] = daeun.list.slice(0, 9).map((d, i) => {
    const info = luckInfo(chart, d.pillar);
    const tone = luckTone(chart, d.pillar);
    const next = daeun.list[i + 1];
    const current = d.age <= age && (!next || next.age > age);
    const variants = PERIOD[info.groups[0]!][tone >= 4 ? "good" : tone === 3 ? "neutral" : "caution"];
    return {
      label: `${shownAge(d.age)}세`,
      pillar: d.pillar,
      caption: `${info.stemSipsin}·${info.branchSipsin}`,
      tone,
      text: `${shownAge(d.age)}세부터 10년, ${pillarLabel(d.pillar)} 대운입니다. 앞 5년은 ${info.stemSipsin}, 뒤 5년은 ${info.branchSipsin}의 색이 짙습니다. ${variants[i % 2]}`,
      current,
    };
  });
  const cur = panels.find((p) => p.current);
  chapters.push({
    key: "daeun",
    title: "십 년마다 바뀌는 길 — 대운",
    body: [
      `대운은 ${daeun.forward ? "순행" : "역행"}하며 약 ${shownAge(daeun.startAge)}세부터 10년마다 바뀝니다. 아래 병풍의 폭을 누르면 시기별 풀이가 펼쳐집니다.`,
      cur ? `지금(${targetYear}년, 약 ${age}세)은 ${pillarLabel(cur.pillar)} 대운을 지나고 있습니다. ${cur.text.split(". ").slice(2).join(". ")}` : "아직 첫 대운에 들어서기 전입니다.",
    ],
    evidence: [{ label: `대운수 ${shownAge(daeun.startAge)}`, term: "대운" }, ...(cur ? [{ label: `현재 ${cur.pillar.hanja} 대운`, term: "대운" }] : [])],
  });

  const factsForAi = [
    `명식: 년주 ${pillars.year.hanja}, 월주 ${pillars.month.hanja}, 일주 ${pillars.day.hanja}, 시주 ${pillars.hour?.hanja ?? "모름"}`,
    `성별: ${chart.input.gender === "male" ? "남" : "여"}, ${targetYear}년 기준 나이 약 ${age}세`,
    `일간 ${STEMS[ds]}(${elementName(dayEl)}), 일주 비유: ${ilju.image}`,
    `오행 개수 목${ohaeng[0]} 화${ohaeng[1]} 토${ohaeng[2]} 금${ohaeng[3]} 수${ohaeng[4]}`,
    `십신 묶음 개수: ${GROUPS.map((g) => `${g}${groups[g]}`).join(", ")}; 없는 것: ${missing.join("·") || "없음"}`,
    `신강약 ${strength.score}% (${strength.label}), 용신 ${elementName(yongsin.element)} — ${yongsin.reason}`,
    `원국 관계: ${rels.map(relLabel).join(", ") || "없음"}; 공망 ${analysis.gongmang.branches.map((b) => BRANCHES[b]).join("")}`,
    `신살: ${uniqStars.map((s) => s.name).join(", ") || "없음"}`,
    `대운(${daeun.forward ? "순행" : "역행"}): ${daeun.list.slice(0, 8).map((d) => `${shownAge(d.age)}세 ${d.pillar.hanja}`).join(", ")}; 현재 ${cur?.pillar.hanja ?? "없음"}`,
  ];

  return {
    headline: `${pillars.day.hanja} · ${ilju.image}`,
    subline: `${ilgan.image}의 기질에 ${strength.label}, 반가운 기운은 ${elementName(yongsin.element)}입니다.`,
    chapters,
    factsForAi,
    daeun: panels,
    groups,
  };
}
