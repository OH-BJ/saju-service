import type { BirthInput, CalendarType, Gender } from "@saju/engine";

/** 화면에서 다루는 한 사람의 입력 (이름은 화면 표시용으로만 쓰고 AI 요청에는 보내지 않는다) */
export interface Person {
  name: string;
  year: number;
  month: number;
  day: number;
  /** "HH:mm", 모르면 빈 문자열 */
  time: string;
  calendar: CalendarType;
  gender: Gender;
}

const CAL_CODE: Record<CalendarType, string> = { solar: "s", lunar: "l", "lunar-leap": "L" };
const CAL_FROM: Record<string, CalendarType> = { s: "solar", l: "lunar", L: "lunar-leap" };

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

/** 사람 → 짧은 쿼리 (p=19951009-1430-s-m, n=이름). prefix로 두 번째 사람을 구분 */
export function personToQuery(p: Person, prefix = ""): Record<string, string> {
  const t = p.time ? p.time.replace(":", "") : "x";
  const q: Record<string, string> = {
    [`${prefix}p`]: `${pad(p.year, 4)}${pad(p.month)}${pad(p.day)}-${t}-${CAL_CODE[p.calendar]}-${p.gender === "male" ? "m" : "f"}`,
  };
  if (p.name.trim()) q[`${prefix}n`] = p.name.trim().slice(0, 12);
  return q;
}

export function personFromQuery(q: URLSearchParams, prefix = ""): Person | null {
  const m = /^(\d{4})(\d{2})(\d{2})-(\d{4}|x)-([slL])-([mf])$/.exec(q.get(`${prefix}p`) ?? "");
  if (!m) return null;
  const [, y, mo, d, t, c, g] = m;
  return {
    name: (q.get(`${prefix}n`) ?? "").slice(0, 12),
    year: Number(y),
    month: Number(mo),
    day: Number(d),
    time: t === "x" ? "" : `${t!.slice(0, 2)}:${t!.slice(2)}`,
    calendar: CAL_FROM[c!]!,
    gender: g === "m" ? "male" : "female",
  };
}

export function toBirthInput(p: Person): BirthInput {
  const tm = /^(\d{1,2}):(\d{2})$/.exec(p.time);
  return {
    year: p.year,
    month: p.month,
    day: p.day,
    calendar: p.calendar,
    gender: p.gender,
    ...(tm ? { hour: Number(tm[1]), minute: Number(tm[2]) } : {}),
  };
}

const CAL_LABEL: Record<CalendarType, string> = { solar: "양력", lunar: "음력", "lunar-leap": "음력 윤달" };

export function describePerson(p: Person): string {
  return `${p.year}. ${pad(p.month)}. ${pad(p.day)} ${CAL_LABEL[p.calendar]} · ${p.time || "시간 모름"} · ${p.gender === "male" ? "남" : "여"}`;
}

/** 이름이 있으면 "OO님", 없으면 "당신" */
export const callName = (p: Person) => (p.name.trim() ? `${p.name.trim()}님` : "당신");
