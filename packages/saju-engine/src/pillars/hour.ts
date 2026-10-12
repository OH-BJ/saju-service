import type { Pillar } from "../types.js";
import { makePillar } from "./pillar.js";

/** 보정 시각(0~23시, 분)으로 시지를 구한다. 23:00~00:59 = 子 */
export function hourBranch(hour: number, minute: number): number {
  return Math.floor(((hour * 60 + minute + 60) % 1440) / 120);
}

/**
 * 시주: 시간은 일간으로 정한다 (시두법).
 * 甲己일 → 甲子시, 乙庚일 → 丙子시, 丙辛일 → 戊子시, 丁壬일 → 庚子시, 戊癸일 → 壬子시
 */
export function hourPillar(dayStemForHour: number, branch: number): Pillar {
  return makePillar((dayStemForHour % 5) * 2 + branch, branch);
}
