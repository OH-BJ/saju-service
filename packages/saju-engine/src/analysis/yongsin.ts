import { mod, stemElement, type Element } from "../constants/ganji.js";
import type { Pillars } from "../types.js";
import type { Strength } from "./strength.js";

/** 일간 기준 오행의 역할 (십신 묶음) */
export type ElementRole = "비겁" | "식상" | "재성" | "관성" | "인성";
const ROLES: ElementRole[] = ["비겁", "식상", "재성", "관성", "인성"];

export const roleOf = (dayEl: Element, el: Element): ElementRole => ROLES[mod(el - dayEl, 5)]!;
export const elementOfRole = (dayEl: Element, role: ElementRole): Element => mod(dayEl + ROLES.indexOf(role), 5) as Element;

export interface Yongsin {
  /** 가장 필요한 오행 */
  element: Element;
  role: ElementRole;
  method: "억부" | "조후";
  /** 판단 근거 (화면 표시용 한 문장 재료) */
  reason: string;
}

/**
 * 간이 용신.
 * 1) 조후: 한겨울(亥子丑월)에 火가 없거나, 한여름(巳午未월)에 水가 없으면 그 오행을 우선한다.
 * 2) 억부: 신강하면 기운을 빼는 식상·재성·관성 중 가장 적은 것, 신약하면 인성·비겁 중 가장 적은 것.
 * 전문 감정의 격국·용신과는 다를 수 있다 (화면에 "간이"로 표시).
 */
export function computeYongsin(p: Pillars, ohaeng: number[], strength: Strength): Yongsin {
  const dayEl = stemElement(p.day.stem);
  const mb = p.month.branch;
  const winter = mb === 11 || mb === 0 || mb === 1;
  const summer = mb === 5 || mb === 6 || mb === 7;
  if (winter && ohaeng[1] === 0) {
    return { element: 1, role: roleOf(dayEl, 1), method: "조후", reason: "추운 겨울에 태어났는데 불(火)이 없어 따뜻한 기운이 먼저 필요합니다." };
  }
  if (summer && ohaeng[4] === 0) {
    return { element: 4, role: roleOf(dayEl, 4), method: "조후", reason: "더운 여름에 태어났는데 물(水)이 없어 식혀 주는 기운이 먼저 필요합니다." };
  }

  const strong = strength.score > 55;
  const candidates: ElementRole[] = strong ? ["식상", "재성", "관성"] : strength.score < 45 ? ["인성", "비겁"] : ["식상", "재성", "관성", "인성", "비겁"];
  let best = candidates[0]!;
  for (const r of candidates) {
    if (ohaeng[elementOfRole(dayEl, r)]! < ohaeng[elementOfRole(dayEl, best)]!) best = r;
  }
  const element = elementOfRole(dayEl, best);
  const reason = strong
    ? `일간의 힘이 강해(${strength.label}) 기운을 덜어 쓰는 ${best}이 필요합니다.`
    : strength.score < 45
      ? `일간의 힘이 약해(${strength.label}) 힘을 보태는 ${best}이 필요합니다.`
      : `힘이 고른 편(중화)이라 가장 부족한 ${best}을 채우면 좋습니다.`;
  return { element, role: best, method: "억부", reason };
}
