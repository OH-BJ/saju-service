import KoreanLunarCalendar from "korean-lunar-calendar";
import { dayPillar } from "../pillars/day.js";
import { makePillar } from "../pillars/pillar.js";
import type { Pillar } from "../types.js";
import { yearGanji } from "./period.js";

/** 선천수: 甲己9 乙庚8 丙辛7 丁壬6 戊癸5 / 子午9 丑未8 寅申7 卯酉6 辰戌5 巳亥4 */
const STEM_NUM = [9, 8, 7, 6, 5, 9, 8, 7, 6, 5];
const BRANCH_NUM = [9, 8, 7, 6, 5, 4, 9, 8, 7, 6, 5, 4];
export const seoncheonsu = (p: Pillar) => STEM_NUM[p.stem]! + BRANCH_NUM[p.branch]!;

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  leap: boolean;
}

/** 양력 → 한국 음력 */
export function toLunarDate(year: number, month: number, day: number): LunarDate {
  const cal = new KoreanLunarCalendar();
  if (!cal.setSolarDate(year, month, day)) throw new RangeError(`유효하지 않은 양력 날짜: ${year}-${month}-${day}`);
  const l = cal.getLunarCalendar();
  return { year: l.year, month: l.month, day: l.day, leap: Boolean(l.intercalation) };
}

/** 음력 해당 월의 날수 (큰달 30 / 작은달 29) */
export function lunarMonthDays(year: number, month: number): 29 | 30 {
  return new KoreanLunarCalendar().setLunarDate(year, month, 30, false) ? 30 : 29;
}

/** 음력 날짜의 양력 (그 해 그 달에 30일이 없으면 29일로) */
function lunarToSolar(year: number, month: number, day: number) {
  const cal = new KoreanLunarCalendar();
  const d = Math.min(day, lunarMonthDays(year, month));
  cal.setLunarDate(year, month, d, false);
  const s = cal.getSolarCalendar();
  return { year: s.year, month: s.month, day: s.day };
}

export interface TojungGwae {
  /** 세 자리 괘 번호 (예: 352) */
  code: number;
  upper: number;
  middle: number;
  lower: number;
  /** 계산 근거 (화면에 '어떻게 나왔나'로 보여 준다) */
  steps: {
    age: number;
    taese: { pillar: Pillar; num: number };
    monthDays: number;
    wolgeon: { pillar: Pillar; num: number };
    birthDay: number;
    iljin: { pillar: Pillar; num: number };
  };
}

/** 음력 월의 월건 (정월=寅월, 월간은 그 해 천간으로) */
export const lunarMonthPillar = (yearStem: number, lunarMonth: number) =>
  makePillar((yearStem % 5) * 2 + 2 + (lunarMonth - 1), lunarMonth + 1);

/**
 * 토정비결 작괘 (선천수 방식)
 * - 상괘 = (세는나이 + 당년 태세수) ÷ 8 의 나머지
 * - 중괘 = (당년 생월 날수 + 당년 생월 월건수) ÷ 6 의 나머지
 * - 하괘 = (음력 생일 + 당년 생일 일진수) ÷ 3 의 나머지
 * 나머지가 0이면 8·6·3. 윤달생은 평달로 본다.
 */
export function tojungGwae(birthLunar: LunarDate, targetYear: number): TojungGwae {
  const age = targetYear - birthLunar.year + 1;
  const taesePillar = yearGanji(targetYear);
  const taese = seoncheonsu(taesePillar);

  const monthDays = lunarMonthDays(targetYear, birthLunar.month);
  const wolgeonPillar = lunarMonthPillar(taesePillar.stem, birthLunar.month);
  const wolgeon = seoncheonsu(wolgeonPillar);

  const s = lunarToSolar(targetYear, birthLunar.month, birthLunar.day);
  const iljinPillar = dayPillar(s.year, s.month, s.day);
  const iljin = seoncheonsu(iljinPillar);

  const r = (n: number, m: number) => n % m || m;
  const upper = r(age + taese, 8);
  const middle = r(monthDays + wolgeon, 6);
  const lower = r(birthLunar.day + iljin, 3);
  return {
    code: upper * 100 + middle * 10 + lower,
    upper,
    middle,
    lower,
    steps: {
      age,
      taese: { pillar: taesePillar, num: taese },
      monthDays,
      wolgeon: { pillar: wolgeonPillar, num: wolgeon },
      birthDay: birthLunar.day,
      iljin: { pillar: iljinPillar, num: iljin },
    },
  };
}

/** 토정비결 월별운에 쓰는 해당 연도 음력 월 목록 (1~12월, 각 월건과 양력 시작일) */
export function lunarMonthsOfYear(year: number) {
  const ys = yearGanji(year).stem;
  return Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const start = lunarToSolar(year, m, 1);
    return { month: m, pillar: lunarMonthPillar(ys, m), days: lunarMonthDays(year, m), solarStart: start };
  });
}
