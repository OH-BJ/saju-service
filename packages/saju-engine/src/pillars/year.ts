import { sajuYear } from "../calendar/solarTerms.js";
import type { Pillar } from "../types.js";
import { pillarFromIndex } from "./pillar.js";

/** 년주: 입춘 기준. 1984년(甲子)을 기준으로 60갑자 순환 */
export function yearPillar(utcMs: number): Pillar {
  return pillarFromIndex(sajuYear(utcMs) - 1984);
}
