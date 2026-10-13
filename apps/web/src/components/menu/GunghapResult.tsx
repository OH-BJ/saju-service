"use client";

import { STEMS, BRANCHES } from "@saju/engine";
import { buildGunghapReading, toAiRequest } from "@saju/reading";
import { PillarSlab } from "@/components/chart/PillarSlab";
import { AiReading } from "@/components/reading/AiReading";
import { Chapters } from "@/components/reading/Chapters";
import { callName } from "@/lib/birth";
import { menuOf } from "@/lib/menus";
import { ResultShell } from "./ResultShell";

/** 점수를 먹 원(圓)으로: 붓으로 그은 원이 점수만큼 이어진다 */
function ScoreEnso({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 140 140" className="size-36" role="img" aria-label={`궁합 점수 ${score}점`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgb(28 26 23 / .08)" strokeWidth="9" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="#1c1a17"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${(c * score) / 100} ${c}`}
        transform="rotate(-100 70 70)"
        className="enso"
        style={{ ["--c" as string]: c }}
      />
      <text x="70" y="80" textAnchor="middle" fontFamily="Song Myung, serif" fontSize="34" fill="#1c1a17">
        {score}
      </text>
    </svg>
  );
}

export function GunghapResult() {
  const menu = menuOf("gunghap");
  return (
    <ResultShell menu={menu} caption={([a, b]) => `${a!.chart.pillars.day.hanja} · ${b!.chart.pillars.day.hanja}`}>
      {([a, b]) => {
        const r = buildGunghapReading(a!.chart, b!.chart, { a: a!.person.name.trim(), b: b!.person.name.trim() });
        return (
          <>
            <header className="flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-6">
                {[a!, b!].map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="seal-mark stamp-in grid size-16 place-items-center font-brush text-[30px] leading-none [writing-mode:vertical-rl]" style={{ animationDelay: `${0.2 + i * 0.3}s` }}>
                      {STEMS[s.chart.pillars.day.stem]}
                      {BRANCHES[s.chart.pillars.day.branch]}
                    </span>
                    <span className="font-sans text-[13px] text-ink-soft">{callName(s.person, i === 0 ? "본인" : "상대")}</span>
                  </div>
                ))}
              </div>
              <ScoreEnso score={r.gunghap.score} />
              <h1 className="brush font-brush text-[28px] leading-tight" style={{ animationDelay: ".8s" }}>
                {r.bandTitle}
              </h1>
              <p className="ink-in font-sans text-[15px] text-ink-soft" style={{ animationDelay: "1s" }}>
                {r.pairTitle}
              </p>
            </header>
            <Chapters chapters={r.chapters} />
            <details className="font-sans text-[15px] text-ink-soft">
              <summary className="cursor-pointer">두 사람의 명식 보기</summary>
              <div className="mt-4 flex flex-col gap-6">
                <PillarSlab chart={a!.chart} detail={false} />
                <PillarSlab chart={b!.chart} detail={false} />
              </div>
            </details>
            <AiReading request={toAiRequest("gunghap", r)} />
          </>
        );
      }}
    </ResultShell>
  );
}
