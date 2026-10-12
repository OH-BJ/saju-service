import KoreanLunarCalendar from "korean-lunar-calendar";
import type { CalendarType } from "../types.js";

/** 한국 음력(천문연 기준)을 양력으로 변환한다. 양력 입력은 그대로 검증만 한다. */
export function toSolarDate(
  year: number,
  month: number,
  day: number,
  calendar: CalendarType,
): { year: number; month: number; day: number } {
  const cal = new KoreanLunarCalendar();
  if (calendar === "solar") {
    if (!cal.setSolarDate(year, month, day)) throw new RangeError(`유효하지 않은 양력 날짜: ${year}-${month}-${day}`);
    return { year, month, day };
  }
  const leap = calendar === "lunar-leap";
  if (!cal.setLunarDate(year, month, day, leap)) {
    throw new RangeError(`유효하지 않은 음력${leap ? "(윤달)" : ""} 날짜: ${year}-${month}-${day}`);
  }
  const s = cal.getSolarCalendar();
  return { year: s.year, month: s.month, day: s.day };
}
