import { Lunar } from "lunar-javascript";

/**
 * 월의 경계가 되는 12절(節)과 해당 월지(子=0).
 * lunar-javascript 의 절기표 키(간체/병음)를 사용한다.
 */
const JIE: readonly { keys: string[]; branch: number }[] = [
  { keys: ["小寒", "XIAO_HAN"], branch: 1 },
  { keys: ["立春", "LI_CHUN"], branch: 2 },
  { keys: ["惊蛰", "JING_ZHE"], branch: 3 },
  { keys: ["清明", "QING_MING"], branch: 4 },
  { keys: ["立夏", "LI_XIA"], branch: 5 },
  { keys: ["芒种", "MANG_ZHONG"], branch: 6 },
  { keys: ["小暑", "XIAO_SHU"], branch: 7 },
  { keys: ["立秋", "LI_QIU"], branch: 8 },
  { keys: ["白露", "BAI_LU"], branch: 9 },
  { keys: ["寒露", "HAN_LU"], branch: 10 },
  { keys: ["立冬", "LI_DONG"], branch: 11 },
  { keys: ["大雪", "DA_XUE"], branch: 0 },
];

export interface JieInstant {
  /** 절입 순간 UTC epoch ms */
  utcMs: number;
  /** 이 절부터 시작되는 월지 */
  branch: number;
  /** 立春이면 사주 연도가 바뀐다 */
  isLichun: boolean;
}

const BEIJING_OFFSET_MS = 8 * 3_600_000;
const cache = new Map<number, JieInstant[]>();

/** 해당 양력 연도 1월 1일이 속한 음력 연도의 절기표에서 12절의 절입 순간을 구한다 (전후 연도 일부 포함). */
function jieOfTable(year: number): JieInstant[] {
  const cached = cache.get(year);
  if (cached) return cached;
  const table = Lunar.fromYmd(year, 1, 1).getJieQiTable();
  const out: JieInstant[] = [];
  for (const { keys, branch } of JIE) {
    for (const key of keys) {
      const s = table[key];
      if (!s) continue;
      // lunar-javascript 의 절기 시각은 베이징 시간(UTC+8)
      const utcMs =
        Date.UTC(s.getYear(), s.getMonth() - 1, s.getDay(), s.getHour(), s.getMinute(), s.getSecond()) - BEIJING_OFFSET_MS;
      out.push({ utcMs, branch, isLichun: branch === 2 });
    }
  }
  out.sort((a, b) => a.utcMs - b.utcMs);
  cache.set(year, out);
  return out;
}

/** 주어진 순간 앞뒤의 절입 목록 (시간순, 중복 제거) */
export function jieAround(utcMs: number): JieInstant[] {
  const year = new Date(utcMs).getUTCFullYear();
  const merged = [...jieOfTable(year - 1), ...jieOfTable(year), ...jieOfTable(year + 1)];
  merged.sort((a, b) => a.utcMs - b.utcMs);
  return merged.filter((j, i) => i === 0 || Math.abs(j.utcMs - merged[i - 1]!.utcMs) > 60_000);
}

/** 해당 순간 직전(포함)의 절과 직후의 절 */
export function surroundingJie(utcMs: number): { prev: JieInstant; next: JieInstant } {
  const list = jieAround(utcMs);
  const idx = list.findIndex((j) => j.utcMs > utcMs);
  if (idx <= 0) throw new RangeError("절기 범위를 벗어났습니다");
  return { prev: list[idx - 1]!, next: list[idx]! };
}

/** 해당 순간의 사주 연도 (입춘 기준) */
export function sajuYear(utcMs: number): number {
  const list = jieAround(utcMs);
  const lastLichun = list.filter((j) => j.isLichun && j.utcMs <= utcMs).pop();
  if (!lastLichun) throw new RangeError("절기 범위를 벗어났습니다");
  // 입춘은 양력 2월 초이므로 입춘 순간의 연도가 곧 사주 연도
  return new Date(lastLichun.utcMs + 9 * 3_600_000).getUTCFullYear();
}
