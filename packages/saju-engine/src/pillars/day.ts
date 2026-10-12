import type { Pillar } from "../types.js";
import { pillarFromIndex } from "./pillar.js";

const DAY_MS = 86_400_000;
/** 2000-01-01 = 戊午일 (60갑자 인덱스 54) */
const REF_UTC = Date.UTC(2000, 0, 1);
const REF_INDEX = 54;

/** 일주: 기준일로부터의 날짜 수로 60갑자 순환 */
export function dayPillar(year: number, month: number, day: number): Pillar {
  const days = Math.round((Date.UTC(year, month - 1, day) - REF_UTC) / DAY_MS);
  return pillarFromIndex(REF_INDEX + days);
}
