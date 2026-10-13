import { BRANCH_ELEMENT, mod, stemElement, type Element } from "../constants/ganji.js";
import type { PillarKey, Pillars } from "../types.js";

/** 위치별 가중치. 월지(계절)가 가장 크고, 일지·시지가 그다음. 일간 자신은 제외 */
const WEIGHTS: Record<PillarKey, { stem: number; branch: number }> = {
  year: { stem: 10, branch: 10 },
  month: { stem: 10, branch: 30 },
  day: { stem: 0, branch: 15 },
  hour: { stem: 10, branch: 15 },
};

export type StrengthLabel = "극신약" | "신약" | "중화" | "신강" | "극신강";

export interface Strength {
  /** 0~100. 일간을 돕는 기운(비겁·인성)의 가중 비율 */
  score: number;
  label: StrengthLabel;
  /** 득령(월지가 돕는가) · 득지(일지가 돕는가) · 득세(나머지 글자 다수가 돕는가) */
  deukryeong: boolean;
  deukji: boolean;
  deukse: boolean;
}

/** 일간을 돕는 오행: 같은 오행(비겁) 또는 나를 생하는 오행(인성) */
const helps = (dayEl: Element, el: Element) => el === dayEl || mod(dayEl - el, 5) === 1;

/** 간이 신강·신약 판정 (표면 오행 가중합) */
export function computeStrength(p: Pillars): Strength {
  const dayEl = stemElement(p.day.stem);
  let total = 0;
  let help = 0;
  let otherTotal = 0;
  let otherHelp = 0;
  for (const k of ["year", "month", "day", "hour"] as PillarKey[]) {
    const pillar = p[k];
    if (!pillar) continue;
    const w = WEIGHTS[k];
    const parts: [number, Element, boolean][] = [
      [w.stem, stemElement(pillar.stem), true],
      [w.branch, BRANCH_ELEMENT[pillar.branch]!, false],
    ];
    for (const [weight, el, isStem] of parts) {
      if (!weight) continue;
      total += weight;
      const h = helps(dayEl, el);
      if (h) help += weight;
      const isSeasonOrSeat = !isStem && (k === "month" || k === "day");
      if (!isSeasonOrSeat) {
        otherTotal += 1;
        if (h) otherHelp += 1;
      }
    }
  }
  const score = Math.round((help / total) * 100);
  const label: StrengthLabel =
    score < 25 ? "극신약" : score < 45 ? "신약" : score <= 55 ? "중화" : score <= 75 ? "신강" : "극신강";
  return {
    score,
    label,
    deukryeong: helps(dayEl, BRANCH_ELEMENT[p.month.branch]!),
    deukji: helps(dayEl, BRANCH_ELEMENT[p.day.branch]!),
    deukse: otherHelp * 2 > otherTotal,
  };
}
