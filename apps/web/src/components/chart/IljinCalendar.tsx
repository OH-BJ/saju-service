"use client";

import type { Chart } from "@saju/engine";
import { buildTodayReading } from "@saju/reading";
import { useMemo } from "react";

export interface YMD {
  year: number;
  month: number;
  day: number;
}

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const sameDay = (a: YMD, b: YMD) => a.year === b.year && a.month === b.month && a.day === b.day;

/**
 * 이번 달 일진 달력. 칸마다 그날의 일진과 점수를 먹의 농담으로 칠한다.
 * 날짜를 누르면 그날 운세로 넘어간다.
 */
export function IljinCalendar({ chart, selected, today, onSelect }: { chart: Chart; selected: YMD; today: YMD; onSelect: (d: YMD) => void }) {
  const { year, month } = selected;
  const days = useMemo(() => {
    const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return Array.from({ length: count }, (_, i) => {
      const d = { year, month, day: i + 1 };
      const r = buildTodayReading(chart, d);
      return { d, score: r.score, iljin: r.iljin.hanja };
    });
  }, [chart, year, month]);
  const lead = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const best = days.reduce((a, b) => (b.score > a.score ? b : a), days[0]!);

  return (
    <section aria-label={`${year}년 ${month}월 일진 달력`} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 className="font-sans text-[11px] tracking-[0.4em] text-ink-soft">
          {month} 월 일 진 달 력
        </h2>
        <p className="font-sans text-[11px] text-ink-soft">
          이달 가장 순한 날 {best.d.day}일 ({best.iljin})
        </p>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid">
        {WEEK.map((w, i) => (
          <span key={w} className={`font-sans text-[10px] ${i === 0 ? "text-seal" : "text-ink-soft"}`} role="columnheader">
            {w}
          </span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`e${i}`} aria-hidden="true" />
        ))}
        {days.map(({ d, score, iljin }) => {
          // 40~90점 → 먹 농도 0.05~0.6
          const ink = Math.max(0.05, Math.min(0.6, 0.05 + ((score - 40) / 50) * 0.55));
          const isSel = sameDay(d, selected);
          const isToday = sameDay(d, today);
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => onSelect(d)}
              aria-pressed={isSel}
              aria-label={`${d.month}월 ${d.day}일 ${iljin}일, ${score}점${isToday ? ", 오늘" : ""}`}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-sm leading-none ${isSel ? "ring-2 ring-seal" : ""}`}
              style={{ background: `rgb(28 26 23 / ${ink.toFixed(2)})`, color: ink > 0.38 ? "var(--color-hanji)" : "var(--color-ink)" }}
            >
              <span className="font-sans text-[11px] tabular-nums">{d.day}</span>
              <span className="mt-0.5 font-brush text-[10px] opacity-80">{iljin}</span>
              {isToday && <span className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-seal" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <p className="font-sans text-[10px] text-ink-soft">먹이 짙을수록 내 사주에 순한 날입니다. 붉은 점은 오늘.</p>
    </section>
  );
}
