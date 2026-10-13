import { mod } from "../constants/ganji.js";
import type { Element } from "../constants/ganji.js";

/**
 * 간지 관계 (합·충·형·파·해·원진).
 * 원국 안, 원국 × 세운/일진, 두 사람 명식 사이에 모두 같은 함수를 쓴다.
 */
export type RelationType =
  | "천간합"
  | "천간충"
  | "육합"
  | "삼합"
  | "반합"
  | "방합"
  | "충"
  | "형"
  | "파"
  | "해"
  | "원진";

/** 관계에 참여하는 글자 하나. id는 호출하는 쪽이 정하는 위치 이름 (예: "year", "seun", "A.day") */
export interface Slot {
  id: string;
  kind: "stem" | "branch";
  value: number;
}

export interface Relation {
  type: RelationType;
  /** 참여한 위치 id들 */
  slots: string[];
  /** 참여한 글자 값 (천간 또는 지지 인덱스) */
  values: number[];
  /** 합이 만드는 오행 (합화) */
  element?: Element;
  /** 좋은 쪽(합)인지, 부딪히는 쪽인지 */
  tone: "harmony" | "clash";
}

// 천간합: 甲己土 乙庚金 丙辛水 丁壬木 戊癸火
const STEM_HAP: Record<number, Element> = { 0: 2, 1: 3, 2: 4, 3: 0, 4: 1 };
// 지지 육합: 子丑土 寅亥木 卯戌火 辰酉金 巳申水 午未火
const YUKHAP: [number, number, Element][] = [
  [0, 1, 2],
  [2, 11, 0],
  [3, 10, 1],
  [4, 9, 3],
  [5, 8, 4],
  [6, 7, 1],
];
// 삼합 [생지, 왕지, 고지, 오행]: 申子辰水 亥卯未木 寅午戌火 巳酉丑金
export const SAMHAP: [number, number, number, Element][] = [
  [8, 0, 4, 4],
  [11, 3, 7, 0],
  [2, 6, 10, 1],
  [5, 9, 1, 3],
];
// 방합: 寅卯辰木 巳午未火 申酉戌金 亥子丑水
const BANGHAP: [number, number, number, Element][] = [
  [2, 3, 4, 0],
  [5, 6, 7, 1],
  [8, 9, 10, 3],
  [11, 0, 1, 4],
];
const PA: [number, number][] = [
  [0, 9],
  [1, 4],
  [2, 11],
  [3, 6],
  [5, 8],
  [7, 10],
];
const HAE: [number, number][] = [
  [0, 7],
  [1, 6],
  [2, 5],
  [3, 4],
  [8, 11],
  [9, 10],
];
const WONJIN: [number, number][] = [
  [0, 7],
  [1, 6],
  [2, 9],
  [3, 8],
  [4, 11],
  [5, 10],
];
// 형: 寅巳申(무은지형), 丑戌未(지세지형), 子卯(무례지형), 자형 辰午酉亥
const HYEONG_TRIPLES = [
  [2, 5, 8],
  [1, 10, 7],
];
const JAHYEONG = new Set([4, 6, 9, 11]);

const isPair = (pairs: [number, number][], a: number, b: number) =>
  pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

/** 두 천간 사이 관계 */
export function stemRelation(a: number, b: number): { type: "천간합" | "천간충"; element?: Element } | null {
  if (mod(a - b, 10) === 5) return { type: "천간합", element: STEM_HAP[Math.min(a, b) % 5] };
  // 천간충: 甲庚 乙辛 丙壬 丁癸 (같은 음양, 오행 상극). 戊己는 충이 없다
  if (Math.abs(a - b) === 6) return { type: "천간충" };
  return null;
}

