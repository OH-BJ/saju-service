import { BRANCHES, BRANCHES_KO, STEMS, STEMS_KO, mod } from "../constants/ganji.js";
import type { Pillar } from "../types.js";

export function makePillar(stem: number, branch: number): Pillar {
  const s = mod(stem, 10);
  const b = mod(branch, 12);
  return { stem: s, branch: b, hanja: STEMS[s]! + BRANCHES[b]!, hangul: STEMS_KO[s]! + BRANCHES_KO[b]! };
}

/** 60갑자 인덱스로 기둥 생성 */
export const pillarFromIndex = (i: number): Pillar => makePillar(mod(i, 60) % 10, mod(i, 60) % 12);
