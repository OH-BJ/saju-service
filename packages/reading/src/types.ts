import type { Pillar } from "@saju/engine";
import type { Tone } from "./content/types.js";

export type { Tone };

/** 해석 문장 옆에 붙는 근거 칩. term이 있으면 눌러서 용어 설명을 연다 */
export interface Evidence {
  label: string;
  term?: string;
  tone?: "good" | "caution" | "neutral";
}

/** 한 장(章)의 해석 */
export interface Chapter {
  key: string;
  title: string;
  /** 문단들 */
  body: string[];
  evidence: Evidence[];
}

/** 병풍 한 폭 (대운 10년, 월운 한 달, 토정 월별) */
export interface Panel {
  /** 위 작은 글씨 (예: "30대", "3월") */
  label: string;
  /** 세로 큰 글씨 */
  pillar: Pillar;
  /** 아래 작은 글씨 */
  caption: string;
  tone: Tone;
  /** 펼쳤을 때 보여 줄 문장 */
  text: string;
  current?: boolean;
}

/** 모든 메뉴 결과가 공유하는 뼈대 */
export interface ReadingBase {
  /** 결과 맨 위 한 줄 (예: "癸酉 · 바위틈에서 솟는 샘물") */
  headline: string;
  /** 그 아래 한 문장 */
  subline: string;
  chapters: Chapter[];
  /** Gemini에 넘길 근거 요약 (이름·생년월일 없음) */
  factsForAi: string[];
}
