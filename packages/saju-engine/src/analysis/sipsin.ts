import { mainStemOfBranch, mod, stemElement, stemIsYang } from "../constants/ganji.js";

/** 일간과의 관계: 0 같음, 1 내가 생함, 2 내가 극함, 3 나를 극함, 4 나를 생함 */
const NAMES: readonly [string, string][] = [
  ["비견", "겁재"],
  ["식신", "상관"],
  ["편재", "정재"],
  ["편관", "정관"],
  ["편인", "정인"],
];

/** 일간 기준 천간의 십신. 음양이 같으면 편(偏), 다르면 정(正) */
export function sipsinOfStem(dayStem: number, target: number): string {
  const relation = mod(stemElement(target) - stemElement(dayStem), 5);
  const samePolarity = stemIsYang(dayStem) === stemIsYang(target);
  return NAMES[relation]![samePolarity ? 0 : 1]!;
}

/** 일간 기준 지지의 십신 (지장간 정기 기준) */
export const sipsinOfBranch = (dayStem: number, branch: number): string =>
  sipsinOfStem(dayStem, mainStemOfBranch(branch));
