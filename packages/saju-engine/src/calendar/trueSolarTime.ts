import type { HourCorrection } from "../types.js";

const HOUR = 3_600_000;
export const SEOUL_LONGITUDE = 126.98;

const offsetFormatter = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", timeZoneName: "longOffset" });

/** 특정 UTC 순간의 한국 UTC 오프셋(시간). 서머타임(1948~60, 1987~88)과 UTC+8:30(1954~61) 이력은 tzdata를 따른다. */
function seoulOffsetHours(utcMs: number): number {
  const name = offsetFormatter.formatToParts(new Date(utcMs)).find((p) => p.type === "timeZoneName")?.value ?? "GMT+09:00";
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!m) return 9;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) + Number(m[3]) / 60);
}

/** 한국 시계 시각(벽시계)을 UTC epoch ms로 변환한다. */
export function seoulWallClockToUtc(y: number, mo: number, d: number, h: number, mi: number): number {
  const naive = Date.UTC(y, mo - 1, d, h, mi);
  // 오프셋이 시각에 따라 바뀌므로 두 번 수렴시킨다
  let utc = naive - seoulOffsetHours(naive - 9 * HOUR) * HOUR;
  utc = naive - seoulOffsetHours(utc) * HOUR;
  return utc;
}

/**
 * 시주·일주 계산용 보정 시각을 "UTC 필드에 담긴 지역 시각"(epoch ms)으로 반환한다.
 * 반환값은 getUTCHours() 등으로 읽는다.
 */
export function correctedLocalMs(utcMs: number, mode: HourCorrection, longitude = SEOUL_LONGITUDE): number {
  switch (mode) {
    case "kst30":
      return utcMs + 8.5 * HOUR;
    case "longitude":
      return utcMs + (longitude / 15) * HOUR;
    case "none":
      return utcMs + seoulOffsetHours(utcMs) * HOUR;
  }
}
