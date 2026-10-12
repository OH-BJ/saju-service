/**
 * 운신(unsin.co.kr) 평생사주 결과와 명식 비교.
 * fixture는 tools/crawler 의 batch.py → to_fixture.py 로 생성한다.
 * 운신 폼은 시(時)를 지지 코드로만 받으므로 코드값을 정각 시각으로 보고 입력한다 (예: "12" → 12:00).
 */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { computeChart, type CalendarType } from "../src/index.js";

interface Case {
  id: string;
  note: string;
  input: { sex: "남" | "여"; birth: string; hour: string; cal: "S_C" | "L_C" | "L_L" };
  expected: { year: string; month: string; day: string; hour: string };
}

const path = new URL("./fixtures/unsin.json", import.meta.url);
const cases: Case[] = existsSync(path) ? JSON.parse(readFileSync(path, "utf-8")) : [];
const CAL: Record<Case["input"]["cal"], CalendarType> = { S_C: "solar", L_C: "lunar", L_L: "lunar-leap" };

/**
 * 운신과 의도적으로 다르게 계산하는 케이스. 근거를 남기고 엔진 값을 기대값으로 쓴다.
 * 자세한 내용은 docs/saju-rules.md 참고.
 */
const KNOWN_DIFF: Record<string, { reason: string; expected: Partial<Case["expected"]> }> = {
  c06: { reason: "1992 입동 절입 12:57 KST 이후 출생 → 亥월 (운신은 戌월)", expected: { month: "辛亥" } },
  c09: { reason: "1988 서머타임 1시간 보정 → 12:00 = 태양시 10:30 巳시 (운신은 미보정)", expected: { hour: "乙巳" } },
  c11: { reason: "음력 1995 윤8/15 = 양력 1995-10-09 (운신은 평달로 처리)", expected: { month: "丙戌", day: "癸酉" } },
};

const titled = cases.map((c) => ({
  ...c,
  title: `${c.id} ${c.note} (${c.input.birth} ${c.input.hour}시 ${c.input.cal})${KNOWN_DIFF[c.id] ? " [알려진 차이]" : ""}`,
}));

describe.skipIf(cases.length === 0)("운신 명식 일치", () => {
  it.each(titled)("$title", ({ id, input, expected: unsin }) => {
    const expected = { ...unsin, ...KNOWN_DIFF[id]?.expected };
    const [y, m, d] = input.birth.split("-").map(Number) as [number, number, number];
    const chart = computeChart({
      year: y,
      month: m,
      day: d,
      hour: input.hour === "0" ? undefined : Number(input.hour),
      calendar: CAL[input.cal],
      gender: input.sex === "남" ? "male" : "female",
    });
    const p = chart.pillars;
    expect({ year: p.year.hanja, month: p.month.hanja, day: p.day.hanja, hour: p.hour?.hanja }).toEqual(expected);
  });
});
