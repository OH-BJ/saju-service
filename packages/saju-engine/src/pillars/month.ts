import { surroundingJie } from "../calendar/solarTerms.js";
import type { Pillar } from "../types.js";
import { makePillar } from "./pillar.js";

/**
 * 월주: 월지는 직전 절(節)로 정하고, 월간은 년간으로 정한다 (월두법).
 * 甲己년 → 丙寅월, 乙庚년 → 戊寅월, 丙辛년 → 庚寅월, 丁壬년 → 壬寅월, 戊癸년 → 甲寅월
 */
export function monthPillar(utcMs: number, yearStem: number): Pillar {
  const branch = surroundingJie(utcMs).prev.branch;
  const offsetFromYin = (branch - 2 + 12) % 12;
  const stem = ((yearStem % 5) * 2 + 2 + offsetFromYin) % 10;
  return makePillar(stem, branch);
}
