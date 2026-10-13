"use client";

import { BRANCHES, STEMS, stemElement, type PillarKey } from "@saju/engine";
import { buildSajuReading, toAiRequest } from "@saju/reading";
import { OhaengPentagon } from "@/components/chart/OhaengPentagon";
import { PillarSlab } from "@/components/chart/PillarSlab";
import { Byeongpung } from "@/components/ink/Byeongpung";
import { AiReading } from "@/components/reading/AiReading";
import { Chapters } from "@/components/reading/Chapters";
import { ShareCardButton } from "@/components/reading/ShareCardButton";
import { callName } from "@/lib/birth";
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
            <ShareCardButton
              filename={`mukyeon-${chart.pillars.day.hangul}.png`}
              data={{
                kind: "pillars",
                title: r.headline,
                subline: r.subline,
                columns: (["hour", "day", "month", "year"] as PillarKey[]).map((k) => {
                  const p = chart.pillars[k];
                  return { label: { hour: "時", day: "日", month: "月", year: "年" }[k], stem: p ? STEMS[p.stem]! : null, branch: p ? BRANCHES[p.branch]! : null, isDay: k === "day" };
                }),
                footnote: `${callName(s!.person)}의 사주명식`,
              }}
            />
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
