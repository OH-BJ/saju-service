import { computeChart } from "@saju/engine";
import { describe, expect, it } from "vitest";
import {
  buildGunghapReading,
  buildNewyearReading,
  buildSajuReading,
  buildTodayReading,
  buildTojungReading,
  fillNames,
  josa,
  toAiRequest,
} from "../src/index.js";
import { ILJU } from "../src/content/ilju.js";
import { TOJUNG } from "../src/content/tojung.js";
import { RELATIONS } from "../src/content/relations.js";
import { TODAY } from "../src/content/today.js";

const me = computeChart({ year: 1995, month: 10, day: 9, hour: 14, minute: 30, calendar: "solar", gender: "male" });
const you = computeChart({ year: 1997, month: 3, day: 21, hour: 10, calendar: "solar", gender: "female" });
const noHour = computeChart({ year: 1988, month: 5, day: 15, calendar: "solar", gender: "female" });

const allText = (r: { headline: string; subline: string; chapters: { title: string; body: string[] }[] }) =>
  [r.headline, r.subline, ...r.chapters.flatMap((c) => [c.title, ...c.body])].join("\n");

/** 빈 값·undefined·NaN이 문장에 새지 않았는지 */
function expectClean(text: string) {
  expect(text).not.toMatch(/undefined|NaN|null|\[object/);
}

describe("문구 데이터", () => {
  it("일주 60개, 토정 144괘가 모두 있다", () => {
    expect(Object.keys(ILJU)).toHaveLength(60);
    const codes: number[] = [];
    for (let u = 1; u <= 8; u++) for (let m = 1; m <= 6; m++) for (let l = 1; l <= 3; l++) codes.push(u * 100 + m * 10 + l);
    for (const c of codes) expect(TOJUNG[c], `괘 ${c}`).toBeDefined();
    expect(new Set(codes.map((c) => TOJUNG[c]!.title)).size).toBe(144);
  });

  it("관계 11종, 십신 10종 오늘 문구", () => {
    expect(Object.keys(RELATIONS)).toHaveLength(11);
    expect(Object.keys(TODAY)).toHaveLength(10);
  });
});

describe("메뉴별 해석", () => {
  it("평생사주", () => {
    const r = buildSajuReading(me, 2027);
    expect(r.headline).toContain("癸酉");
    expect(r.chapters.map((c) => c.key)).toEqual(
      expect.arrayContaining(["summary", "personality", "strength", "relations", "stars", "wealth", "love", "career", "health", "daeun"]),
    );
    expect(r.daeun.filter((p) => p.current)).toHaveLength(1);
    expectClean(allText(r));
  });

  it("시간 모르는 사주도 풀린다", () => {
    const r = buildSajuReading(noHour, 2027);
    expectClean(allText(r));
    expect(r.factsForAi.join()).toContain("시주 모름");
  });

  it("신년운세: 2027 丁未, 12달, 점수 범위", () => {
    const r = buildNewyearReading(me, 2027);
    expect(r.seun.hanja).toBe("丁未");
    expect(r.months).toHaveLength(12);
    for (const f of r.fields) {
      expect(f.score).toBeGreaterThanOrEqual(35);
      expect(f.score).toBeLessThanOrEqual(95);
    }
    expectClean(allText(r));
  });

  it("토정비결: 괘와 음력 12달", () => {
    const r = buildTojungReading(me, 2027);
    expect(r.months).toHaveLength(12);
    expect(r.text.code).toBe(r.gwae.code);
    expect(r.birthLunar).toMatchObject({ month: 8, day: 15, leap: true });
    expectClean(allText(r));
  });

  it("궁합: 이름이 없으면 본인/상대, 조사 맞춤", () => {
    const r = buildGunghapReading(me, you, { a: "", b: "" });
    const t = allText(r);
    expect(t).not.toMatch(/\{A\}|\{B\}/);
    expect(t).not.toMatch(/상대은|상대이 |상대을/);
    expectClean(t);
    const named = buildGunghapReading(me, you, { a: "길동", b: "춘향" });
    expect(allText(named)).toContain("춘향님");
  });

  it("오늘의 운세: 날짜마다 일진이 바뀐다", () => {
    const a = buildTodayReading(me, { year: 2026, month: 10, day: 13 });
    const b = buildTodayReading(me, { year: 2026, month: 10, day: 14 });
    expect(a.iljin.hanja).not.toBe(b.iljin.hanja);
    expect(a.score).toBeGreaterThanOrEqual(40);
    expect(a.score).toBeLessThanOrEqual(92);
    expectClean(allText(a));
  });

  it("오늘의 운세는 60일 동안 거의 매일 다른 글이 나온다", () => {
    const texts = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const d = new Date(Date.UTC(2026, 10, 1) + i * 86_400_000);
      const r = buildTodayReading(me, { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() });
      texts.add(r.items.map((x) => x.text).join("|"));
      for (const it of r.items) expect(it.text.length, it.key).toBeGreaterThan(5);
    }
    expect(texts.size).toBeGreaterThanOrEqual(50);
  });

  it("월운 풀이에서 질문형 문장이 연달아 오지 않는다", () => {
    for (const c of [me, you, noHour]) {
      for (const m of buildNewyearReading(c, 2027).months) {
        expect(m.text, m.label).not.toMatch(/\?\s+[^.?!]*\?/);
      }
    }
  });

  it("신년 월운과 토정 월별 풀이는 문장을 공유하지 않는다", () => {
    const ny = buildNewyearReading(me, 2027).months.flatMap((m) => m.text.split(/(?<=[.?!])\s+/));
    const tj = new Set(buildTojungReading(me, 2027).months.flatMap((m) => m.text.split(/(?<=[.?!])\s+/)));
    expect(ny.filter((x) => tj.has(x))).toEqual([]);
  });

  it("AI 요청에는 이름·생년월일이 없다", () => {
    const req = toAiRequest("saju", buildSajuReading(me, 2027));
    const s = JSON.stringify(req);
    expect(s).not.toContain("1995");
    expect(req.facts.length).toBeLessThanOrEqual(12);
  });
});

describe("조사", () => {
  it("받침·괄호 한자", () => {
    expect(josa("목(木)", "이", "가")).toBe("목(木)이");
    expect(josa("화(火)", "이", "가")).toBe("화(火)가");
    expect(josa("상대", "은", "는")).toBe("상대는");
    expect(fillNames("{B}님은 {A}님을", "", "")).toBe("상대는 본인을");
  });
});
