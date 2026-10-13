import { ganjiIndex } from "../constants/ganji.js";
import type { PillarKey, Pillars } from "../types.js";
import { SAMHAP } from "./relations.js";

/** 12신살 이름 (지살부터 순서대로) */
export const SINSAL12 = [
  "지살",
  "년살",
  "월살",
  "망신살",
  "장성살",
  "반안살",
  "역마살",
  "육해살",
  "화개살",
  "겁살",
  "재살",
  "천살",
] as const;
export type Sinsal12 = (typeof SINSAL12)[number];

/**
 * 12신살: 기준 지지(년지 또는 일지)가 속한 삼합의 생지를 지살로 두고 순서대로 붙인다.
 * 예) 申子辰 → 申 지살, 酉 년살(도화), 子 장성, 寅 역마, 辰 화개, 巳 겁살
 */
export function sinsal12(baseBranch: number, target: number): Sinsal12 {
  const group = SAMHAP.find(([s, w, g]) => s === baseBranch || w === baseBranch || g === baseBranch)!;
  return SINSAL12[(target - group[0] + 12) % 12]!;
}

export interface SpecialStar {
  name: string;
  /** 해당 기둥 */
  at: PillarKey;
  /** 길(도움)/흉(조심)/중(성향) */
  tone: "good" | "caution" | "neutral";
}

// 천을귀인 (일간 기준): 甲戊庚→丑未, 乙己→子申, 丙丁→亥酉, 辛→寅午, 壬癸→巳卯
const CHEONEUL: Record<number, number[]> = {
  0: [1, 7], 4: [1, 7], 6: [1, 7],
  1: [0, 8], 5: [0, 8],
  2: [11, 9], 3: [11, 9],
  7: [2, 6],
  8: [5, 3], 9: [5, 3],
};
// 문창귀인 (일간 기준)
const MUNCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
// 양인 (양간만): 甲卯 丙午 戊午 庚酉 壬子
const YANGIN: Record<number, number> = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };
// 홍염 (일간 기준)
const HONGYEOM = [6, 6, 2, 7, 4, 4, 10, 9, 0, 8];
// 괴강 일주: 庚辰 庚戌 壬辰 壬戌 戊戌
const GOEGANG = new Set([ganjiIndex(6, 4), ganjiIndex(6, 10), ganjiIndex(8, 4), ganjiIndex(8, 10), ganjiIndex(4, 10)]);
// 백호 (기둥): 甲辰 乙未 丙戌 丁丑 戊辰 壬戌 癸丑
const BAEKHO = new Set([
  ganjiIndex(0, 4), ganjiIndex(1, 7), ganjiIndex(2, 10), ganjiIndex(3, 1), ganjiIndex(4, 4), ganjiIndex(8, 10), ganjiIndex(9, 1),
]);

const KEYS: PillarKey[] = ["year", "month", "day", "hour"];

/** 원국의 주요 신살 (일간 기준 귀인류 + 기둥 단위 살) */
export function specialStars(p: Pillars): SpecialStar[] {
  const out: SpecialStar[] = [];
  const ds = p.day.stem;
  for (const k of KEYS) {
    const pillar = p[k];
    if (!pillar) continue;
    const b = pillar.branch;
    if (CHEONEUL[ds]!.includes(b)) out.push({ name: "천을귀인", at: k, tone: "good" });
    if (MUNCHANG[ds] === b) out.push({ name: "문창귀인", at: k, tone: "good" });
    if (YANGIN[ds] === b) out.push({ name: "양인살", at: k, tone: "caution" });
    if (HONGYEOM[ds] === b) out.push({ name: "홍염살", at: k, tone: "neutral" });
    const idx = ganjiIndex(pillar.stem, b);
    if (BAEKHO.has(idx)) out.push({ name: "백호살", at: k, tone: "caution" });
    if (k === "day" && GOEGANG.has(idx)) out.push({ name: "괴강살", at: k, tone: "neutral" });
  }
  // 도화·역마·화개는 년지·일지 기준 12신살에서 함께 본다
  for (const k of KEYS) {
    const pillar = p[k];
    if (!pillar) continue;
    for (const base of [p.year.branch, p.day.branch]) {
      const s = sinsal12(base, pillar.branch);
      const name = s === "년살" ? "도화살" : s === "역마살" ? "역마살" : s === "화개살" ? "화개살" : null;
      if (name && !out.some((o) => o.name === name && o.at === k)) out.push({ name, at: k, tone: "neutral" });
    }
  }
  return out;
}
