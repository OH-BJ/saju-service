import { BRANCH_ELEMENT, stemElement } from "../constants/ganji.js";
import type { Pillars } from "../types.js";

/** 오행 분포: 표면 천간·지지 8글자(시주 없으면 6글자)의 오행 개수 [木, 火, 土, 金, 水] */
export function countOhaeng(p: Pillars): [number, number, number, number, number] {
  const counts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const pillar of [p.year, p.month, p.day, p.hour]) {
    if (!pillar) continue;
    counts[stemElement(pillar.stem)]++;
    counts[BRANCH_ELEMENT[pillar.branch]!]++;
  }
  return counts;
}
