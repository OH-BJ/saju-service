export type CalendarType = "solar" | "lunar" | "lunar-leap";
export type Gender = "male" | "female";

/**
 * 시간 보정 방식
 * - kst30: 동경 127.5° 기준 태양시 (한국 사주 서비스의 일반적 관행, 子시 = 23:30~01:29 KST)
 * - longitude: 출생지 경도 기준 평균태양시
 * - none: 보정 없이 시계 시각 그대로
 * 서머타임·UTC+8:30 시기는 모든 방식에서 실제 UTC 시각으로 환산해 처리한다.
 */
export type HourCorrection = "kst30" | "longitude" | "none";

/**
 * 자시 처리
 * - split: 야자시(23~24시)는 당일 일주, 시주 천간은 다음날 기준 (야·조자시 구분)
 * - unified: 23시부터 다음날 일주로 계산
 */
export type ZiHourRule = "split" | "unified";

export interface BirthInput {
  year: number;
  month: number;
  day: number;
  /** 0~23, 모르면 생략 → 시주 없이 계산 */
  hour?: number;
  minute?: number;
  calendar: CalendarType;
  gender: Gender;
  /** 출생지 경도 (hourCorrection = "longitude"일 때 사용, 기본 서울 126.98) */
  longitude?: number;
}

export interface ChartOptions {
  hourCorrection?: HourCorrection;
  ziHour?: ZiHourRule;
}

export interface Pillar {
  stem: number;
  branch: number;
  /** 예: "甲子" */
  hanja: string;
  /** 예: "갑자" */
  hangul: string;
}

export interface Pillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar | null;
}

export type PillarKey = keyof Pillars;

export interface ChartAnalysis {
  /** 오행 개수 [木, 火, 土, 金, 水] — 표면 천간·지지 기준 */
  ohaeng: [number, number, number, number, number];
  /** 각 기둥의 천간·지지 십신 (일간은 "일간") */
  sipsin: Record<PillarKey, { stem: string; branch: string } | null>;
  /** 각 기둥 지지의 지장간 (천간 인덱스) */
  jijanggan: Record<PillarKey, number[] | null>;
  /** 일간 기준 각 지지의 12운성 */
  unseong12: Record<PillarKey, string | null>;
}

export interface Daeun {
  /** 순행 여부 */
  forward: boolean;
  /** 대운 시작 나이 (만 나이, 소수점 = 개월/12) */
  startAge: number;
  /** 10개 대운 */
  list: { age: number; pillar: Pillar }[];
}

export interface Chart {
  input: BirthInput;
  /** 양력으로 환산한 출생일 */
  solarDate: { year: number; month: number; day: number };
  /** 출생 순간 (UTC ISO). 시간을 모르면 해당일 정오 기준 */
  instantUtc: string;
  /** 시·일주 계산에 쓴 보정 시각 (YYYY-MM-DD HH:mm) */
  correctedTime: string | null;
  pillars: Pillars;
  analysis: ChartAnalysis;
  daeun: Daeun;
  /** 절입일 등 결과가 시각에 민감한 경우의 경고 */
  warnings: string[];
}
