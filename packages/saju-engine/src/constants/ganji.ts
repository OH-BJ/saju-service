/** 천간·지지·오행 기본 매핑표. 인덱스는 모두 0부터 (甲=0, 子=0, 木=0). */

export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const STEMS_KO = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
export const BRANCHES_KO = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export const BRANCH_ANIMALS_KO = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"] as const;

export const ELEMENTS = ["木", "火", "土", "金", "水"] as const;
export const ELEMENTS_KO = ["목", "화", "토", "금", "수"] as const;

export type Element = 0 | 1 | 2 | 3 | 4;

/** 천간 오행: 甲乙木 丙丁火 戊己土 庚辛金 壬癸水 */
export const stemElement = (s: number): Element => Math.floor(s / 2) as Element;
/** 천간 음양: 짝수 인덱스가 양(陽) */
export const stemIsYang = (s: number): boolean => s % 2 === 0;

/** 지지 오행 (표면 오행) */
export const BRANCH_ELEMENT: readonly Element[] = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

/**
 * 지장간 [여기, 중기, 정기] — 정기(마지막)가 본기.
 * 십신을 지지에 적용할 때는 정기를 쓴다 (子→癸, 午→丁, 巳→丙, 亥→壬).
 */
export const JIJANGGAN: readonly (readonly number[])[] = [
  [8, 9], // 子: 壬 癸
  [9, 7, 5], // 丑: 癸 辛 己
  [4, 2, 0], // 寅: 戊 丙 甲
  [0, 1], // 卯: 甲 乙
  [1, 9, 4], // 辰: 乙 癸 戊
  [4, 6, 2], // 巳: 戊 庚 丙
  [2, 5, 3], // 午: 丙 己 丁
  [3, 1, 5], // 未: 丁 乙 己
  [4, 8, 6], // 申: 戊 壬 庚
  [6, 7], // 酉: 庚 辛
  [7, 3, 4], // 戌: 辛 丁 戊
  [4, 0, 8], // 亥: 戊 甲 壬
];

export const mainStemOfBranch = (b: number): number => {
  const hidden = JIJANGGAN[b]!;
  return hidden[hidden.length - 1]!;
};

/** 60갑자 인덱스 (甲子=0 ... 癸亥=59) */
export const ganjiIndex = (stem: number, branch: number): number => (((6 * stem - 5 * branch) % 60) + 60) % 60;
export const mod = (n: number, m: number): number => ((n % m) + m) % m;
