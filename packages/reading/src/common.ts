import {
  BRANCHES,
  ELEMENTS_KO,
  STEMS,
  mod,
  sipsinOfBranch,
  sipsinOfStem,
  stemElement,
  BRANCH_ELEMENT,
  type Chart,
  type Element,
  type Pillar,
  type PillarKey,
  type Relation,
} from "@saju/engine";
import { GROUP_OF, type SipsinGroup } from "./content/sipsin.js";
import type { Tone } from "./content/types.js";

export const PILLAR_NAME: Record<PillarKey, string> = { year: "년주", month: "월주", day: "일주", hour: "시주" };
export const SLOT_NAME: Record<string, string> = {
  "year.stem": "년간",
  "year.branch": "년지",
  "month.stem": "월간",
  "month.branch": "월지",
  "day.stem": "일간",
  "day.branch": "일지",
  "hour.stem": "시간",
  "hour.branch": "시지",
};
export const ELEMENT_FULL = ["목(木)", "화(火)", "토(土)", "금(金)", "수(水)"] as const;

/** 받침 유무로 조사 고르기 (한글 음절만 판단, 한자는 독음 없이 쓰지 않는다) */
export function josa(word: string, withBatchim: string, without: string): string {
  // "목(木)"처럼 괄호 한자가 붙으면 앞의 한글로 판단한다
  const base = word.replace(/\([^)]*\)$/, "");
  const last = base.charCodeAt(base.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return word + withBatchim;
  return word + ((last - 0xac00) % 28 ? withBatchim : without);
}

export const groupOf = (sipsin: string): SipsinGroup => GROUP_OF[sipsin]!;

/** 간지 한 글자의 오행 */
export const charElement = (kind: "stem" | "branch", v: number): Element => (kind === "stem" ? stemElement(v) : BRANCH_ELEMENT[v]!);

/** 운(세운·월운·일진)의 기둥 하나가 이 사주에 얼마나 반가운가 */
export function luckTone(chart: Chart, p: Pillar, relationsWithDay: Relation[] = []): Tone {
  const { yongsin, ohaeng } = chart.analysis;
  const els = [stemElement(p.stem), BRANCH_ELEMENT[p.branch]!];
  let score = 0;
  for (const el of els) {
    if (el === yongsin.element) score += 2;
    // 용신을 생해 주는 오행도 반갑다
    else if (mod(yongsin.element - el, 5) === 1) score += 1;
    // 용신을 누르는 오행, 이미 넘치는 오행은 부담
    if (mod(yongsin.element - el, 5) === 3) score -= 2;
    if (ohaeng[el]! >= 3) score -= 1;
  }
  for (const r of relationsWithDay) score += r.tone === "harmony" ? 1 : -1;
  return score >= 3 ? 5 : score >= 1 ? 4 : score === 0 ? 3 : score >= -2 ? 2 : 1;
}

export const toneKey = (t: Tone): "good" | "neutral" | "caution" => (t >= 4 ? "good" : t === 3 ? "neutral" : "caution");

export interface LuckPillarInfo {
  pillar: Pillar;
  stemSipsin: string;
  branchSipsin: string;
  groups: SipsinGroup[];
}

export function luckInfo(chart: Chart, p: Pillar): LuckPillarInfo {
  const ds = chart.pillars.day.stem;
  const stemSipsin = sipsinOfStem(ds, p.stem);
  const branchSipsin = sipsinOfBranch(ds, p.branch);
  return { pillar: p, stemSipsin, branchSipsin, groups: [...new Set([groupOf(stemSipsin), groupOf(branchSipsin)])] };
}

export const pillarLabel = (p: Pillar) => `${p.hanja}(${p.hangul})`;
export const charLabel = (kind: "stem" | "branch", v: number) => (kind === "stem" ? STEMS[v]! : BRANCHES[v]!);
export const elementName = (e: Element) => ELEMENT_FULL[e];
export const elementKo = (e: Element) => ELEMENTS_KO[e];

/** 오행별 생활 속 행운 요소 (하도 수, 색, 방향) */
export const ELEMENT_LUCK: Record<Element, { numbers: [number, number]; color: string; direction: string }> = {
  0: { numbers: [3, 8], color: "초록", direction: "동쪽" },
  1: { numbers: [2, 7], color: "붉은색", direction: "남쪽" },
  2: { numbers: [5, 10], color: "황토색", direction: "가운데(집 근처)" },
  3: { numbers: [4, 9], color: "흰색", direction: "서쪽" },
  4: { numbers: [1, 6], color: "검정·남색", direction: "북쪽" },
};

/** 날짜 등으로 문구 변형을 고를 때 쓰는 간단한 해시 */
export const pick = <T>(list: readonly T[], seed: number): T => list[mod(seed, list.length)]!;

/** 문장 끝맺음 (마지막 어절 + 문장부호) */
const ending = (t: string) => t.trim().split(/\s+/).pop() ?? "";
const sentences = (t: string) => t.split(/(?<=[.?!])\s+/).filter(Boolean);

/**
 * 후보 문장들 가운데, 뒤에 붙을 문장과 끝맺음이 겹치지 않는 것을 고른다.
 * (예: 두 문장이 모두 "어떨까요?"로 끝나는 것을 피한다.) 모두 겹치면 preferred를 쓴다.
 */
export function pickVaried(candidates: readonly string[], preferred: number, next: string): string {
  const first = sentences(next)[0] ?? next;
  const nextEnd = ending(first);
  const nextQ = first.trim().endsWith("?");
  const order = candidates.map((_, k) => (preferred + k) % candidates.length);
  for (const k of order) {
    const c = candidates[k]!;
    const last = sentences(c).pop() ?? c;
    if (ending(last) !== nextEnd && !(nextQ && last.trim().endsWith("?"))) return c;
  }
  return candidates[preferred % candidates.length]!;
}
