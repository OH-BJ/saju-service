import { BRANCHES, STEMS } from "@saju/engine";

export const pillarFromIndexForTest = (i: number) => STEMS[i % 10]! + BRANCHES[i % 12]!;
