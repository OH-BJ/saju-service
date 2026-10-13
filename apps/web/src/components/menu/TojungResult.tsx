"use client";

import { buildTojungReading, toAiRequest } from "@saju/reading";
import { Byeongpung } from "@/components/ink/Byeongpung";
import { AiReading } from "@/components/reading/AiReading";
import { Chapters } from "@/components/reading/Chapters";
import { menuOf, targetYear } from "@/lib/menus";
import { ResultShell } from "./ResultShell";

const TRIGRAM_LABEL = ["上", "中", "下"];

export function TojungResult() {
  const menu = menuOf("tojung");
  const year = targetYear();
  return (
    <ResultShell menu={menu} caption={() => `${year}년의 괘`}>
      {([s]) => {
        const r = buildTojungReading(s!.chart, year);
        const digits = [r.gwae.upper, r.gwae.middle, r.gwae.lower];
        return (
          <>
            <header className="flex flex-col items-center gap-4 text-center">
              <div className="flex gap-3" aria-label={`괘 ${r.gwae.code}`}>
                {digits.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="font-sans text-[10px] tracking-[0.3em] text-ink-soft">{TRIGRAM_LABEL[i]}</span>
                    <span className={`stamp-in grid size-16 place-items-center font-brush text-[38px] leading-none ${i === 1 ? "seal-mark" : "carved slab"}`} style={{ animationDelay: `${0.2 + i * 0.25}s` }}>
                      {d}
                    </span>
                  </div>
                ))}
              </div>
              <h1 className="brush font-brush text-[30px] leading-tight" style={{ animationDelay: "1s" }}>
                {r.text.title}
              </h1>
              <p className="ink-in max-w-sm text-[15px] leading-7 text-ink-2" style={{ animationDelay: "1.3s" }}>
                {r.text.summary}
              </p>
            </header>
            <Chapters chapters={r.chapters.slice(0, 1)} />
            <Byeongpung panels={r.months} title={`${year} 음 력 열 두 달`} />
            <Chapters chapters={r.chapters.slice(1)} start={1} />
            <AiReading request={toAiRequest("tojung", r)} />
          </>
        );
      }}
    </ResultShell>
  );
}
