import { describe, expect, it } from "vitest";
import { computeChart, type BirthInput } from "../src/index.js";

const solar = (y: number, m: number, d: number, hour?: number, minute = 0): BirthInput => ({
  year: y,
  month: m,
  day: d,
  hour,
  minute,
  calendar: "solar",
  gender: "male",
});

const hanja = (input: BirthInput, opts = {}) => {
  const p = computeChart(input, opts).pillars;
  return [p.year.hanja, p.month.hanja, p.day.hanja, p.hour?.hanja ?? null];
};

describe("일주", () => {
  it("2000-01-01은 戊午일", () => {
    expect(computeChart(solar(2000, 1, 1)).pillars.day.hanja).toBe("戊午");
  });
  it("60일 주기로 순환한다", () => {
    const a = computeChart(solar(2024, 1, 1)).pillars.day;
    const b = computeChart(solar(2024, 3, 1)).pillars.day; // 60일 뒤
    expect(b.hanja).toBe(a.hanja);
  });
});

describe("년주·월주 (절기 기준)", () => {
  // 2024 입춘: 2024-02-04 17:27 KST
  it("입춘 직전은 전년도(癸卯년 乙丑월)", () => {
    expect(hanja(solar(2024, 2, 4, 17, 0)).slice(0, 2)).toEqual(["癸卯", "乙丑"]);
  });
  it("입춘 직후는 새해(甲辰년 丙寅월)", () => {
    expect(hanja(solar(2024, 2, 4, 18, 0)).slice(0, 2)).toEqual(["甲辰", "丙寅"]);
  });
  it("양력 1월 1일은 아직 전년도", () => {
    expect(hanja(solar(1990, 1, 1))[0]).toBe("己巳");
  });
});

describe("시주", () => {
  it("甲일 子시는 甲子시", () => {
    // 2024-01-01은 甲子일 → 00:30 KST(보정 00:00)는 子시
    const c = computeChart(solar(2024, 1, 1, 0, 30));
    expect(c.pillars.day.hanja).toBe("甲子");
    expect(c.pillars.hour?.hanja).toBe("甲子");
  });
  it("kst30 보정: 23:29까지는 亥시, 23:30부터 子시", () => {
    expect(computeChart(solar(2024, 1, 2, 23, 29)).pillars.hour?.branch).toBe(11);
    expect(computeChart(solar(2024, 1, 2, 23, 30)).pillars.hour?.branch).toBe(0);
  });
  it("야자시: split은 당일 일주, unified는 다음날 일주 — 시간은 둘 다 다음날 기준", () => {
    const input = solar(2023, 12, 31, 23, 45); // 2023-12-31 癸亥일, 다음날 甲子일
    expect(hanja(input, { ziHour: "split" }).slice(2)).toEqual(["癸亥", "甲子"]);
    expect(hanja(input, { ziHour: "unified" }).slice(2)).toEqual(["甲子", "甲子"]);
  });
  it("시간을 모르면 시주 없음", () => {
    expect(computeChart(solar(1990, 1, 1)).pillars.hour).toBeNull();
  });
});

describe("시간대 이력", () => {
  it("1988 서머타임 기간은 1시간 빼서 계산 (12:00 → 보정 10:30)", () => {
    expect(computeChart(solar(1988, 7, 1, 12, 0)).correctedTime).toBe("1988-07-01 10:30");
  });
  it("UTC+8:30 시기(1958)는 시계 시각이 곧 127.5° 태양시", () => {
    expect(computeChart(solar(1958, 3, 1, 12, 0)).correctedTime).toBe("1958-03-01 12:00");
  });
});

describe("음력 입력", () => {
  it("음력 윤달을 양력으로 변환", () => {
    // 2017년 음력 윤5월 1일 = 양력 2017-06-24
    const c = computeChart({ year: 2017, month: 5, day: 1, calendar: "lunar-leap", gender: "female" });
    expect(c.solarDate).toEqual({ year: 2017, month: 6, day: 24 });
  });
  it("없는 윤달은 에러", () => {
    expect(() => computeChart({ year: 2017, month: 4, day: 1, calendar: "lunar-leap", gender: "male" })).toThrow();
  });
});

describe("분석", () => {
  const c = computeChart(solar(1990, 1, 1, 12));
  it("오행 개수 합은 8", () => {
    expect(c.analysis.ohaeng.reduce((a, b) => a + b, 0)).toBe(8);
  });
  it("일간 자리는 '일간'으로 표시", () => {
    expect(c.analysis.sipsin.day?.stem).toBe("일간");
  });
  it("대운 10개, 순역에 따라 월주에서 한 칸씩 이동", () => {
    // 己巳년(음년) 남자 → 역행. 월주 丙子 → 첫 대운 乙亥
    expect(c.daeun.forward).toBe(false);
    expect(c.daeun.list).toHaveLength(10);
    expect(c.daeun.list[0]!.pillar.hanja).toBe("乙亥");
  });
});
