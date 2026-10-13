"use client";

import { todayKst } from "@saju/engine";
import { buildTodayReading, toAiRequest } from "@saju/reading";
import { useState } from "react";
import { IljinCalendar } from "@/components/chart/IljinCalendar";
import { AiReading } from "@/components/reading/AiReading";
import { Chapters } from "@/components/reading/Chapters";
import { menuOf } from "@/lib/menus";
import { ResultShell } from "./ResultShell";

const DAY_MS = 86_400_000;
const shift = (d: { year: number; month: number; day: number }, n: number) => {
  const t = new Date(Date.UTC(d.year, d.month - 1, d.day) + n * DAY_MS);
  return { year: t.getUTCFullYear(), month: t.getUTCMonth() + 1, day: t.getUTCDate() };
};
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const diffDays = (a: { year: number; month: number; day: number }, b: { year: number; month: number; day: number }) =>
  Math.round((Date.UTC(a.year, a.month - 1, a.day) - Date.UTC(b.year, b.month - 1, b.day)) / DAY_MS);

export function TodayResult() {
  const menu = menuOf("today");
  const [offset, setOffset] = useState(0);
  const base = todayKst();
  const date = shift(base, offset);
  const dow = WEEK[new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay()];

  return (
    <ResultShell menu={menu} caption={() => "오늘의 일진"}>
      {([s]) => {
        const r = buildTodayReading(s!.chart, date);
        return (
          <>
            <nav className="flex items-center justify-between font-sans text-sm" aria-label="날짜 이동">
              <button type="button" onClick={() => setOffset((o) => o - 1)} className="px-2 py-1 text-ink-soft hover:text-seal">
                ← 어제
              </button>
              <span className="tabular-nums">
                {date.month}월 {date.day}일 ({dow}){offset === 0 ? " · 오늘" : ""}
              </span>
              <button type="button" onClick={() => setOffset((o) => o + 1)} className="px-2 py-1 text-ink-soft hover:text-seal">
                내일 →
              </button>
            </nav>

            {/* 부적처럼 세로로 긴 한 장 */}
            <article key={`card-${offset}`} className="hanji-sheet ink-in relative mx-auto flex w-full max-w-xs flex-col items-center gap-4 rounded-sm px-6 pt-8 pb-7 text-center">
              <span className="absolute inset-2 border border-seal/40" aria-hidden="true" />
              <span className="font-sans text-[10px] tracking-[0.4em] text-ink-soft">日 辰</span>
              <span className="brush font-brush text-[64px] leading-none [writing-mode:vertical-rl]">{r.iljin.hanja}</span>
              <span className="seal-mark stamp-in grid size-14 place-items-center font-brush text-2xl" style={{ animationDelay: ".9s" }}>
                {r.score}
              </span>
              <p className="text-[15px] leading-7 font-bold text-balance">{r.headline}</p>
              <p className="font-sans text-[11px] text-ink-soft">
                색 {r.lucky.color} · {r.lucky.direction} · 숫자 {r.lucky.number}
              </p>
            </article>

            <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {r.items.map((it) => (
                <li key={it.key} className="border-t border-ink/20 py-3">
                  <p className="font-sans text-[11px] tracking-[0.3em] text-ink-soft">{it.label}</p>
                  <p className="mt-1 text-[15px] leading-7 text-ink-2">{it.text}</p>
                </li>
              ))}
            </ul>
            <p className="border-l-2 border-seal pl-3 text-[15px] leading-7">
              <b className="font-sans text-xs tracking-[0.2em] text-seal">오늘 해 볼 일 </b>
              {r.tip}
            </p>
            <IljinCalendar chart={s!.chart} selected={date} today={base} onSelect={(d) => { setOffset(diffDays(d, base)); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            <Chapters chapters={r.chapters} />
            <AiReading key={`ai-${offset}`} request={toAiRequest("today", r)} label="오늘을 위한 한 편" />
          </>
        );
      }}
    </ResultShell>
  );
}
