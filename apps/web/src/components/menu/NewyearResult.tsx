"use client";

import { buildNewyearReading, toAiRequest } from "@saju/reading";
import { PillarSlab } from "@/components/chart/PillarSlab";
import { Byeongpung } from "@/components/ink/Byeongpung";
import { AiReading } from "@/components/reading/AiReading";
import { Chapters } from "@/components/reading/Chapters";
import { menuOf, targetYear } from "@/lib/menus";
import { ResultShell } from "./ResultShell";

/** 분야별 점수: 먹으로 그은 가로 획 */
function FieldBars({ fields }: { fields: { label: string; score: number; note: string }[] }) {
  return (
    <ul className="flex flex-col gap-3" aria-label="분야별 점수">
      {fields.map((f, i) => (
        <li key={f.label} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-3">
          <span className="text-sm font-bold">{f.label}</span>
          <span className="relative h-2.5 overflow-hidden rounded-full bg-ink/8">
            <span
              className="field-stroke absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${f.score}%`, animationDelay: `${0.3 + i * 0.12}s`, background: f.score >= 70 ? "var(--color-ink)" : f.score >= 55 ? "var(--color-ink-2)" : "var(--color-seal)" }}
            />
          </span>
          <span className="text-right font-sans text-sm tabular-nums">{f.score}</span>
        </li>
      ))}
    </ul>
  );
}

export function NewyearResult() {
  const menu = menuOf("newyear");
  const year = targetYear();
  return (
    <ResultShell menu={menu} caption={() => `${year}년의 기운`}>
      {([s]) => {
        const r = buildNewyearReading(s!.chart, year);
        const [overview, meet, fields, months] = r.chapters;
        return (
          <>
            <header className="flex items-start gap-5">
              <div className="seal-mark stamp-in grid size-20 shrink-0 place-items-center font-brush text-[34px] leading-none [writing-mode:vertical-rl]">{r.seun.hanja}</div>
              <div>
                <h1 className="brush font-brush text-[32px] leading-tight">{r.headline}</h1>
                <p className="ink-in mt-1 text-[15px] leading-7 text-ink-2" style={{ animationDelay: ".5s" }}>
                  {r.subline}
                </p>
              </div>
            </header>
            <Chapters chapters={[overview!, meet!]} />
            <FieldBars fields={r.fields} />
            <Chapters chapters={[fields!, months!]} start={2} />
            <Byeongpung panels={r.months} title={`${year} 열 두 달`} />
            <details className="font-sans text-sm text-ink-soft">
              <summary className="cursor-pointer">내 명식 보기</summary>
              <div className="mt-4">
                <PillarSlab chart={s!.chart} detail={false} />
              </div>
            </details>
            <AiReading request={toAiRequest("newyear", r)} />
          </>
        );
      }}
    </ResultShell>
  );
}
