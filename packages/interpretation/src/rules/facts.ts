import {
  ELEMENTS_KO,
  STEMS,
  sipsinOfBranch,
  sipsinOfStem,
  stemElement,
  yearGanji,
  type Chart,
  type Pillar,
} from "@saju/engine";
import { ILGAN, type IlganRule } from "./ilgan.js";
import { ILJU, type IljuRule } from "./ilju.js";
import { GROUP_OF, type SipsinGroup } from "./sipsin.js";

const GROUPS: SipsinGroup[] = ["비겁", "식상", "재성", "관성", "인성"];

export interface LuckFact {
  age: number;
  hanja: string;
  hangul: string;
  stemSipsin: string;
  branchSipsin: string;
  groups: SipsinGroup[];
}

/** 해석의 근거가 되는 사실 묶음. 룰 기반 해석과 LLM 프롬프트가 같은 사실을 공유한다. */
export interface ChartFacts {
  dayMaster: { hanja: string; elementName: string; rule: IlganRule };
  ilju: { hanja: string; hangul: string; rule: IljuRule };
  ohaeng: { counts: number[]; strong: number[]; lacking: number[] };
  groups: Record<SipsinGroup, number>;
  dominant: SipsinGroup[];
  missing: SipsinGroup[];
  /** 간이 신강·신약 판정 (월지 가중) */
  strength: "강" | "중" | "약";
  periods: { early: LuckFact[]; middle: LuckFact[]; late: LuckFact[] };
  currentDaeun: LuckFact | null;
  seun: LuckFact & { year: number };
  ageInTargetYear: number;
}

function luckFact(dayStem: number, age: number, p: Pillar): LuckFact {
  const stemSipsin = sipsinOfStem(dayStem, p.stem);
  const branchSipsin = sipsinOfBranch(dayStem, p.branch);
  const groups = [...new Set([GROUP_OF[stemSipsin]!, GROUP_OF[branchSipsin]!])];
  return { age, hanja: p.hanja, hangul: p.hangul, stemSipsin, branchSipsin, groups };
}

export function buildFacts(chart: Chart, targetYear: number): ChartFacts {
  const { pillars, analysis, daeun } = chart;
  const dayStem = pillars.day.stem;

  // 십신 갈래별 개수 (일간 제외, 지지는 정기 기준)
  const groups = Object.fromEntries(GROUPS.map((g) => [g, 0])) as Record<SipsinGroup, number>;
  for (const k of ["year", "month", "day", "hour"] as const) {
    const s = analysis.sipsin[k];
    if (!s) continue;
    if (k !== "day") groups[GROUP_OF[s.stem]!]++;
    groups[GROUP_OF[s.branch]!]++;
  }
  const max = Math.max(...Object.values(groups));
  const dominant = GROUPS.filter((g) => groups[g] === max && max >= 2);
  const missing = GROUPS.filter((g) => groups[g] === 0);

  // 간이 신강·신약: 비겁·인성 개수 + 월지가 비겁·인성이면 가중
  const monthBranchGroup = GROUP_OF[analysis.sipsin.month!.branch]!;
  const support = groups.비겁 + groups.인성 + (monthBranchGroup === "비겁" || monthBranchGroup === "인성" ? 1 : 0);
  const strength = support >= 5 ? "강" : support <= 2 ? "약" : "중";

  const counts = analysis.ohaeng;
  const luck = daeun.list.map((d) => luckFact(dayStem, d.age, d.pillar));
  const ageInTargetYear = targetYear - chart.solarDate.year;
  const currentDaeun = [...luck].reverse().find((d) => d.age <= ageInTargetYear) ?? null;

  return {
    dayMaster: { hanja: STEMS[dayStem]!, elementName: ELEMENTS_KO[stemElement(dayStem)]!, rule: ILGAN[dayStem]! },
    ilju: { hanja: pillars.day.hanja, hangul: pillars.day.hangul, rule: ILJU[pillars.day.hanja]! },
    ohaeng: {
      counts,
      strong: counts.flatMap((n, i) => (n >= 3 ? [i] : [])),
      lacking: counts.flatMap((n, i) => (n === 0 ? [i] : [])),
    },
    groups,
    dominant,
    missing,
    strength,
    periods: {
      early: luck.filter((d) => d.age < 20),
      middle: luck.filter((d) => d.age >= 20 && d.age < 50),
      late: luck.filter((d) => d.age >= 50 && d.age < 80),
    },
    currentDaeun,
    seun: { ...luckFact(dayStem, ageInTargetYear, yearGanji(targetYear)), year: targetYear },
    ageInTargetYear,
  };
}
