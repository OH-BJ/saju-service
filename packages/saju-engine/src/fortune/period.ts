import { jieAround } from "../calendar/solarTerms.js";
import { seoulWallClockToUtc } from "../calendar/trueSolarTime.js";
import { dayPillar } from "../pillars/day.js";
import { makePillar, pillarFromIndex } from "../pillars/pillar.js";
import type { Pillar } from "../types.js";

/** 세운: 해당 연도(입춘~다음 입춘)의 간지 */
export const yearGanji = (year: number): Pillar => pillarFromIndex(year - 1984);

export interface MonthFortunePillar {
  /** 寅월=1 … 丑월=12 (입춘부터 순서) */
  order: number;
  pillar: Pillar;
  /** 절입 순간 (UTC ISO) */
  startUtc: string;
  /** 절입일 (KST, YYYY-MM-DD) */
  startDate: string;
}

const KST = 9 * 3_600_000;
const ymd = (ms: number) => new Date(ms + KST).toISOString().slice(0, 10);

/** 월운: 해당 연도 입춘(寅월)부터 다음 해 소한(丑월)까지 12개월의 월주 */
export function monthsOfYear(year: number): MonthFortunePillar[] {
  const yearStem = yearGanji(year).stem;
  const ref = Date.UTC(year, 5, 1); // 그해 6월 기준으로 앞뒤 절기를 모은다
  const lichun = jieAround(ref).find((j) => j.isLichun && new Date(j.utcMs + KST).getUTCFullYear() === year)!;
  const byTime = new Map<number, (typeof lichun)>();
  for (const j of [...jieAround(ref), ...jieAround(Date.UTC(year, 11, 1))]) {
    if (j.utcMs >= lichun.utcMs) byTime.set(j.utcMs, j);
  }
  const ordered = [...byTime.values()].sort((a, b) => a.utcMs - b.utcMs).slice(0, 12);
  return ordered.map((j, i) => ({
    order: i + 1,
    pillar: makePillar((yearStem % 5) * 2 + 2 + i, 2 + i),
    startUtc: new Date(j.utcMs).toISOString(),
    startDate: ymd(j.utcMs),
  }));
}

/** 일진: 해당 양력 날짜의 일주 */
export const dayGanji = (year: number, month: number, day: number): Pillar => dayPillar(year, month, day);

/** 한국 시각 기준 오늘 날짜 */
export function todayKst(now = Date.now()): { year: number; month: number; day: number } {
  const d = new Date(now + KST);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** 해당 날짜(KST 정오)가 속한 월운 간지 */
export function monthGanjiOn(year: number, month: number, day: number): Pillar {
  const utc = seoulWallClockToUtc(year, month, day, 12, 0);
  for (const y of [year, year - 1]) {
    const months = monthsOfYear(y);
    for (let i = months.length - 1; i >= 0; i--) {
      if (Date.parse(months[i]!.startUtc) <= utc) return months[i]!.pillar;
    }
  }
  throw new RangeError("월운 범위를 벗어났습니다");
}
