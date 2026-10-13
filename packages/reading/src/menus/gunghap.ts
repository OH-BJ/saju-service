import { computeGunghap, mod, stemElement, type Chart, type Gunghap } from "@saju/engine";
import { ELEMENT_FULL, elementKo, josa } from "../common.js";
import { ASPECT_TIPS, PAIR, SCORE_BAND } from "../content/gunghap.js";
import { ILJU } from "../content/ilju.js";
import { RELATIONS } from "../content/relations.js";
import type { Chapter, ReadingBase } from "../types.js";

export interface GunghapReading extends ReadingBase {
  gunghap: Gunghap;
  pairTitle: string;
  bandTitle: string;
}

/** {A}님/{B}님 자리표시자를 이름(없으면 본인/상대)으로 바꾸고 조사를 맞춘다 */
export function fillNames(text: string, a: string, b: string): string {
  let s = text;
  s = s.replaceAll("{A}님", a ? `${a}님` : "본인").replaceAll("{B}님", b ? `${b}님` : "상대");
  s = s.replaceAll("{A}", a || "본인").replaceAll("{B}", b || "상대");
  if (!b) s = s.replace(/상대(은|이|을|과)(?=\s|[.,])/g, (_, j: string) => `상대${{ 은: "는", 이: "가", 을: "를", 과: "와" }[j]}`);
  return s;
}

function pairKey(a: Chart, b: Chart): string {
  const ae = stemElement(a.pillars.day.stem);
  const be = stemElement(b.pillars.day.stem);
  if (ae === be) return "same";
  if (mod(be - ae, 5) === 1) return "a-feeds-b";
  if (mod(ae - be, 5) === 1) return "b-feeds-a";
  if (mod(be - ae, 5) === 2) return "a-controls-b";
  return "b-controls-a";
}

export function buildGunghapReading(a: Chart, b: Chart, names: { a: string; b: string }): GunghapReading {
  const g = computeGunghap(a, b);
  const key = pairKey(a, b);
  const base = PAIR[key]!;
  // 같은 오행끼리는 오행에 맞는 비유로 제목을 바꾼다
  const sameImage = ["나란히 선 두 나무", "나란히 타는 두 불꽃", "어깨를 맞댄 두 봉우리", "나란히 벼린 두 칼날", "나란히 흐르는 두 물줄기"][stemElement(a.pillars.day.stem)]!;
  const pair = key === "same" ? { ...base, title: sameImage } : base;
  const band = SCORE_BAND.find((x) => g.score >= x.min) ?? SCORE_BAND[SCORE_BAND.length - 1]!;
  const fill = (t: string) => fillNames(t, names.a, names.b);
  const an = names.a ? `${names.a}님` : "본인";
  const bn = names.b ? `${names.b}님` : "상대";

  const chapters: Chapter[] = [
    {
      key: "band",
      title: band.title,
      body: [fill(band.body)],
      evidence: g.items.map((i) => ({ label: `${i.label} ${i.delta > 0 ? "+" : ""}${i.delta}`, tone: i.delta > 0 ? "good" : "caution" })),
    },
    {
      key: "pair",
      title: `두 사람의 결 — ${pair.title}`,
      body: [
        `${an}의 일간은 ${a.pillars.day.hanja[0]}(${elementKo(stemElement(a.pillars.day.stem))}), ${bn}의 일간은 ${b.pillars.day.hanja[0]}(${elementKo(stemElement(b.pillars.day.stem))})입니다.`,
        fill(pair.body),
      ],
      evidence: [{ label: `${a.pillars.day.hanja[0]} · ${b.pillars.day.hanja[0]}`, term: "일간" }],
    },
    {
      key: "items",
      title: "근거 하나하나",
      body: g.items.map((i) => {
        const rel = RELATIONS[i.relation as keyof typeof RELATIONS];
        return `${i.aspect} — ${i.label}(${i.delta > 0 ? "+" : ""}${i.delta}). ${ASPECT_TIPS[i.aspect]} ${rel ? rel.between : ""}`.trim();
      }),
      evidence: [{ label: "기본 60점에서 가감" }],
    },
    {
      key: "each",
      title: "서로의 모습",
      body: [
        `${an}: ${a.pillars.day.hanja} 일주, ${ILJU[a.pillars.day.hanja]!.image}. ${ILJU[a.pillars.day.hanja]!.text}`,
        `${bn}: ${b.pillars.day.hanja} 일주, ${ILJU[b.pillars.day.hanja]!.image}. ${ILJU[b.pillars.day.hanja]!.text}`,
        g.complement.aToB.length || g.complement.bToA.length
          ? `${g.complement.aToB.length ? `${josa(an, "은", "는")} ${bn}에게 없는 ${g.complement.aToB.map((e) => ELEMENT_FULL[e]).join("·")} 기운을 채워 주고, ` : ""}${g.complement.bToA.length ? `${josa(bn, "은", "는")} ${an}에게 없는 ${g.complement.bToA.map((e) => ELEMENT_FULL[e]).join("·")} 기운을 채워 줍니다.` : "서로의 빈자리를 메워 주는 사이입니다."}`
          : "서로에게 없는 오행을 크게 채워 주는 구조는 아니라, 각자의 강점을 존중하는 방식이 잘 맞습니다.",
      ],
      evidence: [{ label: "일주", term: "일주" }, { label: "오행 보완", term: "오행" }],
    },
  ];

  return {
    headline: `${g.score}점 · ${band.title}`,
    subline: pair.title,
    chapters,
    factsForAi: [
      `A 일주 ${a.pillars.day.hanja}(${a.input.gender === "male" ? "남" : "여"}), 년지 ${a.pillars.year.hanja[1]}; B 일주 ${b.pillars.day.hanja}(${b.input.gender === "male" ? "남" : "여"}), 년지 ${b.pillars.year.hanja[1]}`,
      `궁합 점수 ${g.score}; 근거: ${g.items.map((i) => `${i.aspect} ${i.relation} ${i.delta}`).join(", ")}`,
      `오행 A ${a.analysis.ohaeng.join("/")}, B ${b.analysis.ohaeng.join("/")} (목화토금수)`,
    ],
    gunghap: g,
    pairTitle: pair.title,
    bandTitle: band.title,
  };
}
