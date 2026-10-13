/**
 * 해석 문구 데이터의 형태. 모든 문구는 직접 작성한다 — 외부 서비스 문구를 옮기지 않는다.
 * 말투: 존댓말(~입니다/~해요 섞지 말고 ~입니다/~습니다), 단정·공포 조장 금지, 건강·법률·투자는 단정하지 않는다.
 */
import type { RelationType } from "@saju/engine";

/** 1 매우 조심 · 2 조심 · 3 보통 · 4 좋음 · 5 매우 좋음 */
export type Tone = 1 | 2 | 3 | 4 | 5;

/** 토정비결 괘 하나 (code = 상괘·중괘·하괘 세 자리, 111~863) */
export interface TojungGwaeText {
  code: number;
  /** 한 해를 비유하는 짧은 제목 (예: "봄비 맞은 묵은 밭") 6~14자 */
  title: string;
  tone: Tone;
  /** 올해 전체 흐름 2~3문장 */
  summary: string;
  /** 상반기·하반기 각 1문장 */
  firstHalf: string;
  secondHalf: string;
  /** 올해 지키면 좋은 한 가지 (1문장) */
  advice: string;
  keywords: [string, string, string];
}

/** 합충 등 관계 설명 */
export interface RelationText {
  /** 한 줄 정의 (용어 설명용) */
  short: string;
  /** 원국 안에 있을 때 */
  natal: string;
  /** 세운·월운·일진으로 들어와 원국과 맺을 때 */
  withLuck: string;
  /** 두 사람 사이(궁합)에서 */
  between: string;
}
export type RelationTexts = Record<RelationType, RelationText>;

/** 신살 설명 */
export interface StarText {
  short: string;
  /** 원국에 있을 때 2문장 */
  detail: string;
  /** 활용 팁 1문장 */
  tip: string;
}

/** 12운성 설명 */
export interface UnseongText {
  image: string;
  short: string;
}

/** 오늘의 운세 — 일진 천간이 일간에게 어떤 십신인지에 따라 */
export interface TodayText {
  /** 오늘을 한 줄로 (서로 다른 3가지 — 날짜에 따라 돌려 쓴다) */
  headlines: [string, string, string];
  love: string;
  wish: string;
  work: string;
  money: string;
  /** 오늘 해 볼 작은 행동 */
  tip: string;
}

/** 월운·세운 문구 — 십신 묶음 × 기운의 좋고 나쁨 */
export interface PeriodText {
  good: [string, string];
  neutral: [string, string];
  caution: [string, string];
}

/** 궁합 — 두 일간 오행 관계 (A 오행 → B 오행) */
export interface PairText {
  title: string;
  body: string;
}

/** 용어 사전 */
export interface GlossaryEntry {
  term: string;
  hanja?: string;
  body: string;
}
