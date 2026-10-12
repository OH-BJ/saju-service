export const SECTIONS = [
  { key: "summary", title: "총평" },
  { key: "personality", title: "성격과 기질" },
  { key: "early", title: "초년운" },
  { key: "middle", title: "중년운" },
  { key: "late", title: "말년운" },
  { key: "wealth", title: "재물운" },
  { key: "love", title: "애정운" },
  { key: "career", title: "직업과 적성" },
  { key: "health", title: "건강 관리" },
  { key: "daeun", title: "대운 흐름" },
  { key: "year", title: "올해의 운세" },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];

export interface ReadingSection {
  key: SectionKey;
  title: string;
  body: string;
}

export interface Reading {
  sections: ReadingSection[];
  /** rules: 룰 기반(무료·즉시), llm: Claude 생성 */
  source: "rules" | "llm";
  model?: string;
  promptVersion: string;
  /** 해석 기준 연도 (올해의 운세) */
  targetYear: number;
  createdAt: string;
}
