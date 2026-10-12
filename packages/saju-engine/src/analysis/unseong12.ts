import { mod, stemIsYang } from "../constants/ganji.js";

export const UNSEONG12 = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"] as const;

/** 천간별 장생 지지: 甲亥 乙午 丙寅 丁酉 戊寅 己酉 庚巳 辛子 壬申 癸卯 */
const JANGSAENG = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];

/** 천간이 지지에서 갖는 12운성. 양간은 순행, 음간은 역행 */
export function unseong12(stem: number, branch: number): string {
  const start = JANGSAENG[stem]!;
  const step = stemIsYang(stem) ? branch - start : start - branch;
  return UNSEONG12[mod(step, 12)]!;
}
