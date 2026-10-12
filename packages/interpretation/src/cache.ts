import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Chart } from "@saju/engine";
import type { Reading } from "./types.js";

export interface ReadingCache {
  get(key: string): Promise<Reading | null>;
  set(key: string, reading: Reading): Promise<void>;
}

/**
 * 같은 명식이면 같은 해석을 돌려주기 위한 키.
 * 이름·정확한 생일 같은 개인정보 대신 명식(간지)과 대운만 넣는다.
 */
export function readingCacheKey(chart: Chart, parts: { targetYear: number; model: string; promptVersion: string }): string {
  const p = chart.pillars;
  const material = {
    pillars: [p.year.hanja, p.month.hanja, p.day.hanja, p.hour?.hanja ?? null],
    gender: chart.input.gender,
    daeun: chart.daeun.list.map((d) => `${d.age}:${d.pillar.hanja}`),
    birthYear: chart.solarDate.year,
    ...parts,
  };
  return createHash("sha256").update(JSON.stringify(material)).digest("hex");
}

export class MemoryReadingCache implements ReadingCache {
  private map = new Map<string, Reading>();
  async get(key: string) {
    return this.map.get(key) ?? null;
  }
  async set(key: string, reading: Reading) {
    this.map.set(key, reading);
  }
}

/** 개발용 파일 캐시. 운영에서는 DB(@saju/db)나 Redis 구현으로 교체한다. */
export class FileReadingCache implements ReadingCache {
  constructor(private dir: string) {}
  async get(key: string) {
    try {
      return JSON.parse(await readFile(join(this.dir, `${key}.json`), "utf-8")) as Reading;
    } catch {
      return null;
    }
  }
  async set(key: string, reading: Reading) {
    await mkdir(this.dir, { recursive: true });
    await writeFile(join(this.dir, `${key}.json`), JSON.stringify(reading), "utf-8");
  }
}
