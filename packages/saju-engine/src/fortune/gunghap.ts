import { mod, stemElement } from "../constants/ganji.js";
import { branchPairRelations, stemRelation, type RelationType } from "../analysis/relations.js";
import type { Chart } from "../types.js";

export interface GunghapItem {
  /** 무엇을 비교했나 */
  aspect: "일간" | "일지" | "띠" | "오행";
  label: string;
  /** 점수 가감 */
  delta: number;
  /** 관계 이름 (합·충 등) 또는 상생·상극 */
  relation: string;
}

export interface Gunghap {
  score: number;
  items: GunghapItem[];
  /** 서로 채워 주는 오행 [A가 B에게, B가 A에게] */
  complement: { aToB: number[]; bToA: number[] };
}

const BRANCH_DELTA: Partial<Record<RelationType, number>> = {
  육합: 10,
  반합: 6,
  충: -10,
  원진: -8,
  형: -5,
  해: -4,
  파: -3,
};
const ZODIAC_DELTA: Partial<Record<RelationType, number>> = { 육합: 6, 반합: 6, 충: -6, 원진: -6 };

/**
 * 두 명식의 궁합 점수. 60점에서 시작해 근거마다 더하고 빼며, 40~98로 자른다.
 * 일간(마음의 결) · 일지(배우자 자리) · 년지(띠) · 오행 보완을 본다.
 */
export function computeGunghap(a: Chart, b: Chart): Gunghap {
  const items: GunghapItem[] = [];
  const as = a.pillars.day.stem;
  const bs = b.pillars.day.stem;

  // 1. 일간
  const sr = stemRelation(as, bs);
  const ae = stemElement(as);
  const be = stemElement(bs);
  if (sr?.type === "천간합") items.push({ aspect: "일간", label: "두 일간이 합을 이룸", delta: 12, relation: "천간합" });
  else if (sr?.type === "천간충") items.push({ aspect: "일간", label: "두 일간이 부딪힘", delta: -8, relation: "천간충" });
  else if (ae === be) items.push({ aspect: "일간", label: "같은 오행의 일간", delta: 4, relation: "비화" });
  else if (mod(be - ae, 5) === 1 || mod(ae - be, 5) === 1)
    items.push({ aspect: "일간", label: "한쪽이 다른 쪽을 살려 줌", delta: 8, relation: "상생" });
  else items.push({ aspect: "일간", label: "한쪽이 다른 쪽을 누름", delta: -6, relation: "상극" });

  // 2. 일지 (배우자 자리)
  for (const r of branchPairRelations(a.pillars.day.branch, b.pillars.day.branch)) {
    const d = BRANCH_DELTA[r.type];
    if (d) items.push({ aspect: "일지", label: `배우자 자리끼리 ${r.type}`, delta: d, relation: r.type });
  }

  // 3. 띠 (년지)
  for (const r of branchPairRelations(a.pillars.year.branch, b.pillars.year.branch)) {
    const d = ZODIAC_DELTA[r.type];
    if (d) items.push({ aspect: "띠", label: `띠끼리 ${r.type}`, delta: d, relation: r.type });
  }

  // 4. 오행 보완: 한쪽에 없는 오행을 상대가 2개 이상 가짐
  const ao = a.analysis.ohaeng;
  const bo = b.analysis.ohaeng;
  const aToB = [0, 1, 2, 3, 4].filter((e) => bo[e] === 0 && ao[e]! >= 2);
  const bToA = [0, 1, 2, 3, 4].filter((e) => ao[e] === 0 && bo[e]! >= 2);
  const fill = Math.min(12, (aToB.length + bToA.length) * 4);
  if (fill) items.push({ aspect: "오행", label: "서로 없는 오행을 채워 줌", delta: fill, relation: "보완" });

  const raw = 60 + items.reduce((s, i) => s + i.delta, 0);
  return { score: Math.max(40, Math.min(98, raw)), items, complement: { aToB, bToA } };
}
