import { computeDaeun } from "./analysis/daeun.js";
import { countOhaeng } from "./analysis/ohaeng.js";
import { sipsinOfBranch, sipsinOfStem } from "./analysis/sipsin.js";
import { unseong12 } from "./analysis/unseong12.js";
import { toSolarDate } from "./calendar/lunar.js";
import { surroundingJie } from "./calendar/solarTerms.js";
import { correctedLocalMs, seoulWallClockToUtc } from "./calendar/trueSolarTime.js";
import { JIJANGGAN } from "./constants/ganji.js";
import { dayPillar } from "./pillars/day.js";
import { hourBranch, hourPillar } from "./pillars/hour.js";
import { monthPillar } from "./pillars/month.js";
import { yearPillar } from "./pillars/year.js";
import { findRelations, gongmang, type Slot } from "./analysis/relations.js";
import { sinsal12, specialStars } from "./analysis/sinsal.js";
import { computeStrength } from "./analysis/strength.js";
import { computeYongsin } from "./analysis/yongsin.js";
import type { BirthInput, Chart, ChartAnalysis, ChartOptions, PillarKey, Pillars } from "./types.js";

export * from "./types.js";
export * from "./constants/ganji.js";
export { UNSEONG12, unseong12 } from "./analysis/unseong12.js";
export { sipsinOfStem, sipsinOfBranch } from "./analysis/sipsin.js";
export * from "./analysis/relations.js";
export * from "./analysis/sinsal.js";
export * from "./analysis/strength.js";
export * from "./analysis/yongsin.js";
export * from "./fortune/period.js";
export * from "./fortune/tojung.js";
export * from "./fortune/gunghap.js";
export { makePillar, pillarFromIndex } from "./pillars/pillar.js";

const DEFAULT_OPTIONS: Required<ChartOptions> = { hourCorrection: "kst30", ziHour: "split" };
const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");

export function computeChart(input: BirthInput, options: ChartOptions = {}): Chart {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const solarDate = toSolarDate(input.year, input.month, input.day, input.calendar);
  const knowsHour = input.hour !== undefined;
  const warnings: string[] = [];

  // 출생 순간 (시간을 모르면 정오로 가정 — 년·월주 판단용)
  const utcMs = seoulWallClockToUtc(
    solarDate.year,
    solarDate.month,
    solarDate.day,
    knowsHour ? input.hour! : 12,
    knowsHour ? (input.minute ?? 0) : 0,
  );

  const year = yearPillar(utcMs);
  const month = monthPillar(utcMs, year.stem);

  let day;
  let hour = null;
  let correctedTime: string | null = null;
  if (knowsHour) {
    const local = new Date(correctedLocalMs(utcMs, opts.hourCorrection, input.longitude));
    correctedTime = `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
    const branch = hourBranch(local.getUTCHours(), local.getUTCMinutes());
    const isLateZi = local.getUTCHours() === 23;
    const next = new Date(local.getTime() + DAY_MS);
    const sameDay = dayPillar(local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate());
    const nextDay = dayPillar(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
    // 23시(야자시): unified → 다음날 일주 / split → 당일 일주. 시주 천간은 두 방식 모두 다음날 일간 기준
    day = isLateZi && opts.ziHour === "unified" ? nextDay : sameDay;
    hour = hourPillar(isLateZi ? nextDay.stem : sameDay.stem, branch);
  } else {
    day = dayPillar(solarDate.year, solarDate.month, solarDate.day);
  }

  const pillars: Pillars = { year, month, day, hour };

  // 절입 전후 하루 이내면 시각 오차로 년·월주가 바뀔 수 있다
  const { prev, next } = surroundingJie(utcMs);
  const nearest = Math.min(utcMs - prev.utcMs, next.utcMs - utcMs);
  if (nearest < (knowsHour ? 2 * 3_600_000 : DAY_MS)) {
    warnings.push(
      knowsHour
        ? "절입 시각과 2시간 이내라 출생 시각이 조금만 달라도 월주(입춘이면 년주)가 바뀔 수 있습니다."
        : "절입일에 태어나 출생 시각에 따라 월주(입춘이면 년주)가 달라질 수 있습니다.",
    );
  }

  return {
    input,
    solarDate,
    instantUtc: new Date(utcMs).toISOString(),
    correctedTime,
    pillars,
    analysis: analyze(pillars),
    daeun: computeDaeun(utcMs, input.gender, year.stem, month),
    warnings,
  };
}

const KEYS: PillarKey[] = ["year", "month", "day", "hour"];

/** 원국의 8글자를 관계 계산용 슬롯으로 (id = "year.stem" 등, prefix로 그룹 구분) */
export function chartSlots(p: Pillars, prefix = ""): Slot[] {
  const out: Slot[] = [];
  for (const k of KEYS) {
    const pillar = p[k];
    if (!pillar) continue;
    out.push({ id: `${prefix}${k}.stem`, kind: "stem", value: pillar.stem });
    out.push({ id: `${prefix}${k}.branch`, kind: "branch", value: pillar.branch });
  }
  return out;
}

function analyze(p: Pillars): ChartAnalysis {
  const dayStem = p.day.stem;
  const ohaeng = countOhaeng(p);
  const strength = computeStrength(p);
  const gm = gongmang(p.day.stem, p.day.branch);
  const result = {
    ohaeng,
    sipsin: {},
    jijanggan: {},
    unseong12: {},
    sinsal12: {},
    stars: specialStars(p),
    relations: findRelations(chartSlots(p)),
    gongmang: { branches: gm, at: KEYS.filter((k) => k !== "day" && p[k] && gm.includes(p[k]!.branch)) },
    strength,
    yongsin: computeYongsin(p, ohaeng, strength),
  } as ChartAnalysis;
  for (const k of KEYS) {
    const pillar = p[k];
    result.sipsin[k] = pillar
      ? { stem: k === "day" ? "일간" : sipsinOfStem(dayStem, pillar.stem), branch: sipsinOfBranch(dayStem, pillar.branch) }
      : null;
    result.jijanggan[k] = pillar ? [...JIJANGGAN[pillar.branch]!] : null;
    result.unseong12[k] = pillar ? unseong12(dayStem, pillar.branch) : null;
    result.sinsal12[k] = pillar ? sinsal12(p.year.branch, pillar.branch) : null;
  }
  return result;
}
