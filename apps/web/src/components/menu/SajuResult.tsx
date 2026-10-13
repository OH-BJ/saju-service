"use client";

import { stemElement } from "@saju/engine";
import { buildSajuReading, toAiRequest } from "@saju/reading";
import { OhaengPentagon } from "@/components/chart/OhaengPentagon";
import { PillarSlab } from "@/components/chart/PillarSlab";
import { Byeongpung } from "@/components/ink/Byeongpung";
import { AiReading } from "@/components/reading/AiReading";
import { Chapters } from "@/components/reading/Chapters";
import { menuOf, targetYear } from "@/lib/menus";
import { ResultShell } from "./ResultShell";

export function SajuResult() {
  const menu = menuOf("saju");
  return (
    <ResultShell menu={menu} caption={([s]) => `${s!.chart.pillars.day.hanja} 일주`}>
      {([s]) => {
        const chart = s!.chart;
        const r = buildSajuReading(chart, targetYear());
        const [summary, ...rest] = r.chapters;
        return (
          <>
            <header className="flex flex-col gap-2">
              <h1 className="brush font-brush text-[34px] leading-tight">{r.headline}</h1>
              <p className="ink-in text-[15px] leading-7 text-ink-2" style={{ animationDelay: ".5s" }}>
                {r.subline}
              </p>
            </header>
            <PillarSlab chart={chart} />
            {chart.correctedTime && (
              <p className="-mt-4 text-center font-sans text-[11px] text-ink-soft">시주는 태양시 {chart.correctedTime.slice(11)} 기준으로 세웠습니다.</p>
            )}
            <Chapters chapters={[summary!]} />
            <OhaengPentagon counts={chart.analysis.ohaeng} dayElement={stemElement(chart.pillars.day.stem)} yongsin={chart.analysis.yongsin.element} />
            <Chapters chapters={rest.slice(0, rest.length - 1)} start={1} />
            <Chapters chapters={rest.slice(-1)} start={rest.length} />
            <Byeongpung panels={r.daeun} title="대 운 병 풍" />
            <AiReading request={toAiRequest("saju", r)} />
          </>
        );
      }}
    </ResultShell>
  );
}
