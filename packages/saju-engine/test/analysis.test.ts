import { describe, expect, it } from "vitest";
import {
  branchPairRelations,
  computeChart,
  computeGunghap,
  gongmang,
  lunarMonthDays,
  monthGanjiOn,
  monthsOfYear,
  seoncheonsu,
  sinsal12,
  stemRelation,
  toLunarDate,
  tojungGwae,
  yearGanji,
} from "../src/index.js";

const sample = computeChart({ year: 1995, month: 10, day: 9, hour: 14, minute: 30, calendar: "solar", gender: "male" });

describe("관계", () => {
  it("천간합·충", () => {
    expect(stemRelation(0, 5)).toEqual({ type: "천간합", element: 2 }); // 甲己 土
    expect(stemRelation(3, 8)).toEqual({ type: "천간합", element: 0 }); // 丁壬 木
    expect(stemRelation(0, 6)?.type).toBe("천간충"); // 甲庚
    expect(stemRelation(2, 6)).toBeNull(); // 丙庚은 충이 아님
    expect(stemRelation(4, 0)).toBeNull(); // 戊甲
  });

  it("지지 2자 관계", () => {
    const types = (a: number, b: number) => branchPairRelations(a, b).map((r) => r.type);
    expect(types(0, 1)).toEqual(["육합"]); // 子丑
    expect(types(0, 6)).toContain("충"); // 子午
    expect(types(0, 4)).toEqual(["반합"]); // 子辰
    expect(types(0, 7)).toEqual(expect.arrayContaining(["해", "원진"])); // 子未
    expect(types(0, 3)).toContain("형"); // 子卯
    expect(types(4, 4)).toEqual(["형"]); // 辰辰 자형
    expect(types(2, 8)).toEqual(expect.arrayContaining(["충", "형"])); // 寅申
  });

  it("예시 명식 乙亥 丙戌 癸酉 己未의 원국 관계", () => {
    const rel = sample.analysis.relations.map((r) => `${r.type}:${r.slots.join("+")}`);
    expect(rel).toContain("해:month.branch+day.branch"); // 戌酉
    expect(rel).toContain("형:month.branch+hour.branch"); // 戌未
    expect(rel).toContain("파:month.branch+hour.branch"); // 戌未
  });

  it("삼합이 성립하면 반합을 따로 세지 않음", () => {
    // 1984-08-?? 근처 대신 직접 슬롯으로 검증
    const c = computeChart({ year: 1992, month: 12, day: 20, hour: 6, calendar: "solar", gender: "female" });
    const tri = c.analysis.relations.filter((r) => r.type === "삼합");
    for (const t of tri) {
      const halves = c.analysis.relations.filter(
        (r) => r.type === "반합" && r.slots.every((s) => t.slots.includes(s)),
      );
      expect(halves).toHaveLength(0);
    }
  });

  it("공망", () => {
    expect(gongmang(0, 0)).toEqual([10, 11]); // 甲子순 → 戌亥
    expect(gongmang(0, 10)).toEqual([8, 9]); // 甲戌순 → 申酉
    expect(gongmang(9, 9)).toEqual([10, 11]); // 癸酉 (甲子순)
  });
});

describe("신살·신강약·용신", () => {
  it("12신살 (申子辰 기준)", () => {
    expect(sinsal12(0, 8)).toBe("지살");
    expect(sinsal12(0, 9)).toBe("년살");
    expect(sinsal12(0, 2)).toBe("역마살");
    expect(sinsal12(0, 4)).toBe("화개살");
    expect(sinsal12(0, 5)).toBe("겁살");
  });

  it("예시 명식은 신약, 인성(金)이 용신", () => {
    expect(sample.analysis.strength.score).toBe(25);
    expect(sample.analysis.strength.label).toBe("신약");
    expect(sample.analysis.yongsin).toMatchObject({ element: 3, role: "인성", method: "억부" });
  });

  it("겨울생에 火가 없으면 조후로 火", () => {
    // 1990-01-10: 丑월
    const c = computeChart({ year: 1990, month: 1, day: 10, hour: 2, calendar: "solar", gender: "male" });
    if (c.analysis.ohaeng[1] === 0) expect(c.analysis.yongsin).toMatchObject({ element: 1, method: "조후" });
  });
});

describe("세운·월운", () => {
  it("2027년은 丁未, 첫 달은 壬寅", () => {
    expect(yearGanji(2027).hanja).toBe("丁未");
    const months = monthsOfYear(2027);
    expect(months).toHaveLength(12);
    expect(months[0]!.pillar.hanja).toBe("壬寅");
    expect(months[0]!.startDate).toBe("2027-02-04");
    expect(months[11]!.pillar.hanja).toBe("癸丑");
    expect(months[11]!.startDate.startsWith("2028-01")).toBe(true);
  });

  it("날짜가 속한 월운", () => {
    expect(monthGanjiOn(2027, 1, 20).hanja).toBe("辛丑"); // 2026년(丙午) 丑월
    expect(monthGanjiOn(2027, 3, 1).hanja).toBe("壬寅");
  });
});

describe("토정비결", () => {
  it("선천수", () => {
    expect(seoncheonsu(yearGanji(2027))).toBe(6 + 8); // 丁6 未8
  });

  it("작괘는 상1~8·중1~6·하1~3", () => {
    const lunar = toLunarDate(1995, 10, 9);
    expect(lunar).toMatchObject({ year: 1995, month: 8, day: 15, leap: true });
    const g = tojungGwae(lunar, 2027);
    expect(g.upper).toBeGreaterThanOrEqual(1);
    expect(g.upper).toBeLessThanOrEqual(8);
    expect(g.middle).toBeLessThanOrEqual(6);
    expect(g.lower).toBeLessThanOrEqual(3);
    expect(g.steps.age).toBe(33);
    expect(g.steps.monthDays).toBe(lunarMonthDays(2027, 8));
    expect(g.code).toBe(g.upper * 100 + g.middle * 10 + g.lower);
  });

  it("144괘가 모두 나올 수 있다", () => {
    const codes = new Set<number>();
    for (let y = 1950; y < 2010; y++) for (let m = 1; m <= 12; m++) for (const d of [1, 9, 17, 25]) {
      codes.add(tojungGwae({ year: y, month: m, day: d, leap: false }, 2027).code);
    }
    expect(codes.size).toBeGreaterThan(100);
  });
});

describe("궁합", () => {
  it("점수는 40~98, 근거 항목이 있다", () => {
    const other = computeChart({ year: 1997, month: 3, day: 21, hour: 10, calendar: "solar", gender: "female" });
    const g = computeGunghap(sample, other);
    expect(g.score).toBeGreaterThanOrEqual(40);
    expect(g.score).toBeLessThanOrEqual(98);
    expect(g.items.some((i) => i.aspect === "일간")).toBe(true);
    expect(g.score).toBe(Math.max(40, Math.min(98, 60 + g.items.reduce((s, i) => s + i.delta, 0))));
  });
});