/** 두 지지 사이의 2자 관계 (삼합·방합의 반합 포함) */
export function branchPairRelations(a: number, b: number): { type: RelationType; element?: Element }[] {
  const out: { type: RelationType; element?: Element }[] = [];
  if (a === b) {
    if (JAHYEONG.has(a)) out.push({ type: "형" });
    return out;
  }
  const yuk = YUKHAP.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  if (yuk) out.push({ type: "육합", element: yuk[2] });
  // 반합: 삼합 중 왕지를 포함한 두 글자
  for (const [s, w, g, el] of SAMHAP) {
    const set = new Set([a, b]);
    if (set.has(w) && (set.has(s) || set.has(g))) out.push({ type: "반합", element: el });
  }
  if (mod(a - b, 12) === 6) out.push({ type: "충" });
  if (HYEONG_TRIPLES.some((t) => t.includes(a) && t.includes(b)) || isPair([[0, 3]], a, b)) out.push({ type: "형" });
  if (isPair(PA, a, b)) out.push({ type: "파" });
  if (isPair(HAE, a, b)) out.push({ type: "해" });
  if (isPair(WONJIN, a, b)) out.push({ type: "원진" });
  return out;
}

const tone = (t: RelationType): Relation["tone"] =>
  t === "천간합" || t === "육합" || t === "삼합" || t === "반합" || t === "방합" ? "harmony" : "clash";

/**
 * 슬롯 목록 안의 모든 관계를 찾는다.
 * 3자 관계(삼합·방합·삼형)가 성립하면 그에 포함되는 반합은 따로 세지 않는다.
 * crossOnly를 주면 서로 다른 그룹(id 접두어) 사이의 관계만 반환한다 (예: 원국 × 세운).
 */
export function findRelations(slots: Slot[], crossOnly?: (a: Slot, b: Slot) => boolean): Relation[] {
  const out: Relation[] = [];
  const stems = slots.filter((s) => s.kind === "stem");
  const branches = slots.filter((s) => s.kind === "branch");

  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const a = stems[i]!;
      const b = stems[j]!;
      if (crossOnly && !crossOnly(a, b)) continue;
      const r = stemRelation(a.value, b.value);
      if (r) out.push({ ...r, slots: [a.id, b.id], values: [a.value, b.value], tone: tone(r.type) });
    }
  }

  // 3자 관계
  const triples: Relation[] = [];
  const findTriple = (group: number[], type: RelationType, element?: Element) => {
    const picked = group.map((v) => branches.filter((s) => s.value === v));
    if (picked.some((p) => p.length === 0)) return;
    const members = picked.map((p) => p[0]!);
    if (crossOnly && !members.some((m, k) => members.some((n, l) => k !== l && crossOnly(m, n)))) return;
    triples.push({
      type,
      slots: members.map((m) => m.id),
      values: group,
      ...(element !== undefined && { element }),
      tone: tone(type),
    });
  };
  for (const [s, w, g, el] of SAMHAP) findTriple([s, w, g], "삼합", el);
  for (const [a, b, c, el] of BANGHAP) findTriple([a, b, c], "방합", el);
  for (const t of HYEONG_TRIPLES) findTriple(t, "형");
  out.push(...triples);

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const a = branches[i]!;
      const b = branches[j]!;
      if (crossOnly && !crossOnly(a, b)) continue;
      for (const r of branchPairRelations(a.value, b.value)) {
        // 이미 3자 관계로 잡힌 반합·형은 중복으로 세지 않는다
        const coveredBy = triples.find(
          (t) => t.slots.includes(a.id) && t.slots.includes(b.id) && (r.type === "반합" || t.type === r.type),
        );
        if (coveredBy) continue;
        out.push({ ...r, slots: [a.id, b.id], values: [a.value, b.value], tone: tone(r.type) });
      }
    }
  }
  return out;
}

/** 공망: 일주가 속한 순(旬)에서 빠진 두 지지 */
export function gongmang(stem: number, branch: number): [number, number] {
  const start = mod(branch - stem, 12); // 해당 순의 甲이 놓인 지지
  return [mod(start + 10, 12), mod(start + 11, 12)];
}
