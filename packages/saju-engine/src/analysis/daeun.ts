import { surroundingJie } from "../calendar/solarTerms.js";
import { ganjiIndex, stemIsYang } from "../constants/ganji.js";
import { pillarFromIndex } from "../pillars/pillar.js";
import type { Daeun, Gender, Pillar } from "../types.js";

const DAY_MS = 86_400_000;

/**
 * 대운: 양년생 남자·음년생 여자는 순행, 반대는 역행.
 * 대운수 = 출생 순간부터 다음(순행)/이전(역행) 절입까지의 일수 ÷ 3 (3일 = 1년, 1일 = 4개월)
 */
export function computeDaeun(utcMs: number, gender: Gender, yearStem: number, month: Pillar, count = 10): Daeun {
  const forward = stemIsYang(yearStem) === (gender === "male");
  const { prev, next } = surroundingJie(utcMs);
  const days = Math.abs((forward ? next.utcMs : prev.utcMs) - utcMs) / DAY_MS;
  // 개월 단위로 반올림 (1일 = 4개월)
  const months = Math.round(days * 4);
  const startAge = Math.floor(months / 12) + (months % 12) / 12;

  const base = ganjiIndex(month.stem, month.branch);
  const list = Array.from({ length: count }, (_, i) => ({
    age: Math.round((startAge + i * 10) * 10) / 10,
    pillar: pillarFromIndex(base + (forward ? i + 1 : -(i + 1))),
  }));
  return { forward, startAge, list };
}
